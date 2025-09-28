from pydantic import BaseModel


class Settings(BaseModel):
    api_base_url: str = "http://localhost:8000"
    ws_url: str = "ws://localhost:8000/ws"
    firebase_project_id: str = "demo"
    gemini_api_key: str = ""


settings = Settings()

