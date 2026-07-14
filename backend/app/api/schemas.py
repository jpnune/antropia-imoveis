from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from datetime import date

# Schemas para Corretor
class CorretorBase(BaseModel):
    nome: str
    email: EmailStr

class CorretorCreate(CorretorBase):
    senha: str

class CorretorResponse(CorretorBase):
    id: int
    class Config:
        from_attributes = True

# Schemas para Usuário (Proprietário)
class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioResponse(UsuarioBase):
    id: int
    class Config:
        from_attributes = True

# Schemas para Imóvel
class ImovelBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    preco: float
    quartos: Optional[int] = 0
    banheiros: Optional[int] = 0
    vagas: Optional[int] = 0
    area: Optional[float] = 0.0
    tipo: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    status: Optional[str] = 'Disponivel'
    imagem_url: Optional[str] = None
    usuario_id: Optional[int] = None
    corretor_preferido_id: Optional[int] = None

class ImovelCreate(ImovelBase):
    pass

class ImovelResponse(ImovelBase):
    id: int
    class Config:
        from_attributes = True

# Schemas para Lead
class LeadBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    mensagem: Optional[str] = None
    status_funil: Optional[str] = 'Novo'
    corretor_id: Optional[int] = None

class LeadCreate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: int
    criado_em: datetime
    class Config:
        from_attributes = True

# Schemas para Estatísticas
class VisualizacaoBase(BaseModel):
    imovel_id: int
    data: date
    quantidade: int

class VisualizacaoResponse(VisualizacaoBase):
    id: int
    class Config:
        from_attributes = True
