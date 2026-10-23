from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.elder_models import Elder


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    elder_id: Mapped[int] = mapped_column(
        ForeignKey("elders.id", ondelete="CASCADE"), index=True
    )
    doencas: Mapped[str | None] = mapped_column(Text, nullable=True)
    alergias: Mapped[str | None] = mapped_column(Text, nullable=True)
    historico_acidentes: Mapped[str | None] = mapped_column(Text, nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)

    elder: Mapped[Elder] = relationship(back_populates="medical_records")
