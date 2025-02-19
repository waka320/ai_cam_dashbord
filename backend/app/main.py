import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.endpoints import root


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root.router)

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
