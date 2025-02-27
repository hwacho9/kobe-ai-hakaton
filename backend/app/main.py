import re
import json

import os  
import base64
from openai import AzureOpenAI  

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import api, auth, artists, fan_preferences
from app.db.database import init_db
import datetime

endpoint = os.getenv("ENDPOINT_URL", "https://room4-open-ai.openai.azure.com/")  
deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4o")  
subscription_key = os.getenv("AZURE_OPENAI_API_KEY")  
# キーベースの認証を使用して Azure OpenAI Service クライアントを初期化する    
client = AzureOpenAI(  
    azure_endpoint=endpoint,  
    api_key=subscription_key,  
    api_version="2024-05-01-preview",
)

app = FastAPI(
    title="Kobe AI API",
    description="Backend API for Kobe AI Hackathon project",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 서버 주소
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
@app.get("/events/upcoming")
async def get_events_upcoming():        
    # IMAGE_PATH = "YOUR_IMAGE_PATH"
    # encoded_image = base64.b64encode(open(IMAGE_PATH, 'rb').read()).decode('ascii')

    #チャット プロンプトを準備する 
    chat_prompt = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "情報を見つけるのに役立つ AI アシスタントです。"
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "過去のワールドツアー、ライブ開催の頻度や過去のグッズの情報、過去のアルバムの情報、過去のファンミーティングの情報を考慮して、次のライブの日程を予測して。"
                },
                {
                    "type": "text",
                    "text": "”event_type\"は\"live\",\"goods\",\"album\",\"meeting\"のいずれかにしてください"
                },
                {
                    "type": "text",
                    "text": "結果は以下のようにjson形式のみを出力してください"
                },
                {
                    "type": "text",
                    "text": "{"
                },
                {
                    "type": "text",
                    "text": "  \"artist\": \"BLACKPINK\","
                },
                {
                    "type": "text",
                    "text": "  \"predicted_events\": ["
                },
                {
                    "type": "text",
                    "text": "    {"
                },
                {
                    "type": "text",
                    "text": "      \"date\": \"2025-03\","
                },
                {
                    "type": "text",
                    "text": "      \"event_type\": \"live\","
                },
                {
                    "type": "text",
                    "text": "      \"location\": \"Seoul\","
                },
                {
                    "type": "text",
                    "text": "    },"
                },
                {
                    "type": "text",
                    "text": "    {"
                },
                {
                    "type": "text",
                    "text": "      \"date\": \"2025-07\","
                },
                {
                    "type": "text",
                    "text": "      \"event_type\": \"goods\","
                },
                {
                    "type": "text",
                    "text": "      \"location\": \"Tokyo\","
                },
                {
                    "type": "text",
                    "text": "    }"
                },
                {
                    "type": "text",
                    "text": "  ]"
                },
                {
                    "type": "text",
                    "text": "}"
                }
            ]
        },
        {
            "role": "assistant",
            "content": [
                {
                    "type": "text",
                    "text": "```json\n{\n  \"artist\": \"BLACKPINK\",\n  \"predicted_events\": [\n    {\n      \"date\": \"2024-09\",\n      \"event_type\": \"live\",\n      \"location\": \"Seoul\"\n    },\n    {\n      \"date\": \"2024-12\",\n      \"event_type\": \"album\",\n      \"location\": \"Global\"\n    },\n    {\n      \"date\": \"2025-03\",\n      \"event_type\": \"meeting\",\n      \"location\": \"Tokyo\"\n    },\n    {\n      \"date\": \"2025-06\",\n      \"event_type\": \"goods\",\n      \"location\": \"Los Angeles\"\n    }\n  ]\n}\n```"
                }
            ]
        }
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
        stream=False
    )  

    # completionから実際のテキスト内容を取得
    response_text = completion.choices[0].message.content

    match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
    if match:
        json_data = match.group(1)
        parsed_data = json.loads(json_data)  # JSONとして読み込む
        # print(json.dumps(parsed_data, indent=2, ensure_ascii=False))  # 整形して表示
        return parsed_data
    

@app.get("/events/costs")
async def get_events_costs( region: str, event_type: str, distance: str, date: str):        
    # IMAGE_PATH = "YOUR_IMAGE_PATH"
    # encoded_image = base64.b64encode(open(IMAGE_PATH, 'rb').read()).decode('ascii')

    #チャット プロンプトを準備する 
    chat_prompt = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "情報を見つけるのに役立つ AI アシスタントです。"
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": event_type + "にかかる費用を合計してください"
                },
                {
                    "type": "text",
                    "text": "現在地は" + region + "です"
                },
                {
                    "type": "text",
                    "text": distance + "までの往復にかかる費用と宿泊する費用を合計してcostとしてください"
                },
                {
                    "type": "text",
                    "text": date + "のうちより過去に近いのものをdateとしてください"
                },
                {
                    "type": "text",
                    "text": "形式は以下のようにjson型にしてください"
                },
                {
                    "type": "text",
                    "text": "{"
                },
                {
                    "type": "text",
                    "text": "  \"date\": \"2025-03\","
                },
                {
                    "type": "text",
                    "text": "  \"money\": \"300000\","
                },
                {
                    "type": "text",
                    "text": "}"
                },
                {
                    "type": "text",
                    "text": "計算過程は省いてください"
                }
            ]
        },
        {
            "role": "assistant",
            "content": [
                {
                    "type": "text",
                    "text": "\n{\n  \"date\": \"2023-11\",\n  \"money\": \"400000\"\n}"
                }
            ]
        }
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
        stream=False
    )

    print(completion)

    # completionから実際のテキスト内容を取得
    response_text = completion.choices[0].message.content

    match = re.search(r"{\s*\"date\":.*?}", response_text, re.DOTALL)
    if match:
        json_data = match.group(0)
        parsed_data = json.loads(json_data)  # JSONとして読み込む
        # print(json.dumps(parsed_data, indent=2, ensure_ascii=False))  # 整形して表示

    return parsed_data