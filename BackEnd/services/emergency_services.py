from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.emergency_models import EmergencyAlert, EmergencyNotification
from models.user_models import User

# Toques repetidos no SOS dentro dessa janela contam como o mesmo alerta
JANELA_DUPLICIDADE = timedelta(minutes=2)


def _agora() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _utc(dt: datetime) -> datetime:
    """O SQLite devolve datas sem timezone; marcamos como UTC para o cliente."""
    return dt.replace(tzinfo=timezone.utc)


def acionar_sos(db: Session, usuario: User) -> dict:
    elder = usuario.elder
    if elder is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Perfil de idoso não encontrado.")

    # Destinatários = cuidadores e familiares vinculados a ESTE idoso (sem repetir usuário)
    destinatarios = {c.user_id for c in elder.caregivers} | {f.user_id for f in elder.family_members}

    recente = db.scalar(
        select(EmergencyAlert)
        .where(
            EmergencyAlert.elder_id == elder.id,
            EmergencyAlert.status == "aberto",
            EmergencyAlert.criado_em >= _agora() - JANELA_DUPLICIDADE,
        )
        .order_by(EmergencyAlert.criado_em.desc())
    )
    if recente:
        return {
            "alert_id": recente.id,
            "criado_em": _utc(recente.criado_em),
            "notificados": len(recente.notificacoes),
            "ja_existia": True,
        }

    alerta = EmergencyAlert(elder_id=elder.id, criado_em=_agora(), status="aberto")
    alerta.notificacoes = [EmergencyNotification(user_id=uid) for uid in destinatarios]
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    return {
        "alert_id": alerta.id,
        "criado_em": _utc(alerta.criado_em),
        "notificados": len(destinatarios),
        "ja_existia": False,
    }


def listar_alertas(db: Session, usuario: User) -> list[dict]:
    """Só os alertas enviados A ESTE usuário (filtro pelo id do token)."""
    notificacoes = db.scalars(
        select(EmergencyNotification)
        .where(EmergencyNotification.user_id == usuario.id)
        .join(EmergencyAlert)
        .order_by(EmergencyAlert.criado_em.desc())
    ).all()
    return [
        {
            "id": n.alert.id,
            "elder_id": n.alert.elder_id,
            "elder_nome": n.alert.elder.user.nome,
            "elder_telefone": n.alert.elder.user.telefone,
            "criado_em": _utc(n.alert.criado_em),
            "status": n.alert.status,
            "lido": n.lida_em is not None,
        }
        for n in notificacoes
    ]


def marcar_como_lido(db: Session, usuario: User, alert_id: int) -> None:
    notificacao = db.scalar(
        select(EmergencyNotification).where(
            EmergencyNotification.alert_id == alert_id,
            EmergencyNotification.user_id == usuario.id,
        )
    )
    if notificacao is None:  # não existe OU não é seu: mesma resposta
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Alerta não encontrado.")
    if notificacao.lida_em is None:
        notificacao.lida_em = _agora()
        db.commit()
