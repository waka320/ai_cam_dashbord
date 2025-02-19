from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI~~~"}


@app.get("/api/data")
async def get_data():
    data = [1, 2, 3]

    secret_key = os.getenv("SECRET_KEY")
    if secret_key:
        print(f"SECRET_KEY is: {secret_key}")
    else:
        print("SECRET_KEY is not set.")
    return {"data": data}
