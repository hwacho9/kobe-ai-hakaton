from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..db.database import db_service
from ..models.user import User, UserProfile
from ..services.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    현재 로그인한 사용자의 프로필 정보를 가져옵니다.
    사용자 정보, 지역, 관심사, 선호 아티스트 정보를 포함합니다.
    """
    try:
        # 사용자 ID를 통해 데이터베이스에서 정보 가져오기
        user_id = (
            current_user["userId"]
            if isinstance(current_user, dict)
            else current_user.userId
        )
        user_data = await db_service.get_user(user_id)

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다.",
            )

        # 결과 반환
        return UserProfile(
            user=User(**user_data) if isinstance(current_user, dict) else current_user,
            area=user_data.get("area"),
            content_interests=user_data.get("content_interests", []),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로필 정보를 가져오는 중 오류가 발생했습니다: {str(e)}",
        )
