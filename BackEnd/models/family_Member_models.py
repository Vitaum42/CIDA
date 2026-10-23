from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base

if TYPE_CHECKING:
    from models.elder_models import Elder
    from models.user_models import User

# Tabela de associação: um familiar acompanha 1..N idosos
family_member_elder = Table(
    "family_member_elder",
    Base.metadata,
    Column("family_member_id", ForeignKey("family_members.id", ondelete="CASCADE"), primary_key=True),
    Column("elder_id", ForeignKey("elders.id", ondelete="CASCADE"), primary_key=True),
)


class FamilyMember(Base):
    __tablename__ = "family_members"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    grau_parentesco: Mapped[str | None] = mapped_column(String(60), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship(back_populates="family_member")
    elders: Mapped[list[Elder]] = relationship(
        secondary=family_member_elder, back_populates="family_members"
    )
