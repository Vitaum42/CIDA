from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from models.user_models import User
from services import places_services
from services.auth_services import get_current_user

router = APIRouter(prefix="/places", tags=["places"])


@router.get("/nearby")
async def locais_proximos(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    tipo: Literal["pharmacy", "hospital", "drugstore", "doctor"] = "pharmacy",
    raio: int = Query(2000, ge=100, le=50000, description="metros"),
    limite: int = Query(10, ge=1, le=20),
    q: str | None = Query(None, min_length=2, max_length=80, description="busca por texto (opcional)"),
    _: User = Depends(get_current_user),  # protege a cota da chave do Google
):
    try:
        return await places_services.buscar_locais_proximos(lat, lng, tipo, raio, limite, q.strip() if q else None)
    except places_services.PlacesError as erro:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(erro))
