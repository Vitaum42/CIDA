from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.elder_models import Elder


class ElderInvite(Base):
    """Convite de uso único: o idoso gera, o cuidador/familiar resgata para se vincular."""

    __tablename__ = "elder_invites"

    id: Mapped[int] = mapped_column(primary_key=True)
    elder_id: Mapped[int] = mapped_column(
        ForeignKey("elders.id", ondelete="CASCADE"), index=True
    )
    codigo_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expira_em: Mapped[datetime]  # UTC, sem timezone (SQLite)

    elder: Mapped[Elder] = relationship(back_populates="invites")
