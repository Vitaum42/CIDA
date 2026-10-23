from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict


class UserRegistration(BaseModel):
    # Campos comuns
    nome: str
    email: str
    senha: str
    role: Literal["elder", "caregiver", "family"]
    telefone: str

    # idoso
    data_nascimento: date | None = None

    # Cuidador
    vinculo: str | None = None
    especializacao: str | None = None
    observacoes: str | None = None
    rotinas: str | None = None


class LoginRequest(BaseModel):
    identificador: str  # e-mail ou telefone
    senha: str


class UserOut(BaseModel):
    """Resposta pública: nunca expõe senha/hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    telefone: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
