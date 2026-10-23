from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.conection import get_db
from models.user_models import User
from schemas import user_schemas
from services import user_services
from services.auth_services import get_current_user

router = APIRouter()


@router.post(
    "/users",
    status_code=status.HTTP_201_CREATED,
    response_model=user_schemas.UserOut,
)
def criar_usuario(
    registro: user_schemas.UserRegistration, db: Session = Depends(get_db)
):
    try:
        return user_services.criar_usuario(db, registro)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.post("/auth/login", response_model=user_schemas.TokenResponse)
def login(dados: user_schemas.LoginRequest, db: Session = Depends(get_db)):
    resultado = user_services.login(db, dados)
    if resultado is None:
        # Mensagem única: não revela se o e-mail/telefone existe
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return resultado


@router.get("/auth/me", response_model=user_schemas.UserOut)
def me(usuario: User = Depends(get_current_user)):
    return usuario


@router.delete("/users/{usuario_id}")
def deletar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    atual: User = Depends(get_current_user),
):
    if atual.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode excluir a própria conta.",
        )
    return user_services.deletar_usuario(db, usuario_id)
