from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.elder_models import Elder
    from models.user_models import User


class EmergencyAlert(Base):
    """Um acionamento do botão SOS por um idoso."""

    __tablename__ = "emergency_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    elder_id: Mapped[int] = mapped_column(
        ForeignKey("elders.id", ondelete="CASCADE"), index=True
    )
    criado_em: Mapped[datetime]  # UTC, sem timezone (SQLite)
    status: Mapped[str] = mapped_column(String(20), default="aberto")  # aberto | resolvido

    elder: Mapped[Elder] = relationship(back_populates="emergency_alerts")
    notificacoes: Mapped[list[EmergencyNotification]] = relationship(
        back_populates="alert", cascade="all, delete-orphan"
    )


class EmergencyNotification(Base):
    """Cópia do alerta para cada cuidador/familiar vinculado no momento do SOS."""

    __tablename__ = "emergency_notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    alert_id: Mapped[int] = mapped_column(
        ForeignKey("emergency_alerts.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    lida_em: Mapped[datetime | None] = mapped_column(nullable=True)

    alert: Mapped[EmergencyAlert] = relationship(back_populates="notificacoes")
    user: Mapped[User] = relationship(back_populates="notificacoes_emergencia")
