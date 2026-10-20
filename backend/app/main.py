"""GlucoTwin AI - FastAPI Application Entrypoint.
Healthcare Digital Twin Proof of Concept for the Digital Twin Challenge 2026.
Synthetic Research Prototype - Not a Medical Device.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes_patients import router as patients_router
from backend.app.api.routes_simulation import router as simulation_router
from backend.app.api.routes_predict import router as predict_router
from backend.app.api.routes_whatif import router as whatif_router
from backend.app.api.routes_metrics import router as metrics_router
from backend.app.config import RESEARCH_DISCLAIMER
from backend.app.ml.inference import get_loaded_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload ML model pipeline and metrics during startup
    print("Preloading GlucoTwin AI fitted model pipeline...")
    get_loaded_model()
    print("GlucoTwin AI Model and Preprocessing Pipeline ready.")
    yield


app = FastAPI(
    title="GlucoTwin AI API",
    description=(
        "Healthcare Digital Twin API fusing historical EHR with continuous glucose and wearable telemetry "
        "for 2-hour excursion risk estimation and In Silico What-If scenario counterfactual modeling."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(patients_router)
app.include_router(simulation_router)
app.include_router(predict_router)
app.include_router(whatif_router)
app.include_router(metrics_router)


@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "GlucoTwin AI Virtual Patient Twin Engine",
        "version": "1.0.0",
        "disclaimer": RESEARCH_DISCLAIMER,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "detail": str(exc),
            "disclaimer": RESEARCH_DISCLAIMER,
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
