from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from database.conection import get_db
from models.user_models import User
from schemas import emergency_schemas
from services import emergency_services
from services.auth_services import exigir_roles

router = APIRouter(prefix="/api/emergency", tags=["emergência"])


@router.post("/sos", response_model=emergency_schemas.SOSOut, status_code=status.HTTP_201_CREATED)
def acionar_sos(
    response: Response,
    usuario: User = Depends(exigir_roles("elder")),
    db: Session = Depends(get_db),
):
    """O idoso (identificado pelo JWT) aciona o SOS: registra o alerta e notifica quem cuida dele."""
    resultado = emergency_services.acionar_sos(db, usuario)
    if resultado["ja_existia"]:
        response.status_code = status.HTTP_200_OK
    return resultado


@router.get("/alerts", response_model=list[emergency_schemas.AlertaOut])
def meus_alertas(
    usuario: User = Depends(exigir_roles("caregiver", "family")),
    db: Session = Depends(get_db),
):
    return emergency_services.listar_alertas(db, usuario)


@router.post("/alerts/{alert_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def marcar_lido(
    alert_id: int,
    usuario: User = Depends(exigir_roles("caregiver", "family")),
    db: Session = Depends(get_db),
):
    emergency_services.marcar_como_lido(db, usuario, alert_id)
