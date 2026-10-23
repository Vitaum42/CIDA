from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.elder_models import Elder
    from models.user_models import User

# Tabela de associação: um cuidador gerencia 1..N idosos
caregiver_elder = Table(
    "caregiver_elder",
    Base.metadata,
    Column("caregiver_id", ForeignKey("caregivers.id", ondelete="CASCADE"), primary_key=True),
    Column("elder_id", ForeignKey("elders.id", ondelete="CASCADE"), primary_key=True),
)


class Caregiver(Base):
    __tablename__ = "caregivers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    vinculo: Mapped[str | None] = mapped_column(String(80), nullable=True)
    especializacao: Mapped[str | None] = mapped_column(String(120), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rotinas: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="caregiver")
    elders: Mapped[list[Elder]] = relationship(
        secondary=caregiver_elder, back_populates="caregivers"
    )
