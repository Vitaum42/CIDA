import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarUsuario, loginUsuario, rotaInicialPorRole, TOKEN_KEY } from '../services/api';
import {
  HeartHandshake,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import MobileContainer from '../components/MobileContainer';

export default function CadastroCuidador() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoCuidador, setTipoCuidador] = useState('caregiver'); // 'caregiver' ou 'family'
  const [vinculo, setVinculo] = useState('');
  const [especializacao, setEspecializacao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagemErro('');

    if (!nome.trim()) {
      setMensagemErro('Informe seu nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setMensagemErro('Informe um e-mail válido.');
      return;
    }

    if (!telefone.trim()) {
      setMensagemErro('Informe seu celular ou telefone de contato.');
      return;
    }

    if (!senha || senha.length < 6) {
      setMensagemErro('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas não coincidem.');
      return;
    }

    // Envia com a role de cuidador/familiar selecionada
    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      role: tipoCuidador, // 'caregiver' (cuidador) ou 'family' (familiar), conforme a aba escolhida
      telefone: telefone.trim(),
      data_nascimento: null,
      vinculo: vinculo.trim() || (tipoCuidador === 'caregiver' ? 'Cuidador Profissional' : 'Familiar'),
      especializacao: especializacao.trim() || null,
      observacoes: null,
      rotinas: null,
    };

    try {
      setCarregando(true);
      console.log('Enviando cadastro de cuidador:', payload);
      await criarUsuario(payload);

      // Conta criada: já faz o login e leva direto ao painel
      const { access_token, role } = await loginUsuario({
        identificador: payload.email,
        senha,
      });
      localStorage.setItem(TOKEN_KEY, access_token);
      navigate(rotaInicialPorRole(role));
    } catch (error) {
      console.error('Erro ao cadastrar cuidador:', error);
      setMensagemErro(error.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <MobileContainer>
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-9 w-9 stroke-[3]" />
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Cadastro de Cuidador Concluído!
          </h1>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Sua conta de gerenciamento foi criada com sucesso.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login-cuidador')}
            className="mt-6 w-full rounded-2xl bg-[#15284B] px-4 py-3.5 font-extrabold text-white hover:bg-[#1f3a6d] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
          >
            Acessar Área do Cuidador
          </button>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Topo Azul do Cuidador */}
      <header className="shrink-0 rounded-b-[36px] bg-[#15284B] px-6 pb-6 pt-8 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/login-cuidador')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar para login do cuidador"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-1.5 bg-blue-900/60 border border-blue-400/30 px-3 py-1 rounded-full text-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Área de Cuidados</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300">
            <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Cadastro de Cuidador
          </h1>
        </div>

        <p className="text-sm font-medium text-slate-300 mt-1">
          Crie seu acesso para monitorar e apoiar a rotina
        </p>
      </header>

      {/* Formulário */}
      <main className="flex-1 overflow-y-auto px-6 py-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mensagemErro && (
            <div className="flex items-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{mensagemErro}</span>
            </div>
          )}

          {/* Tipo de Responsável */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Perfil de atuação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoCuidador('caregiver')}
                className={`py-3 px-3 rounded-2xl font-bold text-xs border-2 transition-all cursor-pointer ${
                  tipoCuidador === 'caregiver'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Cuidador Profissional
              </button>
              <button
                type="button"
                onClick={() => setTipoCuidador('family')}
                className={`py-3 px-3 rounded-2xl font-bold text-xs border-2 transition-all cursor-pointer ${
                  tipoCuidador === 'family'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Familiar / Parente
              </button>
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Nome completo
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              E-mail para login
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Celular com WhatsApp
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Phone className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Vínculo ou Especialização */}
          {tipoCuidador === 'family' ? (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
                Grau de parentesco
              </label>
              <input
                type="text"
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value)}
                placeholder="Ex: Filho(a), Neto(a), Sobrinho(a)"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
                Especialização ou registro (opcional)
              </label>
              <input
                type="text"
                value={especializacao}
                onChange={(e) => setEspecializacao(e.target.value)}
                placeholder="Ex: Enfermagem, Técnico de Saúde, Cuidador de Idosos"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          )}

          {/* Senha */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 pr-12 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-2 flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-transform cursor-pointer"
                aria-label={showSenha ? 'Ocultar senha' : 'Ver senha'}
              >
                {showSenha ? <Eye className="h-5 w-5 stroke-[2.2]" /> : <EyeOff className="h-5 w-5 stroke-[2.2]" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Repita a senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <CheckCircle className="h-5 w-5" />
              </span>
              <input
                type={showConfirmarSenha ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a mesma senha"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 pr-12 font-bold text-slate-900 outline-none focus:border-blue-600 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
              <button
                type="button"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                className="absolute right-2 flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-transform cursor-pointer"
                aria-label={showConfirmarSenha ? 'Ocultar confirmação' : 'Ver confirmação'}
              >
                {showConfirmarSenha ? <Eye className="h-5 w-5 stroke-[2.2]" /> : <EyeOff className="h-5 w-5 stroke-[2.2]" />}
              </button>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={carregando}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#15284B] px-6 py-4 text-base font-extrabold text-white shadow-lg hover:bg-[#1e3b6e] active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {carregando ? 'Criando conta...' : 'Concluir cadastro de cuidador'}
            </span>
            {!carregando && <ArrowRight className="h-5 w-5 stroke-[2.5]" />}
          </button>
        </form>
      </main>

      {/* Rodapé */}
      <footer className="shrink-0 border-t border-slate-200/80 bg-slate-50/80 p-4 text-center">
        <span className="text-xs font-medium text-slate-600">
          Já tem conta de cuidador?{' '}
        </span>
        <button
          type="button"
          onClick={() => navigate('/login-cuidador')}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer p-1"
        >
          Entrar aqui
        </button>
      </footer>
    </MobileContainer>
  );
}