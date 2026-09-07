import os

from livekit import api
from dotenv import load_dotenv

load_dotenv()

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")


def create_livekit_token(
    room_name: str,
    participant_name: str,
):

    token = api.AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET,
    )

    token.with_identity(participant_name)

    token.with_name(participant_name)

    token.with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
        )
    )

    return token.to_jwt()