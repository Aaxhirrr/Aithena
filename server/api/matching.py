from fastapi import APIRouter

router = APIRouter()


@router.get("/recommendations")
def recommendations():
    return []


@router.post("/like/{user_id}")
def like(user_id: str):
    return {"ok": True, "id": user_id}

