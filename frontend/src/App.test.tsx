import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import App from './App';

vi.mock('./services/api', () => ({
  api: {
    getImoveis: vi.fn().mockResolvedValue([
      {
        id: 1,
        titulo: "Sobrado Teste",
        descricao: "Sobrado moderno",
        preco: 950000.0,
        tipo: "Casa",
        quartos: 3,
        banheiros: 3,
        vagas: 2,
        area: 200.0,
        cidade: "Sorocaba",
        bairro: "Campolim",
        imagem_url: "",
        status: "Disponivel"
      }
    ]),
    getLeads: vi.fn().mockResolvedValue([]),
    obterEstatisticas: vi.fn().mockResolvedValue([]),
    registrarVisita: vi.fn().mockResolvedValue({}),
    enviarLead: vi.fn().mockResolvedValue({}),
    getCorretores: vi.fn().mockResolvedValue([]),
    login: vi.fn().mockResolvedValue({}),
    loginUsuario: vi.fn().mockResolvedValue({}),
    cadastrarCorretor: vi.fn().mockResolvedValue({}),
    cadastrarUsuario: vi.fn().mockResolvedValue({}),
    cadastrarImovel: vi.fn().mockResolvedValue({}),
    atualizarLead: vi.fn().mockResolvedValue({}),
    excluirLead: vi.fn().mockResolvedValue({}),
    atualizarImovel: vi.fn().mockResolvedValue({}),
    excluirImovel: vi.fn().mockResolvedValue({}),
  }
}));

describe('Testes do Componente App - Portal Imobiliário', () => {
  
  test('deve renderizar a área pública e listar o imóvel de teste', async () => {
    render(<App />);
    
    expect(screen.getByText('Antropia Imóveis')).toBeInTheDocument();
    
    const btnAcesso = screen.getByText('Acesso Corretor');
    expect(btnAcesso).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Sobrado Teste')).toBeInTheDocument();
    });
  });

  test('deve permitir clicar no botão Acesso Corretor e mostrar formulário de login', () => {
    render(<App />);
    
    const btnAcesso = screen.getByText('Acesso Corretor');
    fireEvent.click(btnAcesso);

    expect(screen.getByText('Acesso do Corretor')).toBeInTheDocument();
    
    const btnEntrar = screen.getByText('Entrar no Painel');
    expect(btnEntrar).toBeInTheDocument();
  });

  test('deve permitir preencher formulário de leads e clicar em Enviar Mensagem', async () => {
    render(<App />);

    await waitFor(() => {
      const card = screen.getByText('Sobrado Teste');
      fireEvent.click(card);
    });

    const inputNome = screen.getByPlaceholderText('Seu nome completo');
    const inputEmail = screen.getByPlaceholderText('seu@email.com');
    const inputTelefone = screen.getByPlaceholderText('(15) 99999-9999');
    const btnEnviar = screen.getByText('Enviar Mensagem');

    fireEvent.change(inputNome, { target: { value: 'João Teste' } });
    fireEvent.change(inputEmail, { target: { value: 'joao@teste.com' } });
    fireEvent.change(inputTelefone, { target: { value: '15999999999' } });

    fireEvent.click(btnEnviar);

    await waitFor(() => {
      expect(screen.getByText(/Mensagem enviada com sucesso/i)).toBeInTheDocument();
    });
  });
});
