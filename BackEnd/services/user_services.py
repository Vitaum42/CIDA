import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.caregiver_models import Caregiver
from models.elder_models import Elder
from models.family_Member_models import FamilyMember
from models.user_models import User
from schemas import user_schemas
from services.auth_services import criar_access_token, hash_senha, verificar_senha


def home():
    return {"message": "API em funcionamento!"}


def _so_digitos(valor: str) -> str:
    return re.sub(r"\D", "", valor)


def listar_usuarios(db: Session):
    return db.scalars(select(User)).all()


def get_usuario_por_id(db: Session, usuario_id: int):
    return db.get(User, usuario_id)


def criar_usuario(db: Session, registro: user_schemas.UserRegistration) -> User:
    email = registro.email.strip().lower()
    telefone = _so_digitos(registro.telefone)

    if len(registro.senha) < 6:
        raise ValueError("A senha deve ter pelo menos 6 caracteres.")
    if not telefone:
        raise ValueError("Telefone inválido.")
    if db.scalar(select(User).where(User.email == email)):
        raise ValueError("Já existe uma conta com este e-mail.")
    if db.scalar(select(User).where(User.telefone == telefone)):
        raise ValueError("Já existe uma conta com este telefone.")

    usuario = User(
        nome=registro.nome.strip(),
        email=email,
        telefone=telefone,
        senha_hash=hash_senha(registro.senha),
        role=registro.role,
    )

    # Cria o perfil específico de acordo com o papel
    if registro.role == "elder":
        usuario.elder = Elder(data_nascimento=registro.data_nascimento)
    elif registro.role == "caregiver":
        usuario.caregiver = Caregiver(
            vinculo=registro.vinculo,
            especializacao=registro.especializacao,
            observacoes=registro.observacoes,
            rotinas=registro.rotinas,
        )
    else:
        usuario.family_member = FamilyMember(
            grau_parentesco=registro.vinculo,
            observacoes=registro.observacoes,
        )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def autenticar(db: Session, identificador: str, senha: str) -> User | None:
    """Aceita e-mail ou telefone (com ou sem máscara)."""
    identificador = identificador.strip()
    if "@" in identificador:
        consulta = select(User).where(User.email == identificador.lower())
    else:
        consulta = select(User).where(User.telefone == _so_digitos(identificador))

    usuario = db.scalar(consulta)
    if usuario is None or not verificar_senha(senha, usuario.senha_hash):
        return None
    return usuario


def login(db: Session, dados: user_schemas.LoginRequest) -> dict | None:
    usuario = autenticar(db, dados.identificador, dados.senha)
    if usuario is None:
        return None
    return {
        "access_token": criar_access_token(usuario),
        "token_type": "bearer",
        "user": usuario,
    }


def deletar_usuario(db: Session, usuario_id: int) -> bool:
    usuario = db.get(User, usuario_id)
    if usuario is None:
        return False
    db.delete(usuario)
    db.commit()
    return True
