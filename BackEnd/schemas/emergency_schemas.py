from datetime import datetime

from pydantic import BaseModel


class SOSOut(BaseModel):
    alert_id: int
    criado_em: datetime
    notificados: int  # quantos cuidadores/familiares foram avisados
    ja_existia: bool  # True se reaproveitou um SOS recente (evita duplicar por toque repetido)


class AlertaOut(BaseModel):
    id: int
    elder_id: int
    elder_nome: str
    elder_telefone: str
    criado_em: datetime
    status: str
    lido: bool
