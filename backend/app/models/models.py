from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Corretor(Base):
    __tablename__ = 'corretores'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)

    leads = relationship('Lead', back_populates='corretor')

class Imovel(Base):
    __tablename__ = 'imoveis'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(String)
    preco = Column(Float, nullable=False)
    quartos = Column(Integer, default=0)
    banheiros = Column(Integer, default=0)
    vagas = Column(Integer, default=0)
    area = Column(Float, default=0.0)
    tipo = Column(String)  # Casa, Apartamento, Terreno, etc.
    cidade = Column(String)
    bairro = Column(String)
    status = Column(String, default='Disponivel')  # Disponivel, Vendido, Alugado
    imagem_url = Column(String)

    visitas = relationship('VisualizacaoImovel', back_populates='imovel')

class Lead(Base):
    __tablename__ = 'leads'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telefone = Column(String)
    mensagem = Column(String)
    status_funil = Column(String, default='Novo')  # Novo, Contatado, Visita Agendada, Fechado
    corretor_id = Column(Integer, ForeignKey('corretores.id'))
    criado_em = Column(DateTime, default=datetime.utcnow)

    corretor = relationship('Corretor', back_populates='leads')

class VisualizacaoImovel(Base):
    __tablename__ = 'visualizacoes_imoveis'
    id = Column(Integer, primary_key=True, index=True)
    imovel_id = Column(Integer, ForeignKey('imoveis.id'), nullable=False)
    data = Column(Date, default=datetime.utcnow)
    quantidade = Column(Integer, default=1)

    imovel = relationship('Imovel', back_populates='visitas')
