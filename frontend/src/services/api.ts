const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

export interface Imovel {
  id?: number;
  titulo: string;
  descricao?: string;
  preco: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  area?: number;
  tipo?: string;
  cidade?: string;
  bairro?: string;
  status?: string;
  imagem_url?: string;
  usuario_id?: number | null;
  corretor_preferido_id?: number | null;
}

export interface Lead {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  mensagem?: string;
  status_funil?: string;
  corretor_id?: number | null;
  criado_em?: string;
}

export interface Corretor {
  id: number;
  nome: string;
  email: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Estatistica {
  imovel_id: number;
  data: string;
  quantidade: number;
}

export const api = {
    async getImoveis(): Promise<Imovel[]> {
        const response = await fetch(`${API_URL}/imoveis/`);
        if (!response.ok) throw new Error('Erro ao buscar imoveis');
        return response.json();
    },
    async getImovel(id: number): Promise<Imovel> {
        const response = await fetch(`${API_URL}/imoveis/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar imovel');
        return response.json();
    },
    async enviarLead(lead: Partial<Lead>): Promise<Lead> {
        const response = await fetch(`${API_URL}/leads/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });
        if (!response.ok) throw new Error('Erro ao enviar lead');
        return response.json();
    },
    async login(email: string, senha: string): Promise<Corretor> {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha, nome: 'Temp' })
        });
        if (!response.ok) throw new Error('E-mail ou senha inválidos');
        return response.json();
    },
    async cadastrarCorretor(nome: string, email: string, senha: string): Promise<Corretor> {
        const response = await fetch(`${API_URL}/corretores/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        if (!response.ok) throw new Error('Erro ao cadastrar corretor');
        return response.json();
    },
    async getCorretores(): Promise<Corretor[]> {
        const response = await fetch(`${API_URL}/corretores/`);
        if (!response.ok) throw new Error('Erro ao buscar corretores');
        return response.json();
    },
    async cadastrarUsuario(nome: string, email: string, senha: string): Promise<Usuario> {
        const response = await fetch(`${API_URL}/usuarios/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        if (!response.ok) throw new Error('Erro ao cadastrar usuário');
        return response.json();
    },
    async loginUsuario(email: string, senha: string): Promise<Usuario> {
        const response = await fetch(`${API_URL}/login/usuario/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha, nome: 'Temp' })
        });
        if (!response.ok) throw new Error('E-mail ou senha inválidos');
        return response.json();
    },
    async cadastrarImovel(imovel: Imovel): Promise<Imovel> {
        const response = await fetch(`${API_URL}/imoveis/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imovel)
        });
        if (!response.ok) throw new Error('Erro ao cadastrar imovel');
        return response.json();
    },
    async getLeads(): Promise<Lead[]> {
        const response = await fetch(`${API_URL}/leads/`);
        if (!response.ok) throw new Error('Erro ao buscar leads');
        return response.json();
    },
    async atualizarLead(id: number, lead: Partial<Lead>): Promise<Lead> {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });
        if (!response.ok) throw new Error('Erro ao atualizar lead');
        return response.json();
    },
    async excluirLead(id: number): Promise<{ status: string; message: string }> {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir lead');
        return response.json();
    },
    async registrarVisita(imovelId: number): Promise<{ status: string; visitas_hoje: number }> {
        const response = await fetch(`${API_URL}/imoveis/${imovelId}/visitas/`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Erro ao registrar visita');
        return response.json();
    },
    async obterEstatisticas(): Promise<Estatistica[]> {
        const response = await fetch(`${API_URL}/estatisticas/`);
        if (!response.ok) throw new Error('Erro ao buscar estatísticas');
        return response.json();
    },
    async atualizarImovel(id: number, imovel: Imovel): Promise<Imovel> {
        const response = await fetch(`${API_URL}/imoveis/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imovel)
        });
        if (!response.ok) throw new Error('Erro ao atualizar imovel');
        return response.json();
    },
    async excluirImovel(id: number): Promise<{ status: string; message: string }> {
        const response = await fetch(`${API_URL}/imoveis/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir imovel');
        return response.json();
    }
};
