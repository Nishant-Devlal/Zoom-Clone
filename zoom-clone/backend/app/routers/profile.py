import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user


router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)


# ---------------------------------------------------------
# Request schema
# ---------------------------------------------------------

class UpdateProfileRequest(BaseModel):
    name: str


# ---------------------------------------------------------
# Helper: return profile data
# ---------------------------------------------------------

def profile_response(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_picture": user.profile_picture,
    }


# ---------------------------------------------------------
# GET PROFILE
# ---------------------------------------------------------

@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return profile_response(current_user)


# ---------------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------------

@router.put("")
def update_profile(
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if len(name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be longer than 100 characters"
        )

    current_user.name = name

    db.commit()
    db.refresh(current_user)

    return profile_response(current_user)


# ---------------------------------------------------------
# UPLOAD / CHANGE PROFILE PICTURE
# ---------------------------------------------------------

@router.post("/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # Allowed MIME types
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, GIF and WEBP images are allowed"
        )

    # Read uploaded file
    content = await file.read()

    # 2 MB maximum size
    max_size = 2 * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Profile picture must be smaller than 2 MB"
        )

    # Create upload directory
    upload_dir = "uploads/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)

    # Determine extension from MIME type instead of trusting
    # the original filename
    extension_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
    }

    extension = extension_map[file.content_type]

    # Generate unique filename
    filename = f"{uuid.uuid4()}{extension}"

    filepath = os.path.join(
        upload_dir,
        filename
    )

    # Save file
    with open(filepath, "wb") as buffer:
        buffer.write(content)

    # Delete old profile picture if one exists
    if current_user.profile_picture:
        old_picture = current_user.profile_picture

        # Convert URL path to local filesystem path
        old_path = old_picture.lstrip("/").replace("/", os.sep)

        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    # URL stored in database
    picture_url = f"/uploads/profile_pictures/{filename}"

    current_user.profile_picture = picture_url

    db.commit()
    db.refresh(current_user)

    return profile_response(current_user)