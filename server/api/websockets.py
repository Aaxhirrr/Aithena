from fastapi import APIRouter, WebSocket

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
  await ws.accept()
  await ws.send_json({"hello": "world"})
  await ws.close()

