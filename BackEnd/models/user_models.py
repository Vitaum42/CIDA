from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.caregiver_models import Caregiver
    from models.elder_models import Elder
    from models.emergency_models import EmergencyNotification
    from models.family_Member_models import FamilyMember


class User(Base):
    """Conta de acesso. O perfil específico (idoso/cuidador/familiar) fica em tabela própria."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    telefone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(20))  # elder | caregiver | family

    # uselist=False => 1:1 ; delete-orphan => apagar o usuário apaga o perfil
    elder: Mapped[Elder | None] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    caregiver: Mapped[Caregiver | None] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    family_member: Mapped[FamilyMember | None] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    notificacoes_emergencia: Mapped[list[EmergencyNotification]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
