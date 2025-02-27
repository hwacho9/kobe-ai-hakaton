import re
import json

import os
import base64
from openai import AzureOpenAI

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers import api, auth, artists, fan_preferences, users
from app.db.database import init_db
import datetime
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
