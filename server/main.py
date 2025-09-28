from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.api import auth, matching, sessions, locations
from server.api import recommendations
from server.api import chat
from server.api import extract
from server.api import invites
from server.api import study_plan

app = FastAPI(title="Aithena API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(matching.router, prefix="/matching", tags=["matching"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(locations.router, prefix="/locations", tags=["locations"])
app.include_router(recommendations.router, prefix="/ai", tags=["ai"])
app.include_router(chat.router, prefix="/ai", tags=["ai"])
app.include_router(extract.router, prefix="/ai", tags=["ai"])
app.include_router(invites.router, prefix="/ai", tags=["ai"])
app.include_router(study_plan.router, prefix="/ai", tags=["ai"])


@app.get("/")
def root():
    return {"status": "ok"}
