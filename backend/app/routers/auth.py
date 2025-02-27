from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import logging
import traceback
from app.models.user import User, UserCreate, UserUpdate, UserLogin
from app.services.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    register_user,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    update_user_info,
)
from pydantic import BaseModel
from typing import List, Optional

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
    responses={401: {"description": "Unauthorized"}},
)


# 추가 정보 업데이트를 위한 모델
class UserAdditionalInfo(BaseModel):
    area: str
    content_interests: List[str]  # 앨범, 굿즈, 팬미팅, 라이브 등
    preferred_artists: List[str]  # 아티스트 ID 목록


@router.post("/register", response_model=dict)
async def create_user(user_data: UserCreate):
    """Register a new user."""
    try:
        logger.info(f"회원가입 시도: {user_data.email}")
        user = await register_user(user_data)

        # Generate token for the newly registered user
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["userId"]}, expires_delta=access_token_expires
        )

        logger.info(f"회원가입 성공 및 토큰 발급: {user_data.email}")

        # Return user data and token
        return {**user, "access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        error_msg = f"회원가입 처리 중 오류 발생: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )


@router.post("/register/info", response_model=User)
async def update_user_additional_info(
    user_info: UserAdditionalInfo, current_user: dict = Depends(get_current_user)
):
    """Update user with additional information after registration."""
    try:
        logger.info(f"사용자 추가 정보 업데이트 시도: {current_user['email']}")

        # Update user in database with additional info
        from app.db.database import db_service

        # Create update data
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

        # Update user
        updated_user = await db_service.update_user(current_user["userId"], update_data)

        # Remove password from response
        if "password" in updated_user:
            del updated_user["password"]

        logger.info(f"사용자 추가 정보 업데이트 성공: {current_user['email']}")
        return updated_user
    except Exception as e:
        error_msg = f"사용자 추가 정보 업데이트 중 오류 발생: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Get an access token for authentication."""
    try:
        logger.info(f"토큰 인증 시도: {form_data.username}")
        user = await authenticate_user(form_data.username, form_data.password)
        if not user:
            logger.warning(f"인증 실패: {form_data.username} - 잘못된 인증 정보")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["userId"]}, expires_delta=access_token_expires
        )
        logger.info(f"토큰 발급 성공: {form_data.username}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"토큰 인증 처리 중 오류 발생: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login and get an access token."""
    try:
        logger.info(f"로그인 시도: {user_data.email}")
        user = await authenticate_user(user_data.email, user_data.password)
        if not user:
            logger.warning(f"로그인 실패: {user_data.email} - 잘못된 인증 정보")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["userId"]}, expires_delta=access_token_expires
        )

        # Remove password from response
        if "password" in user:
            user_copy = dict(user)
            del user_copy["password"]
        else:
            user_copy = user

        logger.info(f"로그인 성공: {user_data.email}")
        return {"access_token": access_token, "token_type": "bearer", "user": user_copy}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"로그인 처리 중 오류 발생: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )


@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user."""
    return current_user


@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate, current_user: dict = Depends(get_current_user)
):
    """Update the current authenticated user."""
    from app.db.database import db_service

    # Update user data
    updated_user = await db_service.update_user(
        current_user["userId"], user_update.dict(exclude_unset=True)
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return updated_user
