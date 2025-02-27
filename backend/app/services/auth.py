import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.db.database import db_service
from app.models.user import User, UserCreate

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure JWT
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


def verify_password(plain_password, hashed_password):
    """Verify a password against a hash."""
    logger.debug(f"비밀번호 검증 시도")
    if not hashed_password:
        logger.warning("저장된 비밀번호가 없습니다")
        return False

    try:
        result = pwd_context.verify(plain_password, hashed_password)
        logger.debug(f"비밀번호 검증 결과: {result}")
        return result
    except Exception as e:
        logger.error(f"비밀번호 검증 중 오류 발생: {str(e)}")
        return False


def get_password_hash(password):
    """Hash a password."""
    logger.debug("비밀번호 해싱 시도")
    try:
        hashed = pwd_context.hash(password)
        logger.debug("비밀번호 해싱 성공")
        return hashed
    except Exception as e:
        logger.error(f"비밀번호 해싱 중 오류 발생: {str(e)}")
        raise


async def authenticate_user(email: str, password: str):
    """Authenticate a user by email and password."""
    logger.info(f"사용자 인증 시도: {email}")
    try:
        # In a real application, you would query the database by email
        # For now, we'll just iterate through all users
        users = await db_service.get_all_users()
        logger.debug(f"전체 사용자 수: {len(users)}")

        user = next((u for u in users if u.get("email") == email), None)

        if not user:
            logger.warning(f"사용자를 찾을 수 없음: {email}")
            return False

        logger.info(f"사용자 찾음: {email}, 비밀번호 검증 시도")

        # 비밀번호 필드 확인
        if "password" not in user:
            logger.error(f"사용자 {email}의 비밀번호 필드가 없습니다")
            return False

        if not verify_password(password, user.get("password")):
            logger.warning(f"비밀번호 불일치: {email}")
            return False

        logger.info(f"인증 성공: {email}")
        return user
    except Exception as e:
        logger.error(f"인증 과정 중 오류 발생: {str(e)}")
        raise


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get the current user from a JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception

    user = await db_service.get_user(token_data.user_id)
    if user is None:
        raise credentials_exception
    return user


async def register_user(user_data: UserCreate):
    """Register a new user."""
    # Skip checking for existing users due to Cosmos DB issues
    # users = await db_service.get_all_users()
    # if any(u.get("email") == user_data.email for u in users):
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
    #     )

    # Create user object
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_data.password)
    user = User(**user_dict)

    # Save user to database
    created_user = await db_service.create_user(user.dict())

    # Remove password from response
    if "password" in created_user:
        del created_user["password"]

    return created_user


async def update_user_info(user_id: str, user_info):
    """Update user with additional information after registration."""
    try:
        # Get current user
        user = await db_service.get_user(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")

        # Prepare update data
        update_data = {
            "area": user_info.area,
            "content_interests": user_info.content_interests,
            "preferences": [],
        }

        # Add artist preferences
        for artist_id in user_info.preferred_artists:
            update_data["preferences"].append(
                {"artistId": artist_id, "interests": user_info.content_interests}
            )

        # Update user in database
        updated_user = await db_service.update_user(user_id, update_data)

        return updated_user
    except Exception as e:
        logger.error(f"Error updating user {user_id} with additional info: {str(e)}")
        raise
