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
@router.post('/login/')
def login(corretor: schemas.CorretorCreate, db: Session = Depends(get_db)):
    db_corretor = db.query(models.Corretor).filter(models.Corretor.email == corretor.email).first()
    if not db_corretor or db_corretor.senha_hash != corretor.senha: # Simplificado para demonstração inicial/portfólio
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


