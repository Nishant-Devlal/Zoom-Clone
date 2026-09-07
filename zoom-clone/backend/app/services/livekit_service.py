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


async def delete_livekit_room(room_name: str):
    """
    Delete a LiveKit room and disconnect all participants.
    """

    if not LIVEKIT_URL:
        raise RuntimeError("LIVEKIT_URL is not set")

    if not LIVEKIT_API_KEY:
        raise RuntimeError("LIVEKIT_API_KEY is not set")

    if not LIVEKIT_API_SECRET:
        raise RuntimeError("LIVEKIT_API_SECRET is not set")

    livekit_api = api.LiveKitAPI(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )

    try:
        await livekit_api.room.delete_room(
            api.DeleteRoomRequest(
                room=room_name
            )
        )

        print("========== LIVEKIT ROOM DELETED ==========")
        print("Room:", room_name)
        print("All participants disconnected")
        print("===========================================")

    finally:
        await livekit_api.aclose()
        

async def remove_livekit_participant(
    room_name: str,
    participant_identity: str,
):
    """
    Remove a specific participant from a LiveKit room.
    """

    if not LIVEKIT_URL:
        raise RuntimeError("LIVEKIT_URL is not set")

    if not LIVEKIT_API_KEY:
        raise RuntimeError("LIVEKIT_API_KEY is not set")

    if not LIVEKIT_API_SECRET:
        raise RuntimeError("LIVEKIT_API_SECRET is not set")

    livekit_api = api.LiveKitAPI(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )

    try:
        await livekit_api.room.remove_participant(
            api.RoomParticipantIdentity(
                room=room_name,
                identity=participant_identity,
            )
        )

        print("========== PARTICIPANT REMOVED ==========")
        print("Room:", room_name)
        print("Participant:", participant_identity)
        print("==========================================")

    finally:
        await livekit_api.aclose()