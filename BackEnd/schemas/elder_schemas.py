from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ElderOut(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str
    data_nascimento: date | None = None
    idade: int | None = None


class MedicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    dosagem: str
    frequencia: str
    horario: str
    observacoes: str | None = None


class MedicalRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doencas: str | None = None
    alergias: str | None = None
    historico_acidentes: str | None = None
    observacoes: str | None = None


class ConviteOut(BaseModel):
    codigo: str
    expira_em: datetime


class VincularRequest(BaseModel):
    codigo: str
