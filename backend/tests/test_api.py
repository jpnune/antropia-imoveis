import os
os.environ["TESTING"] = "True"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from main import app

# Configuração do SQLite em memória para testes independentes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sobrescreve a dependência get_db do FastAPI para usar o banco de testes
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_criar_e_logar_corretor():
    # 1. Cadastro de Corretor
    response = client.post(
        "/api/corretores/",
        json={"nome": "Corretor Teste", "email": "teste@antropia.com", "senha": "senha123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "teste@antropia.com"
    assert data["nome"] == "Corretor Teste"

    # 2. Login de Corretor
    response = client.post(
        "/api/login/",
        json={"nome": "Corretor Teste", "email": "teste@antropia.com", "senha": "senha123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "teste@antropia.com"

def test_crud_imovel():
    # 1. Cadastra Imóvel
    payload = {
        "titulo": "Casa de Campo",
        "descricao": "Bela casa com gramado",
        "preco": 450000.0,
        "tipo": "Casa",
        "quartos": 3,
        "banheiros": 2,
        "vagas": 2,
        "area": 180.0,
        "cidade": "Itu",
        "bairro": "Centro",
        "imagem_url": "http://exemplo.com/foto.jpg",
        "status": "Disponivel"
    }
    response = client.post("/api/imoveis/", json=payload)
    assert response.status_code == 201
    imovel_id = response.json()["id"]

    # 2. Lista Imóveis
    response = client.get("/api/imoveis/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 3. Atualiza Imóvel
    payload["titulo"] = "Casa de Campo Atualizada"
    response = client.put(f"/api/imoveis/{imovel_id}", json=payload)
    assert response.status_code == 200
    assert response.json()["titulo"] == "Casa de Campo Atualizada"

    # 4. Deleta Imóvel
    response = client.delete(f"/api/imoveis/{imovel_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_fluxo_leads():
    # 1. Cria Lead
    payload = {
        "nome": "Cliente Interessado",
        "email": "cliente@gmail.com",
        "telefone": "11999998888",
        "mensagem": "Gostaria de agendar visita",
        "status_funil": "Novo"
    }
    response = client.post("/api/leads/", json=payload)
    assert response.status_code == 201
    lead_id = response.json()["id"]

    # 2. Lista Leads
    response = client.get("/api/leads/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 3. Altera Dados do Lead (PUT)
    payload["status_funil"] = "Contatado"
    payload["nome"] = "Cliente Interessado Atualizado"
    response = client.put(f"/api/leads/{lead_id}", json=payload)
    assert response.status_code == 200
    assert response.json()["status_funil"] == "Contatado"
    assert response.json()["nome"] == "Cliente Interessado Atualizado"

    # 4. Deleta Lead (DELETE)
    response = client.delete(f"/api/leads/{lead_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_fluxo_usuario_proprietario():
    # 1. Cadastro de Usuário Proprietário
    response = client.post(
        "/api/usuarios/",
        json={"nome": "Proprietario Teste", "email": "proprietario@antropia.com", "senha": "user123"}
    )
    assert response.status_code == 201
    user_id = response.json()["id"]

    # 2. Login de Usuário Proprietário
    response = client.post(
        "/api/login/usuario/",
        json={"nome": "Temp", "email": "proprietario@antropia.com", "senha": "user123"}
    )
    assert response.status_code == 200
    assert response.json()["nome"] == "Proprietario Teste"

    # 3. Listagem de Corretores
    response = client.get("/api/corretores/")
    assert response.status_code == 200
