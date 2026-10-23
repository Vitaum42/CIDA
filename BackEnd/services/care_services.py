import hashlib
import re
import secrets
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from models.elder_invite_models import ElderInvite
from models.elder_models import Elder
from models.user_models import User

# Sem 0/O/1/I para o código ser fácil de ditar por telefone
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
CONVITE_VALIDADE = timedelta(hours=24)


def _agora() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_codigo(codigo: str) -> str:
    normalizado = re.sub(r"[^A-Za-z0-9]", "", codigo).upper()
    return hashlib.sha256(normalizado.encode()).hexdigest()


def _idade(nascimento: date | None) -> int | None:
    if nascimento is None:
        return None
    hoje = date.today()
    return hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))


def elder_para_dict(elder: Elder) -> dict:
    return {
        "id": elder.id,
        "nome": elder.user.nome,
        "email": elder.user.email,
        "telefone": elder.user.telefone,
        "data_nascimento": elder.data_nascimento,
        "idade": _idade(elder.data_nascimento),
    }


def _perfil_cuidador(usuario: User):
    return usuario.caregiver or usuario.family_member


def listar_idosos_do_usuario(usuario: User) -> list[Elder]:
    """Idosos que ESTE usuário (pelo token) pode ver."""
    if usuario.role == "elder":
        return [usuario.elder] if usuario.elder else []
    perfil = _perfil_cuidador(usuario)
    return list(perfil.elders) if perfil else []


def obter_idoso_autorizado(db: Session, usuario: User, elder_id: int) -> Elder:
    """Devolve o idoso só se o usuário for o próprio idoso ou estiver vinculado a ele.

    Responde 404 nos dois casos (não existe / sem permissão) para não revelar
    quais ids existem.
    """
    elder = db.get(Elder, elder_id)
    if elder is None or elder.id not in {e.id for e in listar_idosos_do_usuario(usuario)}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Idoso não encontrado.")
    return elder


def gerar_convite(db: Session, elder: Elder) -> tuple[str, datetime]:
    db.execute(delete(ElderInvite).where(ElderInvite.elder_id == elder.id))
    codigo = "".join(secrets.choice(ALFABETO) for _ in range(8))
    expira_em = _agora() + CONVITE_VALIDADE
    db.add(ElderInvite(elder_id=elder.id, codigo_hash=_hash_codigo(codigo), expira_em=expira_em))
    db.commit()
    return f"{codigo[:4]}-{codigo[4:]}", expira_em


def vincular_por_convite(db: Session, usuario: User, codigo: str) -> Elder:
    perfil = _perfil_cuidador(usuario)
    if perfil is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Perfil de cuidador não encontrado.")

    convite = db.scalar(select(ElderInvite).where(ElderInvite.codigo_hash == _hash_codigo(codigo)))
    if convite is None or convite.expira_em < _agora():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Código inválido ou expirado.")

    elder = convite.elder
    if elder not in perfil.elders:
        perfil.elders.append(elder)
    db.delete(convite)  # uso único
    db.commit()
    return elder
