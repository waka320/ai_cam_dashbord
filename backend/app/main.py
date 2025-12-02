from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import (
    csv_analysis,
    events,
    fetch_csv,
    fetch_csv_exmeidai,
    foreigners,
    get_graph,
    root,
    trend_analysis,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(csv_analysis.router)
app.include_router(fetch_csv.router)
app.include_router(fetch_csv_exmeidai.router)
app.include_router(foreigners.router)
app.include_router(get_graph.router)
app.include_router(root.router)
app.include_router(trend_analysis.router)
app.include_router(events.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
