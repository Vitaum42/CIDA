from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.elder_models import Elder


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    elder_id: Mapped[int] = mapped_column(
        ForeignKey("elders.id", ondelete="CASCADE"), index=True
    )
    nome: Mapped[str] = mapped_column(String(120))
    dosagem: Mapped[str] = mapped_column(String(60))
    frequencia: Mapped[str] = mapped_column(String(60))
    horario: Mapped[str] = mapped_column(String(20))
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)

    elder: Mapped[Elder] = relationship(back_populates="medications")
