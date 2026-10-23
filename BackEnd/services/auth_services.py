from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.config import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET_KEY
from database.conection import get_db
from models.user_models import User

bearer_scheme = HTTPBearer(auto_error=False)


def hash_senha(senha: str) -> str:
    # bcrypt só considera os primeiros 72 bytes
    return bcrypt.hashpw(senha.encode()[:72], bcrypt.gensalt()).decode()


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        return bcrypt.checkpw(senha.encode()[:72], senha_hash.encode())
    except ValueError:
        return False


def criar_access_token(user: User) -> str:
    agora = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "iat": agora,
        "exp": agora + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_current_user(
    credenciais: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    erro = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autenticado ou sessão expirada.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credenciais is None:
        raise erro
    try:
        payload = jwt.decode(
            credenciais.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM]
        )
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise erro

    user = db.get(User, user_id)
    if user is None:
        raise erro
    return user
