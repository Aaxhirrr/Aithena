from fastapi import APIRouter

router = APIRouter()


@router.get("/nearby")
def nearby(lat: float, lng: float):
    return {"lat": lat, "lng": lng, "results": []}


@router.post("/check-in")
def check_in(lat: float, lng: float):
    return {"ok": True, "lat": lat, "lng": lng}

