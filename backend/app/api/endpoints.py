from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.api import schemas

router = APIRouter()

# --- ENDPOINTS DE IMÓVEIS ---
@router.post('/imoveis/', response_model=schemas.ImovelResponse, status_code=status.HTTP_201_CREATED)
def create_imovel(imovel: schemas.ImovelCreate, db: Session = Depends(get_db)):
    db_imovel = models.Imovel(**imovel.model_dump())
    db.add(db_imovel)
    db.commit()
    db.refresh(db_imovel)
    return db_imovel

@router.get('/imoveis/', response_model=List[schemas.ImovelResponse])
def list_imoveis(db: Session = Depends(get_db)):
    return db.query(models.Imovel).all()

@router.get('/imoveis/{imovel_id}', response_model=schemas.ImovelResponse)
def get_imovel(imovel_id: int, db: Session = Depends(get_db)):
    db_imovel = db.query(models.Imovel).filter(models.Imovel.id == imovel_id).first()
    if not db_imovel:
        raise HTTPException(status_code=404, detail='Imovel nao encontrado')
    return db_imovel

# --- ENDPOINTS DE LEADS ---
@router.post('/leads/', response_model=schemas.LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    db_lead = models.Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.get('/leads/', response_model=List[schemas.LeadResponse])
def list_leads(db: Session = Depends(get_db)):
    return db.query(models.Lead).all()

@router.put('/leads/{lead_id}', response_model=schemas.LeadResponse)
def update_lead_status(lead_id: int, status_funil: str, db: Session = Depends(get_db)):
    db_lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail='Lead nao encontrado')
    db_lead.status_funil = status_funil
    db.commit()
    db.refresh(db_lead)
    return db_lead

# --- ENDPOINTS DE AUTENTICAÇÃO SIMPLIFICADA (CORRETOR) ---
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

@router.post('/corretores/', response_model=schemas.CorretorResponse, status_code=status.HTTP_201_CREATED)
def signup_corretor(corretor: schemas.CorretorCreate, db: Session = Depends(get_db)):
    # Verifica se já existe o e-mail
    db_existente = db.query(models.Corretor).filter(models.Corretor.email == corretor.email).first()
    if db_existente:
        raise HTTPException(status_code=400, detail='E-mail ja cadastrado')
    
    hashed = hash_password(corretor.senha)
    db_corretor = models.Corretor(nome=corretor.nome, email=corretor.email, senha_hash=hashed)
    db.add(db_corretor)
    db.commit()
    db.refresh(db_corretor)
    return db_corretor

@router.post('/login/')
def login(corretor: schemas.CorretorCreate, db: Session = Depends(get_db)):
    db_corretor = db.query(models.Corretor).filter(models.Corretor.email == corretor.email).first()
    if not db_corretor:
        raise HTTPException(status_code=401, detail='E-mail ou senha incorretos')
    
    # Se for a senha semente de demonstração não hasheada ainda (migração/compatibilidade)
    is_valid = False
    if db_corretor.senha_hash == corretor.senha:
        # Auto-converte para hash seguro
        db_corretor.senha_hash = hash_password(corretor.senha)
        db.commit()
        is_valid = True
    else:
        is_valid = verify_password(corretor.senha, db_corretor.senha_hash)
        
    if not is_valid:
        raise HTTPException(status_code=401, detail='E-mail ou senha incorretos')
        
    return {'id': db_corretor.id, 'nome': db_corretor.nome, 'email': db_corretor.email}


# --- ENDPOINTS DE ESTATÍSTICAS E VISUALIZAÇÕES ---
@router.post('/imoveis/{imovel_id}/visitas/', status_code=status.HTTP_200_OK)
def registrar_visita(imovel_id: int, db: Session = Depends(get_db)):
    from datetime import date
    hoje = date.today()
    visita = db.query(models.VisualizacaoImovel).filter(
        models.VisualizacaoImovel.imovel_id == imovel_id,
        models.VisualizacaoImovel.data == hoje
    ).first()
    
    if visita:
        visita.quantidade += 1
    else:
        visita = models.VisualizacaoImovel(imovel_id=imovel_id, data=hoje, quantidade=1)
        db.add(visita)
        
    db.commit()
    return {'status': 'success', 'visitas_hoje': visita.quantidade}

@router.get('/estatisticas/', status_code=status.HTTP_200_OK)
def obter_estatisticas(db: Session = Depends(get_db)):
    resultado = db.query(models.VisualizacaoImovel).all()
    return [{'imovel_id': v.imovel_id, 'data': str(v.data), 'quantidade': v.quantidade} for v in resultado]

# --- ENDPOINTS DE EDICÃO E EXCLUSÃO DE IMÓVEIS (CRUD CORRETOR) ---
@router.put('/imoveis/{imovel_id}', response_model=schemas.ImovelResponse)
def update_imovel(imovel_id: int, imovel_update: schemas.ImovelCreate, db: Session = Depends(get_db)):
    db_imovel = db.query(models.Imovel).filter(models.Imovel.id == imovel_id).first()
    if not db_imovel:
        raise HTTPException(status_code=404, detail='Imovel nao encontrado')
    for key, value in imovel_update.model_dump().items():
        setattr(db_imovel, key, value)
    db.commit()
    db.refresh(db_imovel)
    return db_imovel

@router.delete('/imoveis/{imovel_id}', status_code=status.HTTP_200_OK)
def delete_imovel(imovel_id: int, db: Session = Depends(get_db)):
    db_imovel = db.query(models.Imovel).filter(models.Imovel.id == imovel_id).first()
    if not db_imovel:
        raise HTTPException(status_code=404, detail='Imovel nao encontrado')
    # Remove dependências (visitas) antes
    db.query(models.VisualizacaoImovel).filter(models.VisualizacaoImovel.imovel_id == imovel_id).delete()
    db.delete(db_imovel)
    db.commit()
    return {'status': 'success', 'message': 'Imovel removido com sucesso'}



