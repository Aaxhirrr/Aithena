from pydantic import BaseModel


class Match(BaseModel):
    id: str
    a_user_id: str
    b_user_id: str
    score: float = 0.0

