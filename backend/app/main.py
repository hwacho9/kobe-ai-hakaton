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
        "104.215.58.230",
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


# 여러 이벤트의 비용을 계산하는 API
@app.post("/api/events/multiple-costs")
async def calculate_multiple_events_cost(
    request: CostRequestModel, current_user: dict = Depends(get_current_user)
):
    """
    여러 이벤트의 예상 비용을 계산합니다.
    모든 비용 예측 및 추천에 OpenAI를 사용합니다.
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

        # OpenAI 클라이언트 초기화
        client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=subscription_key,
            api_version="2024-05-01-preview",
        )

        # 이벤트 항목별 비용 예측을 위한 배치 처리
        try:
            # 아티스트 정보
            artist_info = request.artist

            # 모든 이벤트에 대한 정보를 텍스트로 준비
            all_events_text = ""
            for i, event in enumerate(request.events):
                all_events_text += (
                    f"{i+1}. {event.event_type} in {event.location} on {event.date}\n"
                )

            # 비용 예측 프롬프트
            cost_prompt = [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "あなたはK-POPファンイベントの費用見積もり専門家です。ユーザーの地域と各イベントの種類、場所、日程を考慮して、正確な費用予測を提供してください。",
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"以下のイベントそれぞれについて、費用見積もりをJSON形式で作成してください。\n\n"
                            f"ユーザー地域: {user_area}\n"
                            f"アーティスト: {artist_info}\n\n"
                            f"イベント一覧:\n{all_events_text}\n\n"
                            f"各イベントについて以下の情報を含むJSONの配列を提供してください。\n"
                            f"1. 交通費 (transportation): 数値（円）\n"
                            f"2. チケット代 (ticket): 数値（円）\n"
                            f"3. 宿泊費 (hotel): 数値（円）\n"
                            f"4. その他費用 (other): 数値（円）\n"
                            f"5. 合計金額 (total): 数値（円）\n"
                            f"6. 信頼度 (confidence): 文字列（'高', '中', '低'のいずれか）\n\n"
                            f"回答は次の形式のJSONのみにしてください：\n"
                            f"[\n"
                            f"  {{\n"
                            f'    "transportation": 10000,\n'
                            f'    "ticket": 15000,\n'
                            f'    "hotel": 20000,\n'
                            f'    "other": 5000,\n'
                            f'    "total": 50000,\n'
                            f'    "confidence": "高"\n'
                            f"  }},\n"
                            f"  ...\n"
                            f"]",
                        }
                    ],
                },
            ]

            # OpenAI 요청
            cost_completion = client.chat.completions.create(
                model=deployment,
                messages=cost_prompt,
                max_tokens=800,
                temperature=0.5,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                stream=False,
            )

            # 응답 텍스트 추출
            cost_response = cost_completion.choices[0].message.content.strip()

            # JSON 형식 추출 (코드 블록이나 다른 텍스트가 포함되어 있을 수 있음)
            import re
            import json

            # JSON 형식 추출 시도
            json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cost_response)
            if json_match:
                cost_json = json_match.group(1)
            else:
                # 코드 블록이 없는 경우 전체 텍스트에서 JSON 형식 찾기
                cost_json = re.search(r"\[\s*\{.*\}\s*\]", cost_response, re.DOTALL)
                if cost_json:
                    cost_json = cost_json.group(0)
                else:
                    cost_json = cost_response

            # JSON 파싱
            try:
                cost_data = json.loads(cost_json)

                # 각 이벤트에 대한 데이터 추가
                total_cost = 0
                for i, event in enumerate(request.events):
                    if i < len(cost_data):  # 이벤트 수만큼만 처리
                        event_cost = cost_data[i]

                        # 숫자 값 명시적 변환
                        transportation = int(float(event_cost.get("transportation", 0)))
                        ticket = int(float(event_cost.get("ticket", 0)))
                        hotel = int(float(event_cost.get("hotel", 0)))
                        other = int(float(event_cost.get("other", 0)))
                        event_total = int(float(event_cost.get("total", 0)))

                        # 만약 total이 각 항목의 합과 다르다면 조정
                        calculated_total = transportation + ticket + hotel + other
                        if event_total != calculated_total:
                            event_total = calculated_total

                        # 이벤트 정보 구성
                        event_info = {
                            "event_id": str(uuid.uuid4()),
                            "event_type": event.event_type,
                            "location": event.location,
                            "date": event.date,
                            "estimated_cost": {
                                "transportation": transportation,
                                "ticket": ticket,
                                "hotel": hotel,
                                "other": other,
                            },
                            "total_estimated": event_total,
                            "confidence": event_cost.get("confidence", "中"),
                        }

                        # 이벤트 총 비용 누적
                        total_cost += event_total

                        # 결과에 이벤트 추가
                        result["upcoming_events"].append(event_info)

                # 총 비용 업데이트 (정수로 변환)
                result["total_estimated"] = int(total_cost)

            except json.JSONDecodeError as e:
                # JSON 파싱 실패 시 예비 처리
                print(f"Error parsing cost JSON: {str(e)}")
                # 기본값으로 이벤트 정보 생성
                total_cost = 0
                for event in request.events:
                    # 이벤트 유형에 따른 기본 비용 설정
                    if (
                        "live" in event.event_type.lower()
                        or "concert" in event.event_type.lower()
                    ):
                        transportation = 30000
                        ticket = 15000
                        hotel = 20000
                        other = 10000
                    elif "meeting" in event.event_type.lower():
                        transportation = 20000
                        ticket = 12000
                        hotel = 15000
                        other = 8000
                    else:
                        transportation = 10000
                        ticket = 5000
                        hotel = 0
                        other = 5000

                    event_total = transportation + ticket + hotel + other
                    total_cost += event_total

                    # 이벤트 정보 생성
                    event_info = {
                        "event_id": str(uuid.uuid4()),
                        "event_type": event.event_type,
                        "location": event.location,
                        "date": event.date,
                        "estimated_cost": {
                            "transportation": transportation,
                            "ticket": ticket,
                            "hotel": hotel,
                            "other": other,
                        },
                        "total_estimated": event_total,
                        "confidence": "低",  # 기본값으로 낮은 신뢰도 설정
                    }

                    # 결과에 이벤트 추가
                    result["upcoming_events"].append(event_info)

                # 총 비용 업데이트
                result["total_estimated"] = total_cost

            # 추천 메시지 생성
            recommendation_prompt = [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "あなたはKポップファンのための予算アドバイザーです。予算プランと節約のアドバイスを提供してください。",
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"以下のイベント情報を基に、簡潔な予算アドバイス（1-2文）を提供してください。\n\nユーザー地域: {user_area}\nアーティスト: {artist_info}\n総費用: {result['total_estimated']}円\nイベント数: {len(result['upcoming_events'])}\n\n注意: 回答は100文字以内の簡潔な推奨文（1-2文）にしてください。",
                        }
                    ],
                },
            ]

            # 추천 메시지 요청
            recommendation_completion = client.chat.completions.create(
                model=deployment,
                messages=recommendation_prompt,
                max_tokens=150,
                temperature=0.7,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                stream=False,
            )

            # 응답 텍스트 추출
            result["recommendation"] = recommendation_completion.choices[
                0
            ].message.content.strip()

            # 월별 저금 추천 계산 (6개월 기준)
            monthly_savings = int(round(result["total_estimated"] / 6))
            result["monthly_savings_suggestion"] = monthly_savings

            # 굿즈 정보 예측
            goods_prompt = [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "あなたはKポップアーティストのグッズ情報の専門家です。リアルなグッズ予測情報を提供してください。",
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f'アーティスト「{artist_info}」の今後発売される可能性があるグッズを2-3点、以下のJSON形式で予測してください。必ず以下のJSONフォーマットで、日本語で回答してください：\n[\n  {{\n    "goods_id": "g-xxxxxxxx",\n    "name": "商品名",\n    "release_date": "2025年XX月",\n    "estimated_price": 金額\n  }},\n  ...\n]',
                        }
                    ],
                },
            ]

            # 굿즈 예측 요청
            goods_completion = client.chat.completions.create(
                model=deployment,
                messages=goods_prompt,
                max_tokens=500,
                temperature=0.7,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                stream=False,
            )

            # 굿즈 정보 파싱
            goods_response = goods_completion.choices[0].message.content.strip()

            # JSON 형식 추출
            json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", goods_response)
            if json_match:
                goods_json = json_match.group(1)
            else:
                goods_json = re.search(r"\[\s*\{.*\}\s*\]", goods_response, re.DOTALL)
                if goods_json:
                    goods_json = goods_json.group(0)
                else:
                    goods_json = goods_response

            try:
                goods_data = json.loads(goods_json)

                # 각 굿즈에 고유 ID 부여 및 가격 정수 변환
                for item in goods_data:
                    if "goods_id" not in item or not item["goods_id"].startswith("g-"):
                        item["goods_id"] = f"g-{uuid.uuid4().hex[:8]}"

                    # 가격 정수 변환
                    if "estimated_price" in item:
                        item["estimated_price"] = int(float(item["estimated_price"]))

                result["upcoming_goods"] = goods_data

            except json.JSONDecodeError:
                print("Error parsing goods JSON")
                result["upcoming_goods"] = []

        except Exception as ai_error:
            print(f"OpenAI processing error: {str(ai_error)}")
            # OpenAI 처리에 실패할 경우 기본 처리 사용
            total_cost = 0

            # 이벤트별 기본 비용 계산
            for event in request.events:
                # 이벤트 유형에 따른 기본 비용 설정
                if (
                    "live" in event.event_type.lower()
                    or "concert" in event.event_type.lower()
                ):
                    transportation = 30000
                    ticket = 15000
                    hotel = 20000
                    other = 10000
                elif "meeting" in event.event_type.lower():
                    transportation = 20000
                    ticket = 12000
                    hotel = 15000
                    other = 8000
                else:
                    transportation = 10000
                    ticket = 5000
                    hotel = 0
                    other = 5000

                event_total = transportation + ticket + hotel + other
                total_cost += event_total

                # 이벤트 정보 생성
                event_info = {
                    "event_id": str(uuid.uuid4()),
                    "event_type": event.event_type,
                    "location": event.location,
                    "date": event.date,
                    "estimated_cost": {
                        "transportation": transportation,
                        "ticket": ticket,
                        "hotel": hotel,
                        "other": other,
                    },
                    "total_estimated": event_total,
                    "confidence": "低",  # 기본값으로 낮은 신뢰도 설정
                }

                # 결과에 이벤트 추가
                result["upcoming_events"].append(event_info)

            # 총 비용 업데이트
            result["total_estimated"] = total_cost

            # 기본 추천 메시지 생성
            result["recommendation"] = generate_recommendation(
                total_cost, len(request.events)
            )

            # 월별 저금 추천 계산
            result["monthly_savings_suggestion"] = int(round(total_cost / 6))

            # 빈 굿즈 리스트
            result["upcoming_goods"] = []

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
    사용자 정보에 총 예상 비용(total_estimated)과 현재 저금액(current_savings)도 업데이트합니다.
    """
    try:
        # 사용자 ID 추가
        user_id = current_user.get("userId")

        # 데이터베이스에 저장할 원본 데이터 유지 (깊은 복사 사용)
        import copy

        original_cost_data = copy.deepcopy(cost_data)

        # 원본 데이터 로깅
        print(f"Original data from frontend: {json.dumps(original_cost_data)}")

        # 동일한 데이터가 이미 저장됐는지 확인
        collection = await get_collection("event_costs")
        if collection:
            # 최근 1시간 이내 동일한 아티스트와 이벤트 수의 저장 데이터 확인
            one_hour_ago = (
                datetime.datetime.now() - datetime.timedelta(hours=1)
            ).isoformat()
            artist = cost_data.get("artist", "")
            event_count = len(cost_data.get("upcoming_events", []))

            query = f"""
            SELECT * FROM c 
            WHERE c.user_id = '{user_id}' 
            AND c.artist = '{artist}' 
            AND ARRAY_LENGTH(c.upcoming_events) = {event_count}
            AND c.saved_at > '{one_hour_ago}'
            """

            existing_items = list(
                collection.query_items(query=query, enable_cross_partition_query=True)
            )

            if existing_items:
                print(
                    f"Found existing cost data for user {user_id} and artist {artist}. Skipping save."
                )
                return {
                    "message": "既存の費用データが見つかりました。重複保存はスキップされました。",
                    "id": existing_items[0]["id"],
                }

        # 저장할 데이터 구성 (ID 재생성)
        save_data = {
            "id": str(uuid.uuid4()),  # 문서 ID
            "user_id": user_id,
            "saved_at": datetime.datetime.now().isoformat(),
            **original_cost_data,  # 원본 데이터 사용
        }

        # 저장 전 데이터 확인 로그
        print(f"Saving cost data to database: {json.dumps(save_data)}")

        # 특정 이벤트 필드 로깅 (문제 디버깅을 위해)
        for idx, event in enumerate(save_data.get("upcoming_events", [])):
            print(f"Event {idx + 1}:")
            print(f"  - event_id: {event.get('event_id')}")
            print(f"  - event_type: {event.get('event_type')}")
            print(f"  - location: {event.get('location')}")
            print(f"  - hotel cost: {event.get('estimated_cost', {}).get('hotel')}")
            print(f"  - total_estimated: {event.get('total_estimated')}")

        # DB에 저장
        if collection:
            collection.create_item(save_data)
            print(f"Cost data saved to database for user {user_id}")
        else:
            print("No collection available, using mock mode")

        # 사용자 정보에 총 예상 비용과 저금액 업데이트
        try:
            # 총 예상 비용 가져오기
            total_estimated = cost_data.get("total_estimated", 0)
            # 명시적 형변환 없이 원본 값 유지

            # 사용자 컬렉션 가져오기
            users_collection = await get_collection("users")
            if users_collection:
                # 사용자 문서 쿼리
                query = f"SELECT * FROM c WHERE c.userId = '{user_id}'"
                user_items = list(
                    users_collection.query_items(
                        query=query, enable_cross_partition_query=True
                    )
                )

                if user_items:
                    user_doc = user_items[0]

                    # 현재 예상 비용 가져오기
                    current_total = user_doc.get("total_estimated_expenses", 0)
                    # 명시적 형변환 없이 원본 합계 계산
                    new_total = current_total + total_estimated

                    # 사용자 문서 업데이트
                    user_doc["total_estimated_expenses"] = new_total

                    # 저금액이 없는 경우 초기화
                    if "current_savings" not in user_doc:
                        user_doc["current_savings"] = 0

                    # 월별 저금 제안 추가 (계산된 경우)
                    if "monthly_savings_suggestion" in cost_data:
                        user_doc["monthly_savings_suggestion"] = cost_data[
                            "monthly_savings_suggestion"
                        ]

                    # 사용자 문서 업데이트
                    users_collection.replace_item(user_doc["id"], user_doc)
                    print(
                        f"Updated user {user_id} with total expenses: {new_total} and monthly savings: {user_doc.get('monthly_savings_suggestion')}"
                    )
                else:
                    print(f"User {user_id} not found in users collection")
            else:
                print("Users collection not available")
        except Exception as user_update_error:
            print(f"Error updating user info: {str(user_update_error)}")

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
