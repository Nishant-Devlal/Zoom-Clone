import os

from dotenv import load_dotenv
from livekit import api

load_dotenv()

LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")


def create_livekit_token(room_name: str, participant_name: str):
    if not LIVEKIT_API_KEY:
        raise RuntimeError("LIVEKIT_API_KEY is not set")

    if not LIVEKIT_API_SECRET:
        raise RuntimeError("LIVEKIT_API_SECRET is not set")

    token = (
        api.AccessToken(
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        .with_identity(participant_name)
        .with_name(participant_name)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
    )

    jwt_token = token.to_jwt()

    # Verify the token locally
    verifier = api.TokenVerifier(
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )

    claims = verifier.verify(jwt_token)

    print("========== TOKEN VERIFIED ==========")
    print("Identity:", claims.identity)
    print("Name:", claims.name)

    if claims.video:
        print("Room:", claims.video.room)
        print("Room Join:", claims.video.room_join)

    print("====================================")

    return jwt_token