import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.endpoints import router as api_router

# Inicializa e cria as tabelas locais se não existirem (SQLite/Postgres local)
if os.getenv('TESTING') != 'True':
    Base.metadata.create_all(bind=engine)

app = FastAPI(title='Antropia Imoveis API')

# Configuração dinâmica e segura de CORS
allowed_origins_str = os.getenv('ALLOWED_ORIGINS', '*')
if allowed_origins_str == '*':
    origins = ['*']
else:
    origins = [origin.strip() for origin in allowed_origins_str.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(api_router, prefix='/api')

@app.get('/')
def read_root():
    return {'status': 'ok', 'message': 'Antropia Imoveis API running successfully'}
