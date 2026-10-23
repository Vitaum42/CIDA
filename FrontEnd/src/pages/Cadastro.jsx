import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarUsuario, loginUsuario, TOKEN_KEY } from '../services/api';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import MobileContainer from '../components/MobileContainer';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
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
      setMensagemErro('Informe seu telefone.');
      return;
    }

    if (!dataNascimento) {
      setMensagemErro('Informe sua data de nascimento.');
      return;
    }

    if (!senha || senha.length < 6) {
      setMensagemErro('A senha deve ter pelo menos 6 números ou letras.');
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas não coincidem.');
      return;
    }

    // Role fixa como 'elder' para cadastro de idoso
    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      role: 'elder',
      telefone: telefone.trim(),
      data_nascimento: dataNascimento || null,
      vinculo: null,
      especializacao: null,
      observacoes: null,
      rotinas: null,
    };

    try {
      setCarregando(true);
      console.log('Enviando dados do idoso para a API:', payload);
      await criarUsuario(payload);

      // Conta criada: já faz o login e leva o usuário direto ao app
      const { access_token } = await loginUsuario({
        identificador: payload.email,
        senha,
      });
      localStorage.setItem(TOKEN_KEY, access_token);
      navigate('/home');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setMensagemErro(
        error.message || 'Não foi possível criar a conta.',
      );
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
            Cadastro realizado!
          </h1>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Sua conta foi criada com sucesso.
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 w-full rounded-2xl bg-emerald-600 px-4 py-3.5 font-extrabold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-700/20"
          >
            Ir para o login
          </button>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Topo Azul com Botão Voltar */}
      <header className="shrink-0 rounded-b-[36px] bg-[#15284B] px-6 pb-6 pt-8 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-emerald-400 stroke-[2.5]" />
            <span className="text-2xl font-black tracking-wider text-white">
              CIDA
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Criar sua conta
        </h1>

        <p className="text-sm font-medium text-slate-300 mt-0.5">
          Preencha os campos abaixo para começar
        </p>
      </header>

      {/* Formulário do Idoso */}
      <main className="flex-1 overflow-y-auto px-6 py-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mensagemErro && (
            <div className="flex items-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{mensagemErro}</span>
            </div>
          )}

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
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-emerald-500 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              E-mail
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-emerald-500 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Telefone ou celular
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Phone className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={telefone}
                onChange={(event) => setTelefone(event.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-emerald-500 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Data de nascimento
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Calendar className="h-5 w-5" />
              </span>
              <input
                type="date"
                value={dataNascimento}
                onChange={(event) => setDataNascimento(event.target.value)}
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 font-bold text-slate-900 outline-none focus:border-emerald-500 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

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
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 pr-12 font-bold text-slate-900 outline-none focus:border-emerald-500 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
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
              Confirmar senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <CheckCircle className="h-5 w-5" />
              </span>
              <input
                type={showConfirmarSenha ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                placeholder="Digite a mesma senha"
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3.5 pl-12 pr-12 font-bold text-slate-900 outline-none focus:border-emerald-500 text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {carregando ? 'Cadastrando...' : 'Concluir cadastro'}
            </span>
            {!carregando && <ArrowRight className="h-5 w-5 stroke-[2.5]" />}
          </button>
        </form>
      </main>

      {/* Rodapé */}
      <footer className="shrink-0 border-t border-slate-200/80 bg-slate-50/80 p-4 text-center">
        <span className="text-xs font-medium text-slate-600">
          Já tem uma conta cadastrada?{' '}
        </span>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer p-1"
        >
          Entrar agora
        </button>
      </footer>
    </MobileContainer>
  );
}