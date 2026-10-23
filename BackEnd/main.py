from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401  (registra todas as tabelas no Base.metadata)
from database.conection import Base, engine
from routes.places_routes import router as places_router
from routes.user_routes import router as user_router

# Cria as tabelas na primeira execução (para produção, prefira Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = False,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(user_router)
app.include_router(places_router)

@app.get("/")
def rota():
    return {"ok": True}
