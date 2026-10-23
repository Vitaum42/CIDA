from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.conection import Base
from models.caregiver_models import caregiver_elder
from models.family_Member_models import family_member_elder

if TYPE_CHECKING:
    from models.caregiver_models import Caregiver
    from models.family_Member_models import FamilyMember
    from models.medication_models import Medication
    from models.midecal_record_models import MedicalRecord
    from models.user_models import User


class Elder(Base):
    __tablename__ = "elders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    data_nascimento: Mapped[date | None] = mapped_column(nullable=True)

    user: Mapped[User] = relationship(back_populates="elder")

    # Um idoso pode ser acompanhado por vários cuidadores/familiares (N:N)
    caregivers: Mapped[list[Caregiver]] = relationship(
        secondary=caregiver_elder, back_populates="elders"
    )
    family_members: Mapped[list[FamilyMember]] = relationship(
        secondary=family_member_elder, back_populates="elders"
    )

    # Um idoso tem vários medicamentos e vários prontuários (1:N)
    medications: Mapped[list[Medication]] = relationship(
        back_populates="elder", cascade="all, delete-orphan"
    )
    medical_records: Mapped[list[MedicalRecord]] = relationship(
        back_populates="elder", cascade="all, delete-orphan"
    )
