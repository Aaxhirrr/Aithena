from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_sessions():
    return []


@router.post("")
def create_session():
    return {"id": "session_1"}

