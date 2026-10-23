from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.conection import get_db
from models.user_models import User
from schemas import elder_schemas
from services import care_services
from services.auth_services import exigir_roles, get_current_user

router = APIRouter(tags=["idosos"])

SO_IDOSO = exigir_roles("elder")
SO_CUIDADOR = exigir_roles("caregiver", "family")


# --- Idoso: só enxerga o PRÓPRIO perfil ---------------------------------

@router.get("/elders/me", response_model=elder_schemas.ElderOut)
def meu_perfil(usuario: User = Depends(SO_IDOSO)):
    return care_services.elder_para_dict(usuario.elder)


@router.post("/elders/me/invite", response_model=elder_schemas.ConviteOut)
def gerar_convite(usuario: User = Depends(SO_IDOSO), db: Session = Depends(get_db)):
    codigo, expira_em = care_services.gerar_convite(db, usuario.elder)
    return {"codigo": codigo, "expira_em": expira_em}


# --- Cuidador/Familiar: só enxerga idosos VINCULADOS a ele ----------------

@router.get("/caregivers/me/elders", response_model=list[elder_schemas.ElderOut])
def meus_idosos(usuario: User = Depends(SO_CUIDADOR)):
    return [care_services.elder_para_dict(e) for e in care_services.listar_idosos_do_usuario(usuario)]


@router.post("/caregivers/me/elders", response_model=elder_schemas.ElderOut)
def vincular_idoso(
    dados: elder_schemas.VincularRequest,
    usuario: User = Depends(SO_CUIDADOR),
    db: Session = Depends(get_db),
):
    elder = care_services.vincular_por_convite(db, usuario, dados.codigo)
    return care_services.elder_para_dict(elder)


# --- Dados de um idoso específico (idoso dono OU cuidador vinculado) -----

@router.get("/elders/{elder_id}", response_model=elder_schemas.ElderOut)
def obter_idoso(elder_id: int, usuario: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return care_services.elder_para_dict(care_services.obter_idoso_autorizado(db, usuario, elder_id))


@router.get("/elders/{elder_id}/medications", response_model=list[elder_schemas.MedicationOut])
def medicamentos_do_idoso(elder_id: int, usuario: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return care_services.obter_idoso_autorizado(db, usuario, elder_id).medications


@router.get("/elders/{elder_id}/medical-records", response_model=list[elder_schemas.MedicalRecordOut])
def prontuarios_do_idoso(elder_id: int, usuario: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return care_services.obter_idoso_autorizado(db, usuario, elder_id).medical_records
