import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)

# Request schema
class UpdateProfileRequest(BaseModel):
    name: str


# Helper: return profile data
def profile_response(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_picture": user.profile_picture,
    }

# GET PROFILE
@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return profile_response(current_user)

# UPDATE PROFILE
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


# UPLOAD / CHANGE PROFILE PICTURE
@router.post("/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # Check Cloudinary configuration
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        raise HTTPException(
            status_code=500,
            detail="Cloudinary cloud name is not configured"
        )

    if not os.getenv("CLOUDINARY_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="Cloudinary API key is not configured"
        )

    if not os.getenv("CLOUDINARY_API_SECRET"):
        raise HTTPException(
            status_code=500,
            detail="Cloudinary API secret is not configured"
        )

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

    # Upload to Cloudinary

    try:
        result = cloudinary.uploader.upload(
            content,
            folder="zoom-clone/profile_pictures",
            public_id=f"user_{current_user.id}",
            overwrite=True,
            invalidate=True,
            resource_type="image",
        )

    except Exception as e:
        print("Cloudinary upload error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to upload profile picture"
        )

    # Get Cloudinary URL
    picture_url = result.get("secure_url")

    if not picture_url:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary did not return an image URL"
        )

    # Save Cloudinary URL in database
    current_user.profile_picture = picture_url

    db.commit()
    db.refresh(current_user)

    return profile_response(current_user)