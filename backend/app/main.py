from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.auth.router import router as auth_router
from app.router.user import router as users_router
from app.router.experiment import router as experiments_router
from app.router.stat import router as stats_router

# Buat semua tabel di database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FlashField API",
    description="API untuk platform Citizen Science Micro-Experiments",
    version="1.0.0"
)

# Origins yang diizinkan (ganti dengan URL Vercel Anda saat deploy)
origins = [
    "http://localhost:5173",  # Alamat default Vite
    "http://localhost:3000",
    # "https://your-frontend-domain.vercel.app", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Selamat datang di FlashField API!"}

app.include_router(auth_router, prefix="/auth")
app.include_router(users_router)
app.include_router(experiments_router)
app.include_router(stats_router)