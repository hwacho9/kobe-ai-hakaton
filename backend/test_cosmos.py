#!/usr/bin/env python3
import os
import sys
import asyncio
import uuid
from passlib.context import CryptContext
from azure.cosmos import CosmosClient, PartitionKey, exceptions

# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cosmos DB 설정
COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_DB_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_DB_KEY")
DATABASE_NAME = os.getenv("AZURE_COSMOS_DB_DATABASE", "fan_events")
USERS_CONTAINER = "users"

# 설정 확인
print(f"Cosmos DB Endpoint: {COSMOS_ENDPOINT}")
print(f"Cosmos DB Database: {DATABASE_NAME}")


def init_cosmos_db():
    """Cosmos DB 클라이언트 초기화 및 컨테이너 생성"""
    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        print("Error: Cosmos DB credentials are missing!")
        return None, None

    try:
        # 클라이언트 초기화
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        print("Successfully connected to Cosmos DB")

        # 데이터베이스 생성 또는 가져오기
        database = client.create_database_if_not_exists(id=DATABASE_NAME)
        print(f"Database '{DATABASE_NAME}' created or retrieved")

        # 컨테이너 생성 또는 가져오기
        container_params = {
            "id": USERS_CONTAINER,
            "partition_key": PartitionKey(path="/id"),
            "offer_throughput": 400,
        }
        container = database.create_container_if_not_exists(**container_params)
        print(f"Container '{USERS_CONTAINER}' created or retrieved")

        return client, container
    except exceptions.CosmosHttpResponseError as e:
        print(f"Error initializing Cosmos DB: {str(e)}")
        return None, None


def create_test_user(container):
    """테스트 사용자 생성"""
    if not container:
        print("Error: Container is not available")
        return False

    # 고유 ID 생성
    user_id = str(uuid.uuid4())

    # 사용자 데이터 생성
    test_user = {
        "id": user_id,
        "userId": user_id,
        "username": "testuser",
        "email": "test@example.com",
        "password": pwd_context.hash("testpassword123"),
        "type": "user",
    }

    try:
        # 사용자 데이터 저장
        container.create_item(body=test_user)
        print(f"Test user created successfully with ID: {user_id}")
        print(f"Username: testuser, Email: test@example.com, Password: testpassword123")
        return True
    except exceptions.CosmosHttpResponseError as e:
        print(f"Error creating test user: {str(e)}")
        return False


def list_users(container):
    """모든 사용자 목록 조회"""
    if not container:
        print("Error: Container is not available")
        return

    try:
        query = "SELECT * FROM c WHERE c.type = 'user'"
        items = list(
            container.query_items(query=query, enable_cross_partition_query=True)
        )

        print(f"\nFound {len(items)} users:")
        for i, item in enumerate(items):
            print(f"\n--- User {i+1} ---")
            print(f"ID: {item.get('userId')}")
            print(f"Username: {item.get('username')}")
            print(f"Email: {item.get('email')}")
    except exceptions.CosmosHttpResponseError as e:
        print(f"Error listing users: {str(e)}")


if __name__ == "__main__":
    print("Testing Cosmos DB connection and user creation...")

    # Cosmos DB 초기화
    client, container = init_cosmos_db()

    if not client or not container:
        print("Failed to initialize Cosmos DB. Check your credentials.")
        sys.exit(1)

    # 테스트 사용자 생성
    if len(sys.argv) > 1 and sys.argv[1] == "--create":
        create_test_user(container)

    # 사용자 목록 조회
    list_users(container)

    print("\nTest completed.")
