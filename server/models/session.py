from pydantic import BaseModel


class StudySession(BaseModel):
    id: str
    topic: str | None = None
    owner_id: str | None = None

