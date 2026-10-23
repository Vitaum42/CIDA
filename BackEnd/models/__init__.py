# Importar todos os modelos aqui garante que os relationship() por string
# ("Elder", "Medication"...) sejam resolvidos e que o create_all veja as tabelas.
from models.user_models import User
from models.elder_models import Elder
from models.caregiver_models import Caregiver, caregiver_elder
from models.family_Member_models import FamilyMember, family_member_elder
from models.medication_models import Medication
from models.midecal_record_models import MedicalRecord

__all__ = [
    "User",
    "Elder",
    "Caregiver",
    "FamilyMember",
    "Medication",
    "MedicalRecord",
    "caregiver_elder",
    "family_member_elder",
]
