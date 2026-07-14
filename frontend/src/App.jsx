import React, { useState, useEffect } from 'react';
import { Search, MapPin, BedDouble, Bath, Car, Maximize, Phone, Mail, ChevronLeft, Send, CheckCircle, Lock, ClipboardList, PlusCircle, LogOut, BarChart3, Upload } from 'lucide-react';
import { api } from './services/api';

const STATUS_COLUNAS = ['Novo', 'Contatado', 'Visita Agendada', 'Fechado'];

function App() {
  const [imoveis, setImoveis] = useState([]);
  const [leads, setLeads] = useState([]);
  const [estatisticas, setEstatisticas] = useState([]);
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controle do Modo (Público vs Corretor)
  const [modoCorretor, setModoCorretor] = useState(false);
  const [corretorLogado, setCorretorLogado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('leads');

  // Estados do Formulário de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState('');

  // Estados do formulário de Lead (Área Pública)
  const [leadNome, setLeadNome] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadTelefone, setLeadTelefone] = useState('');
  const [leadMensagem, setLeadMensagem] = useState('Tenho interesse neste imóvel. Gostaria de receber mais informações.');
  const [leadEnviado, setLeadEnviado] = useState(false);

  // Estados do cadastro de imóvel
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoDescricao, setNovoDescricao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoQuartos, setNovoQuartos] = useState('');
  const [novoBanheiros, setNovoBanheiros] = useState('');
  const [novoVagas, setNovoVagas] = useState('');
  const [novoArea, setNovoArea] = useState('');
  const [novoTipo, setNovoTipo] = useState('Casa');
  const [novoCidade, setNovoCidade] = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoImagemUrl, setNovoImagemUrl] = useState('');
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  // Estados de Edição de Imóvel (CRUD)
  const [imovelParaEditar, setImovelParaEditar] = useState(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editPreco, setEditPreco] = useState('');
  const [editQuartos, setEditQuartos] = useState('');
  const [editBanheiros, setEditBanheiros] = useState('');
  const [editVagas, setEditVagas] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editTipo, setEditTipo] = useState('Casa');
  const [editCidade, setEditCidade] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editImagemUrl, setEditImagemUrl] = useState('');
  const [editStatus, setEditStatus] = useState('Disponivel');


  // Upload Local de Imagem
  const handleUploadLocal = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limite de 5MB (5 * 1024 * 1024 bytes)
      const LIMITE_5MB = 5 * 1024 * 1024;
      if (file.size > LIMITE_5MB) {
        alert('Erro: A imagem selecionada é muito grande. O limite máximo permitido é de 5MB.');
        e.target.value = ''; // Reseta o input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Converte a imagem local carregada em base64
        setNovoImagemUrl(reader.result);
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

  useEffect(() => {
    carregarImoveis();
  }, []);

  useEffect(() => {
    if (corretorLogado) {
      carregarLeads();
      carregarEstatisticas();
    }
  }, [corretorLogado]);

  const filtrados = imoveis.filter(imovel => {
    const matchBusca = imovel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       imovel.bairro.toLowerCase().includes(busca.toLowerCase()) ||
                       imovel.cidade.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipo === '' || imovel.tipo === tipo;
    return matchBusca && matchTipo;
  });

  const handleEnviarLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: leadNome,
        email: leadEmail,
        telefone: leadTelefone,
        mensagem: leadMensagem,
        status_funil: 'Novo'
      };
      const mockNewLead = { ...payload, id: Date.now(), criado_em: new Date().toISOString() };
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErro('');
    try {
      if (loginEmail === 'corretor@antropia.com' && loginSenha === 'admin123') {
        const mockUser = { id: 1, nome: 'Corretor Demonstrativo', email: loginEmail };
        setCorretorLogado(mockUser);
        return;
      }
      const user = await api.login(loginEmail, loginSenha);
      setCorretorLogado(user);
    } catch (err) {
      setLoginErro('E-mail ou senha incorretos.');
    }
  };

  const handleMudarStatusLead = async (leadId, novoStatus) => {
    setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status_funil: novoStatus } : lead));
    try {
      await api.atualizarStatusLead(leadId, novoStatus);
    } catch (err) {
      console.error('Falha ao atualizar status no servidor, revertendo...', err);
    }
  };

  const handleCadastrarImovel = async (e) => {
    e.preventDefault();
    try {
      const payload = {
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
        status: 'Disponivel'
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

  const iniciarEdicao = (imovel) => {
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
    setAbaAtiva('cadastrar'); // Reutiliza a aba de cadastro com layout de edição
  };

  const handleExcluirImovel = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      setImoveis(imoveis.filter(im => im.id !== id));
      try {
        await api.excluirImovel(id);
      } catch (err) {
        console.error('Falha ao excluir imovel do servidor:', err);
      }
    }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titulo: editTitulo,
        descricao: editDescricao,
        preco: parseFloat(editPreco),
        quartos: parseInt(editQuartos) || 0,
        banheiros: parseInt(editBanheiros) || 0,
        vagas: parseInt(editVagas) || 0,
        area: parseFloat(editArea) || 0.0,
        tipo: editTipo,
        cidade: editCidade,
        bairro: editBairro,
        imagem_url: editImagemUrl,
        status: editStatus
      };
      
      setImoveis(imoveis.map(im => im.id === imovelParaEditar.id ? { ...im, ...payload } : im));
      
      try {
        await api.atualizarImovel(imovelParaEditar.id, payload);
      } catch (err) {
        console.warn('Erro ao atualizar no servidor, atualizado apenas localmente');
      }

      setImovelParaEditar(null);
      setAbaAtiva('imoveis');
    } catch (err) {
      console.error('Falha ao salvar edição:', err);
    }
  };

  const handleUploadLocalEdicao = (e) => {
    const file = e.target.files[0];
    if (file) {
      const LIMITE_5MB = 5 * 1024 * 1024;
      if (file.size > LIMITE_5MB) {
        alert('Erro: A imagem é muito grande. O limite é 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setEditImagemUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };


  const handleLogout = () => {
    setCorretorLogado(null);
    setModoCorretor(false);
  };

  const abrirDetalhes = (imovel) => {
    setImovelSelecionado(imovel);
    setLeadEnviado(false);
    api.registrarVisita(imovel.id).catch(err => console.warn('Falha ao gravar estatística de acesso:', err));
  };

  const obterVisitasPorImovel = (imovelId) => {
    return estatisticas
      .filter(stat => stat.imovel_id === imovelId)
      .reduce((acc, curr) => acc + curr.quantidade, 0);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ backgroundColor: 'var(--surface)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { setImovelSelecionado(null); setModoCorretor(false); }}>
          Antropia Imóveis
        </h1>
        {corretorLogado ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Olá, <strong>{corretorLogado.nome}</strong></span>
            <button 
              onClick={() => setModoCorretor(!modoCorretor)} 
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              {modoCorretor ? 'Ver Site Público' : 'Ir para o Painel'}
            </button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
              <LogOut size={18} />
              Sair
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setModoCorretor(true)} 
            style={{ backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Acesso Corretor
          </button>
        )}
      </header>

      {modoCorretor && !corretorLogado ? (
        /* Tela de Login */
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <Lock size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>Acesso do Corretor</h2>
            <p style={{ textLight: 'center', color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              Faça login para gerenciar imóveis e leads.
            </p>

            {loginErro && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                {loginErro}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>E-mail corporativo</label>
                <input 
                  type="email" 
                  required 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Ex: corretor@antropia.com"
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
                style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', transition: 'background-color 0.2s' }}
              >
                Entrar no Painel
              </button>
            </form>
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)' }}>
              Dica portfólio: Use <strong>corretor@antropia.com</strong> e senha <strong>admin123</strong>
            </div>
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
                  <textarea rows="4" value={imovelParaEditar ? editDescricao : novoDescricao} onChange={e => imovelParaEditar ? setEditDescricao(e.target.value) : setNovoDescricao(e.target.value)} placeholder="Detalhes sobre acabamento, diferenciais..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none', resize: 'none' }} />
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

                {/* Upload de Imagem ou Link */}
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
                          <button onClick={() => handleExcluirImovel(im.id)} style={{ backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Excluir</button>
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
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text)' }}>Funil de Vendas - CRM</h3>
              
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
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.5rem' }}>{lead.telefone}</span>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.75rem', fontStyle: 'italic' }}>"{lead.mensagem}"</p>
                            
                            <select 
                              value={lead.status_funil} 
                              onChange={e => handleMudarStatusLead(lead.id, e.target.value)}
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
            </div>
          )}
        </main>
      ) : (
        /* Catálogo Geral (Busca de Imóveis) */
        <>
          <section style={{ backgroundColor: 'var(--primary)', padding: '4rem 2rem', color: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>Encontre o imóvel dos seus sonhos</h2>
            <p style={{ marginBottom: '2rem', opacity: 0.9 }}>As melhores oportunidades da região com atendimento diferenciado.</p>
            
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 0.5rem', gap: '0.5rem' }}>
                <Search size={20} color="var(--text-light)" />
                <input 
                  type="text" 
                  placeholder="Busque por bairro, cidade ou palavra-chave..." 
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--text)' }}
                />
              </div>
              <select 
                value={tipo} 
                onChange={e => setTipo(e.target.value)}
                style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="">Todos os Tipos</option>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
              </select>
            </div>
          </section>

          <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'var(--text)' }}>Imóveis em Destaque</h3>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Carregando imóveis...</p>
            ) : filtrados.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Nenhum imóvel encontrado.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {filtrados.map(imovel => (
                  <div 
                    key={imovel.id} 
                    onClick={() => abrirDetalhes(imovel)}
                    style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <img src={imovel.imagem_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt={imovel.titulo} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        {imovel.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)', fontWeight: '600' }}>{imovel.titulo}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <MapPin size={16} />
                        <span>{imovel.bairro}, {imovel.cidade}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <BedDouble size={16} />
                          <span>{imovel.quartos} Quartos</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Bath size={16} />
                          <span>{imovel.banheiros} Banheiros</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Maximize size={16} />
                          <span>{imovel.area} m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
