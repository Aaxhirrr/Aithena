from pydantic import BaseModel


class Location(BaseModel):
    lat: float
    lng: float
    label: str | None = None

