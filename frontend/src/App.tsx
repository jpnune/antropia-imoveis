import React, { useState, useEffect } from 'react';
import { Search, MapPin, BedDouble, Bath, Car, Maximize, Phone, Mail, ChevronLeft, Send, CheckCircle, Lock, ClipboardList, PlusCircle, LogOut, BarChart3, Upload } from 'lucide-react';
import { api, Imovel, Lead, Corretor, Usuario, Estatistica } from './services/api';

const STATUS_COLUNAS = ['Novo', 'Contatado', 'Visita Agendada', 'Fechado'];

function App() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [tipo, setTipo] = useState<string>('');
  const [maxPreco, setMaxPreco] = useState<string>('');
  const [minQuartos, setMinQuartos] = useState<string | number>('');
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Controle do Modo (Público vs Corretor)
  const [modoCorretor, setModoCorretor] = useState<boolean>(false);
  const [corretorLogado, setCorretorLogado] = useState<Corretor | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [modoUsuario, setModoUsuario] = useState<boolean>(false);
  const [abaAtiva, setAbaAtiva] = useState<string>('leads');

  // Estados do Formulário de Login / Inscrição
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginSenha, setLoginSenha] = useState<string>('');
  const [loginErro, setLoginErro] = useState<string>('');
  const [loginRole, setLoginRole] = useState<string>('corretor'); // 'corretor' ou 'usuario'
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [signupNome, setSignupNome] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupSenha, setSignupSenha] = useState<string>('');
  const [signupRole, setSignupRole] = useState<string>('corretor'); // 'corretor' ou 'usuario'

  // Lista de Corretores cadastrados
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [corretorPreferidoId, setCorretorPreferidoId] = useState<string>('');

  // Estados do formulário de Lead (Área Pública)
  const [leadNome, setLeadNome] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadTelefone, setLeadTelefone] = useState<string>('');
  const [leadMensagem, setLeadMensagem] = useState<string>('Tenho interesse neste imóvel. Gostaria de receber mais informações.');
  const [leadEnviado, setLeadEnviado] = useState<boolean>(false);

  // Estados do cadastro de imóvel
  const [novoTitulo, setNovoTitulo] = useState<string>('');
  const [novoDescricao, setNovoDescricao] = useState<string>('');
  const [novoPreco, setNovoPreco] = useState<string>('');
  const [novoQuartos, setNovoQuartos] = useState<string>('');
  const [novoBanheiros, setNovoBanheiros] = useState<string>('');
  const [novoVagas, setNovoVagas] = useState<string>('');
  const [novoArea, setNovoArea] = useState<string>('');
  const [novoTipo, setNovoTipo] = useState<string>('Casa');
  const [novoCidade, setNovoCidade] = useState<string>('');
  const [novoBairro, setNovoBairro] = useState<string>('');
  const [novoImagemUrl, setNovoImagemUrl] = useState<string>('');
  const [cadastroSucesso, setCadastroSucesso] = useState<boolean>(false);

  // Estados de Edição de Imóvel (CRUD)
  const [imovelParaEditar, setImovelParaEditar] = useState<Imovel | null>(null);
  const [editTitulo, setEditTitulo] = useState<string>('');
  const [editDescricao, setEditDescricao] = useState<string>('');
  const [editPreco, setEditPreco] = useState<number | string>('');
  const [editQuartos, setEditQuartos] = useState<number | string>('');
  const [editBanheiros, setEditBanheiros] = useState<number | string>('');
  const [editVagas, setEditVagas] = useState<number | string>('');
  const [editArea, setEditArea] = useState<number | string>('');
  const [editTipo, setEditTipo] = useState<string>('Casa');
  const [editCidade, setEditCidade] = useState<string>('');
  const [editBairro, setEditBairro] = useState<string>('');
  const [editImagemUrl, setEditImagemUrl] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('Disponivel');

  // Estados de Gerenciamento de Leads (CRUD)
  const [leadParaEditar, setLeadParaEditar] = useState<Lead | null>(null);
  const [abrirModalLead, setAbrirModalLead] = useState<boolean>(false);
  const [leadFormNome, setLeadFormNome] = useState<string>('');
  const [leadFormEmail, setLeadFormEmail] = useState<string>('');
  const [leadFormTelefone, setLeadFormTelefone] = useState<string>('');
  const [leadFormMensagem, setLeadFormMensagem] = useState<string>('');
  const [leadFormStatus, setLeadFormStatus] = useState<string>('Novo');

  // Upload Local de Imagem
  const handleUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const LIMITE_5MB = 5 * 1024 * 1024;
      if (file.size > LIMITE_5MB) {
        alert('Erro: A imagem selecionada é muito grande. O limite máximo permitido é de 5MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoImagemUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const carregarImoveis = () => {
    api.getImoveis()
      .then(data => {
        setImoveis(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const carregarLeads = () => {
    api.getLeads()
      .then(data => setLeads(data))
      .catch(err => console.error('Erro ao carregar leads:', err));
  };

  const carregarEstatisticas = () => {
    api.obterEstatisticas()
      .then(data => setEstatisticas(data))
      .catch(err => console.error('Erro ao carregar estatísticas:', err));
  };

  const carregarCorretores = () => {
    api.getCorretores()
      .then(data => setCorretores(data))
      .catch(err => console.error('Erro ao carregar corretores:', err));
  };

  useEffect(() => {
    carregarImoveis();
    carregarCorretores();
  }, []);

  useEffect(() => {
    if (corretorLogado) {
      carregarLeads();
      carregarEstatisticas();
    }
  }, [corretorLogado]);

  useEffect(() => {
    if (usuarioLogado) {
      carregarCorretores();
    }
  }, [usuarioLogado]);

  const filtrados = imoveis.filter(imovel => {
    const matchBusca = imovel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       (imovel.bairro || '').toLowerCase().includes(busca.toLowerCase()) ||
                       (imovel.cidade || '').toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipo === '' || imovel.tipo === tipo;
    const matchPreco = maxPreco === '' || imovel.preco <= parseFloat(maxPreco);
    const matchQuartos = minQuartos === '' || (imovel.quartos || 0) >= (typeof minQuartos === 'string' ? parseInt(minQuartos) : minQuartos);
    return matchBusca && matchTipo && matchPreco && matchQuartos;
  });

  const handleEnviarLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nome: leadNome,
        email: leadEmail,
        telefone: leadTelefone,
        mensagem: leadMensagem,
        status_funil: 'Novo'
      };
      const mockNewLead: Lead = { ...payload, id: Date.now(), criado_em: new Date().toISOString() };
      setLeads([...leads, mockNewLead]);
      
      try {
        await api.enviarLead(payload);
      } catch (err) {
        console.warn('Salvo na memória local do cliente (API indisponível)');
      }

      setLeadEnviado(true);
      setLeadNome('');
      setLeadEmail('');
      setLeadTelefone('');
    } catch (err) {
      console.error('Falha ao enviar lead:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErro('');
    try {
      if (loginRole === 'corretor') {
        const user = await api.login(loginEmail, loginSenha);
        setCorretorLogado(user);
        setModoCorretor(true);
        setModoUsuario(false);
      } else {
        const user = await api.loginUsuario(loginEmail, loginSenha);
        setUsuarioLogado(user);
        setModoUsuario(true);
        setModoCorretor(false);
        setAbaAtiva('usuario-imoveis');
      }
    } catch (err) {
      setLoginErro('E-mail ou senha incorretos.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErro('');
    try {
      if (signupRole === 'corretor') {
        const user = await api.cadastrarCorretor(signupNome, signupEmail, signupSenha);
        setCorretorLogado(user);
        setModoCorretor(true);
        setModoUsuario(false);
      } else {
        const user = await api.cadastrarUsuario(signupNome, signupEmail, signupSenha);
        setUsuarioLogado(user);
        setModoUsuario(true);
        setModoCorretor(false);
        setAbaAtiva('usuario-imoveis');
      }
      setIsSignUp(false);
      setSignupNome('');
      setSignupEmail('');
      setSignupSenha('');
    } catch (err) {
      setLoginErro('Falha no cadastro. Verifique os dados ou se o e-mail já existe.');
    }
  };

  const handleMudarStatusLead = async (leadId: number, novoStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const updatedLead = { ...lead, status_funil: novoStatus };
    setLeads(leads.map(l => l.id === leadId ? updatedLead : l));
    try {
      await api.atualizarLead(leadId, updatedLead);
    } catch (err) {
      console.error('Falha ao atualizar status no servidor', err);
    }
  };

  const iniciarCriacaoLead = () => {
    setLeadParaEditar(null);
    setLeadFormNome('');
    setLeadFormEmail('');
    setLeadFormTelefone('');
    setLeadFormMensagem('Interesse manual adicionado pelo corretor.');
    setLeadFormStatus('Novo');
    setAbrirModalLead(true);
  };

  const iniciarEdicaoLead = (lead: Lead) => {
    setLeadParaEditar(lead);
    setLeadFormNome(lead.nome);
    setLeadFormEmail(lead.email);
    setLeadFormTelefone(lead.telefone || '');
    setLeadFormMensagem(lead.mensagem || '');
    setLeadFormStatus(lead.status_funil || 'Novo');
    setAbrirModalLead(true);
  };

  const handleExcluirLead = async (id: number) => {
    if (window.confirm('Deseja realmente remover este lead?')) {
      setLeads(leads.filter(l => l.id !== id));
      try {
        await api.excluirLead(id);
      } catch (err) {
        console.error('Erro ao remover lead no servidor:', err);
      }
    }
  };

  const handleSalvarLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: leadFormNome,
      email: leadFormEmail,
      telefone: leadFormTelefone,
      mensagem: leadFormMensagem,
      status_funil: leadFormStatus
    };

    if (leadParaEditar && leadParaEditar.id) {
      setLeads(leads.map(l => l.id === leadParaEditar.id ? { ...l, ...payload } : l));
      try {
        await api.atualizarLead(leadParaEditar.id, payload);
      } catch (err) {
        console.error('Erro ao editar lead no servidor:', err);
      }
    } else {
      const mockLead: Lead = { ...payload, id: Date.now(), criado_em: new Date().toISOString() };
      setLeads([...leads, mockLead]);
      try {
        await api.enviarLead(payload);
      } catch (err) {
        console.error('Erro ao salvar lead no servidor:', err);
      }
    }
    setAbrirModalLead(false);
  };

  const handleCadastrarImovel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Imovel = {
        titulo: novoTitulo,
        descricao: novoDescricao,
        preco: parseFloat(novoPreco),
        quartos: parseInt(novoQuartos) || 0,
        banheiros: parseInt(novoBanheiros) || 0,
        vagas: parseInt(novoVagas) || 0,
        area: parseFloat(novoArea) || 0.0,
        tipo: novoTipo,
        cidade: novoCidade,
        bairro: novoBairro,
        imagem_url: novoImagemUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        status: 'Disponivel',
        usuario_id: usuarioLogado ? usuarioLogado.id : null,
        corretor_preferido_id: (usuarioLogado && corretorPreferidoId) ? parseInt(corretorPreferidoId) : null
      };
      
      setImoveis([...imoveis, { ...payload, id: Date.now() }]);
      
      try {
        await api.cadastrarImovel(payload);
      } catch (err) {
        console.warn('Salvando temporariamente na memória local (API indisponível)');
      }

      setCadastroSucesso(true);
      setNovoTitulo('');
      setNovoDescricao('');
      setNovoPreco('');
      setNovoQuartos('');
      setNovoBanheiros('');
      setNovoVagas('');
      setNovoArea('');
      setNovoCidade('');
      setNovoBairro('');
      setNovoImagemUrl('');

      setTimeout(() => setCadastroSucesso(false), 3000);
    } catch (err) {
      console.error('Falha no cadastro:', err);
    }
  };

  const iniciarEdicao = (imovel: Imovel) => {
    setImovelParaEditar(imovel);
    setEditTitulo(imovel.titulo);
    setEditDescricao(imovel.descricao || '');
    setEditPreco(imovel.preco);
    setEditQuartos(imovel.quartos || '');
    setEditBanheiros(imovel.banheiros || '');
    setEditVagas(imovel.vagas || '');
    setEditArea(imovel.area || '');
    setEditTipo(imovel.tipo || 'Casa');
    setEditCidade(imovel.cidade || '');
    setEditBairro(imovel.bairro || '');
    setEditImagemUrl(imovel.imagem_url || '');
    setEditStatus(imovel.status || 'Disponivel');
    setAbaAtiva('cadastrar');
  };

  const handleExcluirImovel = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      setImoveis(imoveis.filter(im => im.id !== id));
      try {
        await api.excluirImovel(id);
      } catch (err) {
        console.error('Falha ao excluir imovel do servidor:', err);
      }
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imovelParaEditar || !imovelParaEditar.id) return;
    try {
      const payload: Imovel = {
        titulo: editTitulo,
        descricao: editDescricao,
        preco: parseFloat(editPreco as string),
        quartos: parseInt(editQuartos as string) || 0,
        banheiros: parseInt(editBanheiros as string) || 0,
        vagas: parseInt(editVagas as string) || 0,
        area: parseFloat(editArea as string) || 0.0,
        tipo: editTipo,
        cidade: editCidade,
        bairro: editBairro,
        imagem_url: editImagemUrl,
        status: editStatus,
        usuario_id: imovelParaEditar.usuario_id || null,
        corretor_preferido_id: imovelParaEditar.corretor_preferido_id || null
      };
      
      setImoveis(imoveis.map(im => im.id === imovelParaEditar.id ? { ...im, ...payload } : im));
      
      try {
        await api.atualizarImovel(imovelParaEditar.id, payload);
      } catch (err) {
        console.warn('Erro ao atualizar no servidor, atualizado apenas localmente');
      }

      setImovelParaEditar(null);
      setAbaAtiva(usuarioLogado ? 'usuario-imoveis' : 'imoveis');
    } catch (err) {
      console.error('Falha ao salvar edição:', err);
    }
  };

  const handleUploadLocalEdicao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const LIMITE_5MB = 5 * 1024 * 1024;
      if (file.size > LIMITE_5MB) {
        alert('Erro: A imagem é muito grande. O limite é 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setEditImagemUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setCorretorLogado(null);
    setUsuarioLogado(null);
    setModoCorretor(false);
    setModoUsuario(false);
  };

  const abrirDetalhes = (imovel: Imovel) => {
    setImovelSelecionado(imovel);
    setLeadEnviado(false);
    if (imovel.id) {
        api.registrarVisita(imovel.id).catch(err => console.warn('Falha ao gravar estatística de acesso:', err));
    }
  };

  const obterVisitasPorImovel = (imovelId?: number) => {
    if (!imovelId) return 0;
    return estatisticas
      .filter(stat => stat.imovel_id === imovelId)
      .reduce((acc, curr) => acc + curr.quantidade, 0);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ backgroundColor: 'var(--surface)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { setImovelSelecionado(null); setModoCorretor(false); setModoUsuario(false); }}>
          Antropia Imóveis
        </h1>
        {corretorLogado || usuarioLogado ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Olá, <strong>{corretorLogado ? corretorLogado.nome : usuarioLogado?.nome}</strong> ({corretorLogado ? 'Corretor' : 'Proprietário'})</span>
            <button 
              onClick={() => {
                if (corretorLogado) {
                  setModoCorretor(!modoCorretor);
                  setModoUsuario(false);
                } else {
                  setModoUsuario(!modoUsuario);
                  setModoCorretor(false);
                }
              }} 
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              {modoCorretor || modoUsuario ? 'Ver Site Público' : 'Ir para o Painel'}
            </button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
              <LogOut size={18} />
              Sair
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={() => { setModoCorretor(true); setModoUsuario(false); setLoginRole('corretor'); setIsSignUp(false); }} 
              style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}
            >
              Login
            </button>
            <button 
              onClick={() => { setModoUsuario(true); setModoCorretor(false); setSignupRole('usuario'); setIsSignUp(true); }} 
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              Cadastre-se
            </button>
          </div>
        )}
      </header>

      {((modoCorretor && !corretorLogado) || (modoUsuario && !usuarioLogado)) ? (
        /* Tela de Login / Inscrição Unificada */
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <Lock size={40} />
            </div>
            
            {isSignUp ? (
              <>
                <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>Criar Nova Conta</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Cadastre-se no portal Antropia Imóveis.
                </p>

                {loginErro && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {loginErro}
                  </div>
                )}

                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Perfil da Conta</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setSignupRole('usuario')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: signupRole === 'usuario' ? 'var(--primary)' : '#fff', color: signupRole === 'usuario' ? '#fff' : 'var(--text)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Proprietário/Cliente
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSignupRole('corretor')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: signupRole === 'corretor' ? 'var(--primary)' : '#fff', color: signupRole === 'corretor' ? '#fff' : 'var(--text)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Corretor Parceiro
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Nome Completo</label>
                    <input 
                      type="text" 
                      required 
                      value={signupNome}
                      onChange={e => setSignupNome(e.target.value)}
                      placeholder="Ex: Pedro de Souza"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>E-mail</label>
                    <input 
                      type="email" 
                      required 
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="Ex: pedro@gmail.com"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Senha</label>
                    <input 
                      type="password" 
                      required 
                      value={signupSenha}
                      onChange={e => setSignupSenha(e.target.value)}
                      placeholder="Senha de acesso"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}
                  >
                    Registrar Conta
                  </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Já possui uma conta?{' '}
                  <button onClick={() => { setIsSignUp(false); setLoginErro(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                    Faça Login
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  {loginRole === 'corretor' ? 'Acesso do Corretor' : 'Acesso do Proprietário'}
                </h2>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Faça login para gerenciar imóveis e leads.
                </p>

                {loginErro && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {loginErro}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Tipo de Acesso</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => { setLoginRole('usuario'); setModoUsuario(true); setModoCorretor(false); }}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: loginRole === 'usuario' ? 'var(--primary)' : '#fff', color: loginRole === 'usuario' ? '#fff' : 'var(--text)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Proprietário
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setLoginRole('corretor'); setModoCorretor(true); setModoUsuario(false); }}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: loginRole === 'corretor' ? 'var(--primary)' : '#fff', color: loginRole === 'corretor' ? '#fff' : 'var(--text)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Corretor
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>E-mail</label>
                    <input 
                      type="email" 
                      required 
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder={loginRole === 'corretor' ? 'corretor@antropia.com' : 'usuario@antropia.com'}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Senha de acesso</label>
                    <input 
                      type="password" 
                      required 
                      value={loginSenha}
                      onChange={e => setLoginSenha(e.target.value)}
                      placeholder="Sua senha secreta"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}
                  >
                    Entrar no Painel
                  </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Ainda não tem cadastro?{' '}
                  <button onClick={() => { setIsSignUp(true); setLoginErro(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                    Cadastre-se aqui
                  </button>
                </p>

                {/* Dicas de credenciais removidas por segurança */}
              </>
            )}
          </div>
        </main>
      ) : modoCorretor && corretorLogado ? (
        /* Painel Administrativo */
        <main style={{ flex: 1, padding: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
            <button 
              onClick={() => setAbaAtiva('leads')} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', cursor: 'pointer', paddingBottom: '0.5rem', color: abaAtiva === 'leads' ? 'var(--primary)' : 'var(--text-light)', borderBottom: abaAtiva === 'leads' ? '2px solid var(--primary)' : 'none', fontWeight: abaAtiva === 'leads' ? 'bold' : 'normal' }}
            >
              <ClipboardList size={20} />
              Gerenciar Leads (CRM)
            </button>
            <button 
              onClick={() => { setAbaAtiva('cadastrar'); setImovelParaEditar(null); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', cursor: 'pointer', paddingBottom: '0.5rem', color: abaAtiva === 'cadastrar' && !imovelParaEditar ? 'var(--primary)' : 'var(--text-light)', borderBottom: abaAtiva === 'cadastrar' && !imovelParaEditar ? '2px solid var(--primary)' : 'none', fontWeight: abaAtiva === 'cadastrar' && !imovelParaEditar ? 'bold' : 'normal' }}
            >
              <PlusCircle size={20} />
              Cadastrar Imóvel
            </button>
            <button 
              onClick={() => { setAbaAtiva('imoveis'); setImovelParaEditar(null); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', cursor: 'pointer', paddingBottom: '0.5rem', color: abaAtiva === 'imoveis' || (abaAtiva === 'cadastrar' && imovelParaEditar) ? 'var(--primary)' : 'var(--text-light)', borderBottom: abaAtiva === 'imoveis' || (abaAtiva === 'cadastrar' && imovelParaEditar) ? '2px solid var(--primary)' : 'none', fontWeight: abaAtiva === 'imoveis' || (abaAtiva === 'cadastrar' && imovelParaEditar) ? 'bold' : 'normal' }}
            >
              <Search size={20} />
              Meus Imóveis (CRUD)
            </button>
            <button 
              onClick={() => { setAbaAtiva('metricas'); carregarEstatisticas(); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', cursor: 'pointer', paddingBottom: '0.5rem', color: abaAtiva === 'metricas' ? 'var(--primary)' : 'var(--text-light)', borderBottom: abaAtiva === 'metricas' ? '2px solid var(--primary)' : 'none', fontWeight: abaAtiva === 'metricas' ? 'bold' : 'normal' }}
            >
              <BarChart3 size={20} />
              Métricas e Acessos
            </button>
          </div>

          {abaAtiva === 'cadastrar' ? (
            /* Cadastro ou Edição de Imóvel */
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{imovelParaEditar ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}</h3>

              {cadastroSucesso && (
                <div style={{ backgroundColor: '#dcfce7', color: 'var(--success)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} />
                  Imóvel cadastrado com sucesso!
                </div>
              )}

              <form onSubmit={imovelParaEditar ? handleSalvarEdicao : handleCadastrarImovel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Título do Imóvel</label>
                  <input type="text" required value={imovelParaEditar ? editTitulo : novoTitulo} onChange={e => imovelParaEditar ? setEditTitulo(e.target.value) : setNovoTitulo(e.target.value)} placeholder="Ex: Sobrado Moderno de Esquina" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Descrição do Imóvel</label>
                  <textarea rows={4} value={imovelParaEditar ? editDescricao : novoDescricao} onChange={e => imovelParaEditar ? setEditDescricao(e.target.value) : setNovoDescricao(e.target.value)} placeholder="Detalhes sobre acabamento, diferenciais..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', resize: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Preço (R$)</label>
                  <input type="number" required value={imovelParaEditar ? editPreco : novoPreco} onChange={e => imovelParaEditar ? setEditPreco(e.target.value) : setNovoPreco(e.target.value)} placeholder="Ex: 850000" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Tipo do Imóvel</label>
                  <select value={imovelParaEditar ? editTipo : novoTipo} onChange={e => imovelParaEditar ? setEditTipo(e.target.value) : setNovoTipo(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', backgroundColor: '#fff' }}>
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Quartos</label>
                  <input type="number" value={imovelParaEditar ? editQuartos : novoQuartos} onChange={e => imovelParaEditar ? setEditQuartos(e.target.value) : setNovoQuartos(e.target.value)} placeholder="Ex: 3" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Banheiros</label>
                  <input type="number" value={imovelParaEditar ? editBanheiros : novoBanheiros} onChange={e => imovelParaEditar ? setEditBanheiros(e.target.value) : setNovoBanheiros(e.target.value)} placeholder="Ex: 2" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Vagas de Garagem</label>
                  <input type="number" value={imovelParaEditar ? editVagas : novoVagas} onChange={e => imovelParaEditar ? setEditVagas(e.target.value) : setNovoVagas(e.target.value)} placeholder="Ex: 2" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Área Útil (m²)</label>
                  <input type="number" value={imovelParaEditar ? editArea : novoArea} onChange={e => imovelParaEditar ? setEditArea(e.target.value) : setNovoArea(e.target.value)} placeholder="Ex: 150" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cidade</label>
                  <input type="text" required value={imovelParaEditar ? editCidade : novoCidade} onChange={e => imovelParaEditar ? setEditCidade(e.target.value) : setNovoCidade(e.target.value)} placeholder="Ex: Sorocaba" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Bairro</label>
                  <input type="text" required value={imovelParaEditar ? editBairro : novoBairro} onChange={e => imovelParaEditar ? setEditBairro(e.target.value) : setNovoBairro(e.target.value)} placeholder="Ex: Campolim" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                {imovelParaEditar && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>Status do Imóvel</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', backgroundColor: '#fff' }}>
                      <option value="Disponivel">Disponível</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Alugado">Alugado</option>
                    </select>
                  </div>
                )}

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500' }}>Foto do Imóvel</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e2e8f0', color: 'var(--text)', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                      <Upload size={18} />
                      Carregar Computador
                      <input type="file" accept="image/*" onChange={imovelParaEditar ? handleUploadLocalEdicao : handleUploadLocal} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>ou cole a URL da imagem abaixo</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <input type="url" value={imovelParaEditar ? editImagemUrl : novoImagemUrl} onChange={e => imovelParaEditar ? setEditImagemUrl(e.target.value) : setNovoImagemUrl(e.target.value)} placeholder="https://exemplo.com/foto.jpg" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  {imovelParaEditar && (
                    <button type="button" onClick={() => { setImovelParaEditar(null); setAbaAtiva('imoveis'); }} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                  )}
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{imovelParaEditar ? 'Salvar Alterações' : 'Salvar Imóvel'}</button>
                </div>
              </form>
            </div>
          ) : abaAtiva === 'imoveis' ? (
            /* Gerenciamento de Imóveis (Meus Imóveis CRUD) */
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '1000px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Gerenciar Meus Imóveis</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Visualize, edite ou remova os imóveis atualmente cadastrados no portal.</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Imagem</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Título</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Tipo</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Local</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Preço</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imoveis.map(im => (
                      <tr key={im.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.95rem' }}>
                        <td style={{ padding: '1rem' }}>
                          <img src={im.imagem_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt={im.titulo} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{im.titulo}</td>
                        <td style={{ padding: '1rem' }}>{im.tipo}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-light)' }}>{im.bairro}, {im.cidade}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{im.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold',
                            backgroundColor: im.status === 'Disponivel' ? '#dcfce7' : im.status === 'Vendido' ? '#fee2e2' : '#fef9c3',
                            color: im.status === 'Disponivel' ? '#16a34a' : im.status === 'Vendido' ? '#dc2626' : '#ca8a04'
                          }}>
                            {im.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button onClick={() => iniciarEdicao(im)} style={{ backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.85rem' }}>Editar</button>
                          {im.id && <button onClick={() => handleExcluirImovel(im.id!)} style={{ backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Excluir</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : abaAtiva === 'metricas' ? (
            /* Visualização de Métricas */
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '1000px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Estatísticas de Acesso</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Monitore a quantidade de visitas que cada imóvel obteve de potenciais clientes no site.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {imoveis.map(imovel => {
                  const totalVisitas = obterVisitasPorImovel(imovel.id);
                  const maxVisitas = Math.max(...imoveis.map(im => obterVisitasPorImovel(im.id)), 1);
                  const porcentagemBarra = (totalVisitas / maxVisitas) * 100;

                  return (
                    <div key={imovel.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 0.5fr', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text)', display: 'block' }}>{imovel.titulo}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{imovel.bairro}, {imovel.cidade}</span>
                      </div>
                      <div style={{ backgroundColor: 'var(--border)', height: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ backgroundColor: 'var(--primary)', height: '100%', width: `${porcentagemBarra}%`, transition: 'width 0.5s ease-in-out' }}></div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {totalVisitas} {totalVisitas === 1 ? 'visita' : 'visitas'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Quadro Kanban (CRM) */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', maxWidth: '1200px', margin: '0 auto 1.5rem auto' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>Funil de Vendas - CRM</h3>
                <button 
                  onClick={iniciarCriacaoLead}
                  style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <PlusCircle size={18} />
                  Novo Lead
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: '500px', alignItems: 'start' }}>
                {STATUS_COLUNAS.map(status => {
                  const leadsNaColuna = leads.filter(lead => lead.status_funil === status);
                  return (
                    <div key={status} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', minHeight: '400px' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
                        <span>{status}</span>
                        <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--border)', padding: '2px 8px', borderRadius: '12px' }}>{leadsNaColuna.length}</span>
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {leadsNaColuna.map(lead => (
                          <div key={lead.id} style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text)' }}>{lead.nome}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>{lead.telefone}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.5rem' }}>{lead.email}</span>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.75rem', fontStyle: 'italic' }}>"{lead.mensagem}"</p>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <button onClick={() => iniciarEdicaoLead(lead)} style={{ flex: 1, backgroundColor: '#e2e8f0', border: 'none', padding: '0.25rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Editar</button>
                              {lead.id && <button onClick={() => handleExcluirLead(lead.id!)} style={{ flex: 1, backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.25rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Excluir</button>}
                            </div>

                            <select 
                              value={lead.status_funil} 
                              onChange={e => lead.id && handleMudarStatusLead(lead.id, e.target.value)}
                              style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                            >
                              {STATUS_COLUNAS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal de Lead (Adicionar/Editar) */}
              {abrirModalLead && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                  <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{leadParaEditar ? 'Editar Lead' : 'Novo Lead'}</h3>
                    <form onSubmit={handleSalvarLead} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Nome Completo</label>
                        <input type="text" required value={leadFormNome} onChange={e => setLeadFormNome(e.target.value)} placeholder="Ex: João da Silva" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>E-mail</label>
                        <input type="email" required value={leadFormEmail} onChange={e => setLeadFormEmail(e.target.value)} placeholder="Ex: joao@exemplo.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Telefone</label>
                        <input type="text" required value={leadFormTelefone} onChange={e => setLeadFormTelefone(e.target.value)} placeholder="Ex: (15) 99999-9999" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Mensagem/Observação</label>
                        <textarea rows={3} required value={leadFormMensagem} onChange={e => setLeadFormMensagem(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', resize: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Status do Funil</label>
                        <select value={leadFormStatus} onChange={e => setLeadFormStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', backgroundColor: '#fff' }}>
                          {STATUS_COLUNAS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setAbrirModalLead(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar Lead</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      ) : modoUsuario && usuarioLogado ? (
        /* Painel do Proprietário */
        <main style={{ flex: 1, padding: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
            <button 
              onClick={() => { setAbaAtiva('usuario-imoveis'); setImovelParaEditar(null); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', cursor: 'pointer', paddingBottom: '0.5rem', color: abaAtiva === 'usuario-imoveis' || (abaAtiva === 'cadastrar' && imovelParaEditar) ? 'var(--primary)' : 'var(--text-light)', borderBottom: abaAtiva === 'usuario-imoveis' || (abaAtiva === 'cadastrar' && imovelParaEditar) ? '2px solid var(--primary)' : 'none', fontWeight: abaAtiva === 'usuario-imoveis' || (abaAtiva === 'cadastrar' && imovelParaEditar) ? 'bold' : 'normal' }}
            >
              <Search size={20} />
              Meus Imóveis Cadastrados
            </button>
            <button 
              onClick={() => { setAbaAtiva('cadastrar'); setImovelParaEditar(null); setCorretorPreferidoId(''); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', cursor: 'pointer', paddingBottom: '0.5rem', color: abaAtiva === 'cadastrar' && !imovelParaEditar ? 'var(--primary)' : 'var(--text-light)', borderBottom: abaAtiva === 'cadastrar' && !imovelParaEditar ? '2px solid var(--primary)' : 'none', fontWeight: abaAtiva === 'cadastrar' && !imovelParaEditar ? 'bold' : 'normal' }}
            >
              <PlusCircle size={20} />
              Anunciar Novo Imóvel
            </button>
          </div>

          {abaAtiva === 'cadastrar' ? (
            /* Formulário de Cadastro/Edição de Imóvel para Proprietário */
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{imovelParaEditar ? 'Editar Imóvel' : 'Anunciar Novo Imóvel'}</h3>

              {cadastroSucesso && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
                  <CheckCircle size={20} />
                  <span>Imóvel registrado com sucesso!</span>
                </div>
              )}

              <form onSubmit={imovelParaEditar ? handleSalvarEdicao : handleCadastrarImovel} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Título do Anúncio</label>
                    <input type="text" required value={imovelParaEditar ? editTitulo : novoTitulo} onChange={e => imovelParaEditar ? setEditTitulo(e.target.value) : setNovoTitulo(e.target.value)} placeholder="Ex: Casa aconchegante com jardim" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Preço (R$)</label>
                    <input type="number" required value={imovelParaEditar ? editPreco : novoPreco} onChange={e => imovelParaEditar ? setEditPreco(e.target.value) : setNovoPreco(e.target.value)} placeholder="Ex: 350000" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Descrição do Imóvel</label>
                  <textarea rows={3} value={imovelParaEditar ? editDescricao : novoDescricao} onChange={e => imovelParaEditar ? setEditDescricao(e.target.value) : setNovoDescricao(e.target.value)} placeholder="Detalhes sobre localização, diferenciais..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', resize: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Quartos</label>
                    <input type="number" required value={imovelParaEditar ? editQuartos : novoQuartos} onChange={e => imovelParaEditar ? setEditQuartos(e.target.value) : setNovoQuartos(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Banheiros</label>
                    <input type="number" required value={imovelParaEditar ? editBanheiros : novoBanheiros} onChange={e => imovelParaEditar ? setEditBanheiros(e.target.value) : setNovoBanheiros(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Vagas de Garagem</label>
                    <input type="number" value={imovelParaEditar ? editVagas : novoVagas} onChange={e => imovelParaEditar ? setEditVagas(e.target.value) : setNovoVagas(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Área Útil (m²)</label>
                    <input type="number" required value={imovelParaEditar ? editArea : novoArea} onChange={e => imovelParaEditar ? setEditArea(e.target.value) : setNovoArea(e.target.value)} placeholder="Ex: 120" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Tipo</label>
                    <select value={imovelParaEditar ? editTipo : novoTipo} onChange={e => imovelParaEditar ? setEditTipo(e.target.value) : setNovoTipo(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', backgroundColor: '#fff' }}>
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cidade</label>
                    <input type="text" required value={imovelParaEditar ? editCidade : novoCidade} onChange={e => imovelParaEditar ? setEditCidade(e.target.value) : setNovoCidade(e.target.value)} placeholder="Ex: Campinas" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Bairro</label>
                    <input type="text" required value={imovelParaEditar ? editBairro : novoBairro} onChange={e => imovelParaEditar ? setEditBairro(e.target.value) : setNovoBairro(e.target.value)} placeholder="Ex: Centro" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                </div>

                {!imovelParaEditar && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--primary)', fontWeight: 'bold' }}>Indicar Corretor de Preferência (Opcional)</label>
                    <select 
                      value={corretorPreferidoId} 
                      onChange={e => setCorretorPreferidoId(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--primary)', outline: 'none', backgroundColor: '#fff' }}
                    >
                      <option value="">Nenhum (Qualquer corretor disponível)</option>
                      {corretores.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Foto do Imóvel</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e2e8f0', color: 'var(--text)', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      <Upload size={18} />
                      Escolher Foto
                      <input type="file" accept="image/*" onChange={imovelParaEditar ? handleUploadLocalEdicao : handleUploadLocal} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {(imovelParaEditar ? editImagemUrl : novoImagemUrl) ? '✓ Foto carregada com sucesso' : 'Nenhuma imagem selecionada (será usada imagem padrão)'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setAbaAtiva('usuario-imoveis')} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {imovelParaEditar ? 'Salvar Edição' : 'Publicar Imóvel'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Listagem de Imóveis do Usuário Proprietário */
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Seus Imóveis Registrados</h3>
              
              {imoveis.filter(im => im.usuario_id === usuarioLogado.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Você ainda não cadastrou nenhum imóvel no portal.</p>
                  <button onClick={() => setAbaAtiva('cadastrar')} style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Cadastrar Meu Primeiro Imóvel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                  {imoveis.filter(im => im.usuario_id === usuarioLogado.id).map(imovel => {
                    const corr = corretores.find(c => c.id === imovel.corretor_preferido_id);
                    return (
                      <div key={imovel.id} style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <img src={imovel.imagem_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt={imovel.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>{imovel.titulo}</h4>
                          <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            {imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>{imovel.bairro}, {imovel.cidade}</p>

                          {corr && (
                            <div style={{ fontSize: '0.8rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                              Corretor indicado: <strong>{corr.nome}</strong>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button onClick={() => iniciarEdicao(imovel)} style={{ flex: 1, backgroundColor: '#e2e8f0', color: 'var(--text)', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Editar</button>
                            {imovel.id && <button onClick={() => handleExcluirImovel(imovel.id!)} style={{ flex: 1, backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Excluir</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      ) : imovelSelecionado ? (
        /* Detalhes do Imóvel e Formulário de Captura de Leads */
        <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <button 
            onClick={() => setImovelSelecionado(null)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', marginBottom: '2rem', fontSize: '1rem' }}
          >
            <ChevronLeft size={20} />
            Voltar para a busca
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
            <div>
              <img src={imovelSelecionado.imagem_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt={imovelSelecionado.titulo} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} />
              <h2 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 'bold' }}>{imovelSelecionado.titulo}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-light)', fontSize: '1rem', marginBottom: '1.5rem' }}>
                <MapPin size={18} />
                <span>{imovelSelecionado.bairro}, {imovelSelecionado.cidade}</span>
              </div>

              <div style={{ display: 'flex', gap: '2rem', padding: '1rem 0', margin: '1.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  <BedDouble size={22} color="var(--primary)" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem' }}>Quartos</span>
                    <strong style={{ color: 'var(--text)' }}>{imovelSelecionado.quartos}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  <Bath size={22} color="var(--primary)" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem' }}>Banheiros</span>
                    <strong style={{ color: 'var(--text)' }}>{imovelSelecionado.banheiros}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  <Car size={22} color="var(--primary)" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem' }}>Vagas</span>
                    <strong style={{ color: 'var(--text)' }}>{imovelSelecionado.vagas}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  <Maximize size={22} color="var(--primary)" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem' }}>Área</span>
                    <strong style={{ color: 'var(--text)' }}>{imovelSelecionado.area} m²</strong>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text)' }}>Descrição</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{imovelSelecionado.descricao || 'Sem descrição adicional disponível.'}</p>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', height: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ color: 'var(--primary)', fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {imovelSelecionado.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text)' }}>Fale com um corretor</h3>

              {leadEnviado ? (
                <div style={{ backgroundColor: '#dcfce7', color: 'var(--success)', padding: '1rem', borderRadius: '6px', textAlign: 'center', fontWeight: '500' }}>
                  Mensagem enviada com sucesso! Em breve entraremos em contato.
                </div>
              ) : (
                <form onSubmit={handleEnviarLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <input type="text" required placeholder="Seu nome completo" value={leadNome} onChange={e => setLeadNome(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <input type="email" required placeholder="seu@email.com" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <input type="tel" required placeholder="(15) 99999-9999" value={leadTelefone} onChange={e => setLeadTelefone(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                  </div>
                  <div>
                    <textarea rows={4} required placeholder="Sua mensagem" value={leadMensagem} onChange={e => setLeadMensagem(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', resize: 'none' }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Send size={16} />
                    Enviar Mensagem
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* Catálogo Geral (Busca de Imóveis) */
        <>
          <section style={{ backgroundColor: 'var(--primary)', padding: '3rem 2rem', color: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: '700' }}>Encontre o imóvel dos seus sonhos</h2>
            <p style={{ opacity: 0.9 }}>As melhores oportunidades da região com atendimento diferenciado.</p>
          </section>

          <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Sidebar de Filtros (Aside Esquerdo) */}
            <aside style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'sticky', top: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text)' }}>Filtrar Imóveis</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text)' }}>Busca rápida</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem', backgroundColor: '#fff' }}>
                    <Search size={18} color="var(--text-light)" style={{ marginRight: '0.25rem' }} />
                    <input 
                      type="text" 
                      placeholder="Cidade, bairro..." 
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text)' }}>Tipo de imóvel</label>
                  <select 
                    value={tipo} 
                    onChange={e => setTipo(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text)' }}>Preço máximo</label>
                  <select 
                    value={maxPreco} 
                    onChange={e => setMaxPreco(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <option value="">Qualquer preço</option>
                    <option value="300000">Até R$ 300.000</option>
                    <option value="500000">Até R$ 500.000</option>
                    <option value="1000000">Até R$ 1.000.000</option>
                    <option value="2000000">Até R$ 2.000.000</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text)' }}>Mínimo de quartos</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['', '1', '2', '3'].map(q => {
                      const isActive = (q === '' && minQuartos === '') || (parseInt(q) === minQuartos);
                      return (
                        <button
                          key={q || 'any'}
                          type="button"
                          onClick={() => setMinQuartos(q === '' ? '' : parseInt(q))}
                          style={{
                            flex: 1,
                            padding: '0.4rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            backgroundColor: isActive ? 'var(--primary)' : '#fff',
                            color: isActive ? '#fff' : 'var(--text)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          {q === '' ? 'Tds' : `${q}+`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => { setBusca(''); setTipo(''); setMaxPreco(''); setMinQuartos(''); }}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '500' }}
                >
                  Limpar Filtros
                </button>
              </div>
            </aside>

            {/* Grid de Imóveis à direita */}
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Imóveis em Destaque</h3>
              
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Carregando imóveis...</p>
              ) : filtrados.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Nenhum imóvel encontrado.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {filtrados.map(imovel => (
                    <div 
                      key={imovel.id} 
                      onClick={() => abrirDetalhes(imovel)}
                      style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <img src={imovel.imagem_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt={imovel.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                          {imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text)', fontWeight: '600' }}>{imovel.titulo}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          <MapPin size={14} />
                          <span>{imovel.bairro}, {imovel.cidade}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <BedDouble size={14} />
                            <span>{imovel.quartos} Qts</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Bath size={14} />
                            <span>{imovel.banheiros} Banh</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Maximize size={14} />
                            <span>{imovel.area} m²</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--text)', color: '#fff', padding: '2rem', textAlign: 'center', fontSize: '0.9rem', marginTop: 'auto' }}>
        <p>© 2026 Antropia Imóveis. Desenvolvido para portfólio.</p>
      </footer>
    </div>
  );
}

export default App;
