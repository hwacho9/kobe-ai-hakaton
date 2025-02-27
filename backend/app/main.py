import re
import json
import uuid

import os
import base64
from openai import AzureOpenAI

from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.routers import api, auth, artists, fan_preferences, users
from app.db.database import init_db, get_collection
import datetime
import random
from app.services.auth import get_current_user

endpoint = os.getenv("ENDPOINT_URL", "https://room4-open-ai.openai.azure.com/")
deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4o")
subscription_key = os.getenv("AZURE_OPENAI_API_KEY")

app = FastAPI(
    title="Kobe AI API",
    description="Backend API for Kobe AI Hackathon project",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # 로컬 개발 환경
        "http://frontend:3000",  # Docker 컨테이너 내부 접근
        "*",  # 모든 오리진 허용 (개발 중에만 사용)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize database
@app.on_event("startup")
async def startup_db_client():
    init_db()


# Include routers
app.include_router(api.router)
app.include_router(auth.router)
app.include_router(artists.router)
app.include_router(fan_preferences.router)
app.include_router(users.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Kobe AI API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint to verify API connectivity"""
    return {
        "message": "API 연결 테스트 성공!",
        "timestamp": str(datetime.datetime.now()),
    }


# 비용 계산 관련 데이터 모델
class EventItem(BaseModel):
    event_type: str
    location: str
    date: str


class CostRequestModel(BaseModel):
    artist: str
    events: List[EventItem]


# 비용 계산 헬퍼 함수
def calculate_transportation_cost(user_area: str, event_location: str) -> int:
    """사용자 지역과 이벤트 위치에 따른 교통비 계산"""
    # 일본 내 이동
    if (
        "Japan" in event_location
        or "Tokyo" in event_location
        or "Osaka" in event_location
    ):
        if user_area in ["東京", "Tokyo"] and "Tokyo" in event_location:
            return 5000  # 도쿄 내 이동
        elif user_area in ["大阪", "Osaka"] and "Osaka" in event_location:
            return 5000  # 오사카 내 이동
        else:
            return 30000  # 일본 내 다른 지역으로 이동

    # 한국으로 이동
    elif "Korea" in event_location or "Seoul" in event_location:
        return 50000  # 한국으로 이동 (항공권 + 현지 교통비)

    # 기타 해외
    else:
        return 40000  # 기타 해외 이동


def calculate_ticket_cost(event_type: str) -> int:
    """이벤트 유형에 따른 티켓 비용 계산"""
    event_type_lower = event_type.lower()

    if "live" in event_type_lower or "concert" in event_type_lower:
        return 15000  # 라이브/콘서트
    elif "meeting" in event_type_lower or "fanmeeting" in event_type_lower:
        return 12000  # 팬미팅
    elif "album" in event_type_lower:
        return 5000  # 앨범 발매 이벤트
    else:
        return 10000  # 기타 이벤트


def calculate_hotel_cost(location: str) -> int:
    """위치에 따른 숙박 비용 계산"""
    if "Tokyo" in location:
        return 20000  # 도쿄 숙박
    elif "Osaka" in location:
        return 15000  # 오사카 숙박
    elif "Seoul" in location:
        return 15000  # 서울 숙박
    else:
        return 18000  # 기타 지역 숙박


def calculate_other_cost(event_type: str) -> int:
    """이벤트 유형에 따른 기타 비용 계산"""
    event_type_lower = event_type.lower()

    if "live" in event_type_lower or "concert" in event_type_lower:
        return 10000  # 라이브/콘서트 (굿즈, 식사 등)
    elif "meeting" in event_type_lower or "fanmeeting" in event_type_lower:
        return 8000  # 팬미팅 (굿즈, 식사 등)
    elif "album" in event_type_lower:
        return 3000  # 앨범 발매 이벤트
    else:
        return 5000  # 기타 이벤트


def calculate_confidence(date_str: str) -> str:
    """날짜 문자열에 따른 신뢰도 계산"""
    try:
        # YYYY-MM 형식 처리
        if "-" in date_str:
            parts = date_str.split("-")
            if len(parts) >= 2:
                year = int(parts[0])
                month = int(parts[1])
                date = datetime.datetime(year, month, 1)
            else:
                return "低"  # 날짜 형식 오류
        else:
            # 날짜 형식을 파싱할 수 없는 경우
            return "低"  # 낮은 신뢰도

        # 현재 날짜와의 차이 계산
        now = datetime.datetime.now()
        diff_months = (date.year - now.year) * 12 + (date.month - now.month)

        # 신뢰도 결정
        if diff_months <= 3:
            return "高"  # 3개월 이내: 높은 신뢰도
        elif diff_months <= 6:
            return "中"  # 3~6개월: 중간 신뢰도
        else:
            return "低"  # 6개월 이상: 낮은 신뢰도
    except:
        return "低"  # 예외 발생 시 낮은 신뢰도


def generate_recommendation(total_cost: int, event_count: int) -> str:
    """총 비용과 이벤트 수에 따른 추천 메시지 생성"""
    avg_cost = total_cost / max(event_count, 1)

    if event_count > 1:
        if total_cost > 500000:
            return "複数のイベントに参加する予定があるため、予算を計画的に準備することをお勧めします。優先順位を決めて、最も重要なイベントに集中することも検討してください。"
        else:
            return "複数のイベントに参加する予定がありますが、総費用は比較的抑えられています。早めにチケットや宿泊先を予約すると、さらに費用を抑えられる可能性があります。"
    else:
        if avg_cost > 200000:
            return "イベントの費用が高めです。早めに予算を準備し、交通手段や宿泊先の比較検討をすることで費用を抑えられる可能性があります。"
        else:
            return "イベントの費用は標準的な範囲内です。チケットの入手方法や宿泊先について事前に調査しておくことをお勧めします。"


def generate_sample_goods(artist: str) -> List[Dict[str, Any]]:
    """아티스트에 따른 샘플 굿즈 정보 생성"""
    goods_types = ["フォトブック", "Tシャツ", "ペンライト", "キーホルダー", "ポスター"]
    release_months = ["03月", "04月", "05月", "06月"]

    # 1~3개의 굿즈 생성
    count = random.randint(1, 3)
    goods = []

    for i in range(count):
        goods_type = random.choice(goods_types)
        release_month = random.choice(release_months)
        price = random.randint(2500, 6000)

        goods.append(
            {
                "goods_id": f"g-{uuid.uuid4().hex[:8]}",
                "name": f"{artist} {goods_type}",
                "release_date": f"2025年{release_month}",
                "estimated_price": price,
            }
        )

    return goods


# 여러 이벤트의 비용을 계산하는 API
@app.post("/api/events/multiple-costs")
async def calculate_multiple_events_cost(
    request: CostRequestModel, current_user: dict = Depends(get_current_user)
):
    """
    여러 이벤트의 예상 비용을 계산합니다.
    """
    try:
        # 사용자 정보 가져오기
        user_id = current_user.get("userId")
        user_area = current_user.get("area", "東京")

        print(f"User ID: {user_id}, User Area: {user_area}")

        # 결과 데이터 구조 초기화
        result = {
            "user_id": user_id,
            "artist": request.artist,
            "calculation_date": datetime.datetime.now().isoformat(),
            "upcoming_events": [],
            "upcoming_goods": [],
            "total_estimated": 0,
            "recommendation": "",
        }

        total_cost = 0

        # 각 이벤트에 대한 비용 계산
        for event in request.events:
            # 이벤트 위치에 따른 교통비 계산
            transportation_cost = calculate_transportation_cost(
                user_area, event.location
            )

            # 이벤트 유형에 따른 티켓 비용 계산
            ticket_cost = calculate_ticket_cost(event.event_type)

            # 숙박 비용 계산
            hotel_cost = calculate_hotel_cost(event.location)

            # 기타 비용 계산 (식사, 기념품 등)
            other_cost = calculate_other_cost(event.event_type)

            # 개별 이벤트 총 비용
            event_total = transportation_cost + ticket_cost + hotel_cost + other_cost
            total_cost += event_total

            # 신뢰도 계산
            confidence = calculate_confidence(event.date)

            # 이벤트 정보 추가
            event_info = {
                "event_id": str(uuid.uuid4()),
                "event_type": event.event_type,
                "location": event.location,
                "date": event.date,
                "estimated_cost": {
                    "transportation": transportation_cost,
                    "ticket": ticket_cost,
                    "hotel": hotel_cost,
                    "other": other_cost,
                },
                "total_estimated": event_total,
                "confidence": confidence,
            }

            result["upcoming_events"].append(event_info)

        # 총 비용 업데이트
        result["total_estimated"] = total_cost

        # 추천 메시지 생성
        result["recommendation"] = generate_recommendation(
            total_cost, len(request.events)
        )

        # 굿즈 정보 추가
        result["upcoming_goods"] = generate_sample_goods(request.artist)

        return result

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"費用計算中にエラーが発生しました: {str(e)}"
        )


# 계산된 비용 데이터를 저장하는 API
@app.post("/api/events/save-cost")
async def save_cost_data(
    cost_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """
    계산된 비용 데이터를 데이터베이스에 저장합니다.
    """
    try:
        # 사용자 ID 추가
        user_id = current_user.get("userId")

        # 저장할 데이터 구성
        save_data = {
            "id": str(uuid.uuid4()),  # 문서 ID
            "user_id": user_id,
            "saved_at": datetime.datetime.now().isoformat(),
            **cost_data,
        }

        # DB에 저장 (Cosmos DB 또는 다른 데이터베이스)
        collection = await get_collection("event_costs")
        if collection:
            collection.create_item(save_data)
            print(f"Cost data saved to database for user {user_id}")
        else:
            print("No collection available, using mock mode")

        return {"message": "費用データが正常に保存されました", "id": save_data["id"]}

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"費用データの保存中にエラーが発生しました: {str(e)}",
        )


# Add your API routes here
@app.get("/api/events/upcoming")
async def get_events_upcoming(current_user: dict = Depends(get_current_user)):
    """
    Get upcoming events prediction based on user preferences.
    This endpoint requires authentication and uses the user's artist preferences
    to generate personalized event predictions.
    """
    try:
        # Get user preferences from the authenticated user
        user_preferences = current_user.get("preferences", [])
        user_area = current_user.get("area", "Unknown")
        user_content_interests = current_user.get("content_interests", [])

        if not user_preferences:
            return {
                "message": "No artist preferences found. Please update your profile with preferred artists.",
                "predicted_events": [],
            }

        # Initialize Azure OpenAI client
        client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=subscription_key,
            api_version="2024-05-01-preview",
        )

        # Prepare results for all preferred artists
        all_predictions = []

        # Get current date for filtering
        current_date = datetime.datetime.now()
        two_years_later = current_date.replace(year=current_date.year + 2)
        current_year_month = f"{current_date.year}-{current_date.month:02d}"
        max_year_month = f"{two_years_later.year}-{two_years_later.month:02d}"

        # Convert interests to event types mapping
        interest_to_event_type = {
            "アルバム": "album",
            "グッズ": "goods",
            "ファンミーティング": "meeting",
            "ライブ": "live",
        }

        # 사용자의 content_interests에 있는 관심사만 필터링
        user_event_types = []
        for interest in user_content_interests:
            if interest in interest_to_event_type:
                user_event_types.append(interest_to_event_type[interest])

        # Artist name mapping
        artist_name_map = {
            "blackpink": "BLACKPINK",
            "bts": "BTS",
            "twice": "TWICE",
            "exo": "EXO",
            "redvelvet": "Red Velvet",
            "nct": "NCT",
            "aespa": "aespa",
            "gidle": "(G)I-DLE",
            "ive": "IVE",
            "seventeen": "SEVENTEEN",
            "newjeans": "NewJeans",
            "txt": "TXT",
        }

        for preference in user_preferences:
            artist_id = preference.get("artistId")
            interests = preference.get("interests", [])

            if not artist_id or not interests:
                continue

            artist_name = artist_name_map.get(artist_id, artist_id.upper())

            # 아티스트별 관심사와 사용자 전체 관심사의 교집합만 사용
            event_types = []
            for interest in interests:
                if interest in interest_to_event_type:
                    event_type = interest_to_event_type[interest]
                    if event_type in user_event_types:
                        event_types.append(event_type)

            if not event_types:
                # 이 아티스트에 대한 관심사가 사용자의 전체 관심사와 일치하지 않으면 건너뜀
                continue

            # 이벤트 타입 문자열 생성
            event_types_str = ", ".join([f'"{et}"' for et in event_types])

            # Prepare the prompt for this artist
            chat_prompt = [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "情報を見つけるのに役立つ AI アシスタントです。現在の日付は "
                            + current_date.strftime("%Y年%m月%d日")
                            + " です。",
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{artist_name}の過去のワールドツアー、ライブ開催の頻度や過去のグッズの情報、過去のアルバムの情報、過去のファンミーティングの情報を考慮して、今後2年間（{current_year_month}から{max_year_month}まで）の予測イベントを約10個生成してください。特に以下のイベントタイプに焦点を当ててください: {', '.join(event_types)}",
                        },
                        {
                            "type": "text",
                            "text": f'"event_type"は{event_types_str}のいずれかにしてください。他のイベントタイプは含めないでください。',
                        },
                        {
                            "type": "text",
                            "text": '"location"は具体的な都市名と国名を含めてください。例えば、"Seoul, South Korea", "Tokyo, Japan", "New York, USA"など。"Global"という表現は避けてください。',
                        },
                        {
                            "type": "text",
                            "text": f"ユーザーの活動地域は「{user_area}」です。ただし、地域に基づくフィルタリングは行わないでください。",
                        },
                        {
                            "type": "text",
                            "text": "結果は以下のようにjson形式のみを出力してください",
                        },
                        {"type": "text", "text": "{"},
                        {"type": "text", "text": f'  "artist": "{artist_name}",'},
                        {"type": "text", "text": '  "predicted_events": ['},
                        {"type": "text", "text": "    {"},
                        {"type": "text", "text": '      "date": "2024-08",'},
                        {"type": "text", "text": '      "event_type": "album",'},
                        {
                            "type": "text",
                            "text": '      "location": "Seoul, South Korea",',
                        },
                        {"type": "text", "text": "    },"},
                        {"type": "text", "text": "    {"},
                        {"type": "text", "text": '      "date": "2024-10",'},
                        {"type": "text", "text": '      "event_type": "meeting",'},
                        {
                            "type": "text",
                            "text": '      "location": "Tokyo, Japan",',
                        },
                        {"type": "text", "text": "    }"},
                        {"type": "text", "text": "  ]"},
                        {"type": "text", "text": "}"},
                    ],
                },
            ]

            # Generate completion for this artist
            completion = client.chat.completions.create(
                model=deployment,
                messages=chat_prompt,
                max_tokens=1200,
                temperature=0.7,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                stream=False,
            )

            # Extract JSON from response
            response_text = completion.choices[0].message.content
            match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)

            if match:
                json_data = match.group(1)
                try:
                    parsed_data = json.loads(json_data)

                    # Filter events to ensure they are within the 2-year window and match user interests
                    if "predicted_events" in parsed_data:
                        filtered_events = []
                        for event in parsed_data["predicted_events"]:
                            if "date" in event and "event_type" in event:
                                event_date = event["date"]
                                event_type = event["event_type"]
                                # Only include events that are in the future, within 2 years, and match user interests
                                if (
                                    event_date >= current_year_month
                                    and event_date <= max_year_month
                                    and event_type in event_types
                                ):
                                    filtered_events.append(event)

                        # Limit to around 10 events
                        if len(filtered_events) > 12:
                            filtered_events = filtered_events[:10]

                        parsed_data["predicted_events"] = filtered_events

                    all_predictions.append(parsed_data)
                except json.JSONDecodeError:
                    # If JSON parsing fails, try to extract without code block markers
                    try:
                        clean_json = re.search(r"\{.*\}", response_text, re.DOTALL)
                        if clean_json:
                            parsed_data = json.loads(clean_json.group(0))

                            # Filter events to ensure they are within the 2-year window and match user interests
                            if "predicted_events" in parsed_data:
                                filtered_events = []
                                for event in parsed_data["predicted_events"]:
                                    if "date" in event and "event_type" in event:
                                        event_date = event["date"]
                                        event_type = event["event_type"]
                                        # Only include events that are in the future, within 2 years, and match user interests
                                        if (
                                            event_date >= current_year_month
                                            and event_date <= max_year_month
                                            and event_type in event_types
                                        ):
                                            filtered_events.append(event)

                                # Limit to around 10 events
                                if len(filtered_events) > 12:
                                    filtered_events = filtered_events[:10]

                                parsed_data["predicted_events"] = filtered_events

                            all_predictions.append(parsed_data)
                    except (json.JSONDecodeError, AttributeError):
                        # If all parsing attempts fail, add a basic structure
                        all_predictions.append(
                            {
                                "artist": artist_name,
                                "predicted_events": [],
                                "error": "Failed to parse prediction data",
                            }
                        )
            else:
                # If no JSON match, try to extract without code block markers
                try:
                    clean_json = re.search(r"\{.*\}", response_text, re.DOTALL)
                    if clean_json:
                        parsed_data = json.loads(clean_json.group(0))

                        # Filter events to ensure they are within the 2-year window and match user interests
                        if "predicted_events" in parsed_data:
                            filtered_events = []
                            for event in parsed_data["predicted_events"]:
                                if "date" in event and "event_type" in event:
                                    event_date = event["date"]
                                    event_type = event["event_type"]
                                    # Only include events that are in the future, within 2 years, and match user interests
                                    if (
                                        event_date >= current_year_month
                                        and event_date <= max_year_month
                                        and event_type in event_types
                                    ):
                                        filtered_events.append(event)

                            # Limit to around 10 events
                            if len(filtered_events) > 12:
                                filtered_events = filtered_events[:10]

                            parsed_data["predicted_events"] = filtered_events

                        all_predictions.append(parsed_data)
                except (json.JSONDecodeError, AttributeError):
                    # If all parsing attempts fail, add a basic structure
                    all_predictions.append(
                        {
                            "artist": artist_name,
                            "predicted_events": [],
                            "error": "Failed to parse prediction data",
                        }
                    )

        # Return all predictions
        return {
            "user_area": user_area,
            "user_content_interests": user_content_interests,
            "predictions": all_predictions,
        }

    except Exception as e:
        import traceback

        traceback.print_exc()
        return {"error": str(e), "detail": "Failed to generate event predictions"}


# Keep the original endpoint for backward compatibility
@app.get("/events/upcoming")
async def get_events_upcoming_legacy():
    # キーベースの認証を使用して Azure OpenAI Service クライアントを初期化する
    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=subscription_key,
        api_version="2024-05-01-preview",
    )

    # IMAGE_PATH = "YOUR_IMAGE_PATH"
    # encoded_image = base64.b64encode(open(IMAGE_PATH, 'rb').read()).decode('ascii')

    # チャット プロンプトを準備する
    chat_prompt = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "情報を見つけるのに役立つ AI アシスタントです。",
                }
            ],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "過去のワールドツアー、ライブ開催の頻度や過去のグッズの情報、過去のアルバムの情報、過去のファンミーティングの情報を考慮して、次のライブの日程を予測して。",
                },
                {
                    "type": "text",
                    "text": '"event_type"は"live","goods","album","meeting"のいずれかにしてください',
                },
                {
                    "type": "text",
                    "text": "結果は以下のようにjson形式のみを出力してください",
                },
                {"type": "text", "text": "{"},
                {"type": "text", "text": '  "artist": "BLACKPINK",'},
                {"type": "text", "text": '  "predicted_events": ['},
                {"type": "text", "text": "    {"},
                {"type": "text", "text": '      "date": "2025-03",'},
                {"type": "text", "text": '      "event_type": "live",'},
                {"type": "text", "text": '      "location": "Seoul",'},
                {"type": "text", "text": "    },"},
                {"type": "text", "text": "    {"},
                {"type": "text", "text": '      "date": "2025-07",'},
                {"type": "text", "text": '      "event_type": "goods",'},
                {"type": "text", "text": '      "location": "Tokyo",'},
                {"type": "text", "text": "    }"},
                {"type": "text", "text": "  ]"},
                {"type": "text", "text": "}"},
            ],
        },
        {
            "role": "assistant",
            "content": [
                {
                    "type": "text",
                    "text": '```json\n{\n  "artist": "BLACKPINK",\n  "predicted_events": [\n    {\n      "date": "2024-09",\n      "event_type": "live",\n      "location": "Seoul"\n    },\n    {\n      "date": "2024-12",\n      "event_type": "album",\n      "location": "Global"\n    },\n    {\n      "date": "2025-03",\n      "event_type": "meeting",\n      "location": "Tokyo"\n    },\n    {\n      "date": "2025-06",\n      "event_type": "goods",\n      "location": "Los Angeles"\n    }\n  ]\n}\n```',
                }
            ],
        },
    ]

    # 音声認識が有効になっている場合は音声結果を含める
    messages = chat_prompt

    # 入力候補を生成する
    completion = client.chat.completions.create(
        model=deployment,
        messages=messages,
        max_tokens=800,
        temperature=0.7,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None,
        stream=False,
    )

    # completionから実際のテキスト内容を取得
    response_text = completion.choices[0].message.content

    match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
    if match:
        json_data = match.group(1)
        parsed_data = json.loads(json_data)  # JSONとして読み込む
        # print(json.dumps(parsed_data, indent=2, ensure_ascii=False))  # 整形して表示

    return parsed_data


# 사용자의 이벤트 비용 데이터를 가져오는 API
@app.get("/api/events/user-costs")
async def get_user_event_costs(current_user: dict = Depends(get_current_user)):
    """
    사용자의 저장된 이벤트 비용 데이터를 가져옵니다.
    최신 데이터를 우선적으로 가져옵니다.
    """
    try:
        # 사용자 ID 가져오기
        user_id = current_user.get("userId")

        # DB에서 사용자 이벤트 비용 데이터 가져오기
        collection = await get_collection("event_costs")
        if not collection:
            return {"message": "데이터를 가져올 수 없습니다.", "costs": []}

        # 사용자 ID로 비용 데이터 쿼리
        query = (
            f"SELECT * FROM c WHERE c.user_id = '{user_id}' ORDER BY c.saved_at DESC"
        )
        cost_items = list(
            collection.query_items(query=query, enable_cross_partition_query=True)
        )

        # 총 예상 비용 합계 계산
        total_estimated = sum(
            item.get("total_estimated", 0)
            for item in cost_items
            if "total_estimated" in item
        )

        return {
            "costs": cost_items,
            "total_estimated": total_estimated,
            "count": len(cost_items),
        }

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"費用データの取得中にエラーが発生しました: {str(e)}",
        )
