from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
def login(email: str, password: str):
    return {"token": "mock", "user": {"email": email}}


@router.get("/me")
def me():
    return {"email": "demo@example.com"}

