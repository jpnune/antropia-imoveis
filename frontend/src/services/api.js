const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
    async getImoveis() {
        const response = await fetch(`${API_URL}/imoveis/`);
        if (!response.ok) throw new Error('Erro ao buscar imoveis');
        return response.json();
    },
    async getImovel(id) {
        const response = await fetch(`${API_URL}/imoveis/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar imovel');
        return response.json();
    },
    async enviarLead(lead) {
        const response = await fetch(`${API_URL}/leads/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });
        if (!response.ok) throw new Error('Erro ao enviar lead');
        return response.json();
    },
    async login(email, senha) {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha, nome: 'Temp' })
        });
        if (!response.ok) throw new Error('E-mail ou senha inválidos');
        return response.json();
    },
    async cadastrarImovel(imovel) {
        const response = await fetch(`${API_URL}/imoveis/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imovel)
        });
        if (!response.ok) throw new Error('Erro ao cadastrar imovel');
        return response.json();
    },
    async getLeads() {
        const response = await fetch(`${API_URL}/leads/`);
        if (!response.ok) throw new Error('Erro ao buscar leads');
        return response.json();
    },
    async atualizarLead(id, lead) {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });
        if (!response.ok) throw new Error('Erro ao atualizar lead');
        return response.json();
    },
    async excluirLead(id) {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir lead');
        return response.json();
    },
    async registrarVisita(imovelId) {
        const response = await fetch(`${API_URL}/imoveis/${imovelId}/visitas/`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Erro ao registrar visita');
        return response.json();
    },
    async obterEstatisticas() {
        const response = await fetch(`${API_URL}/estatisticas/`);
        if (!response.ok) throw new Error('Erro ao buscar estatísticas');
        return response.json();
    },
    async atualizarImovel(id, imovel) {
        const response = await fetch(`${API_URL}/imoveis/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imovel)
        });
        if (!response.ok) throw new Error('Erro ao atualizar imovel');
        return response.json();
    },
    async excluirImovel(id) {
        const response = await fetch(`${API_URL}/imoveis/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir imovel');
        return response.json();
    }
};
