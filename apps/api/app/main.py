import logging
from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from apps.api.app.config import settings
from apps.api.app.dependencies import limiter
from apps.api.app.database import engine, Base
from apps.api.app.routers import (
    auth,
    samples,
    analyses,
    traceability,
    sensors,
    sync,
    analytics,
    data_collection,
    models,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pashuposhan.api")

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FeedShield API",
    description="Smart AI-Enabled Rapid Feed and Silage Quality Testing System API (SIH26111)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized Error Envelope Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters or payload",
                "details": exc.errors(),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "pashuposhan-api",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }


# Include all API v1 Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(samples.router, prefix="/api/v1")
app.include_router(analyses.router, prefix="/api/v1")
app.include_router(traceability.router, prefix="/api/v1")
app.include_router(sensors.router, prefix="/api/v1")
app.include_router(sync.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(data_collection.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
