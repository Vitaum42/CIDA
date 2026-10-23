import os
from pathlib import Path

from dotenv import load_dotenv

# Carrega BackEnd/.env (nunca commitar esse arquivo)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cida.db")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY não definida. Crie BackEnd/.env a partir do .env.example."
    )
