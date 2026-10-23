import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck 
} from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import { loginUsuario, logout, rotaInicialPorRole, TOKEN_KEY } from '../services/api';

export default function LoginCuidador() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  // Chegar na tela de login encerra qualquer sessão anterior (cobre o botão "Sair" do painel)
  useEffect(() => {
    logout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !senha) {
      alert('Informe seu e-mail e sua senha.');
      return;
    }

    try {
      const { access_token, role } = await loginUsuario({
        identificador: email.trim(),
        senha,
      });
      localStorage.setItem(TOKEN_KEY, access_token);
      // Cuidador/Familiar -> Painel do Cuidador | Idoso -> Home
      navigate(rotaInicialPorRole(role));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <MobileContainer>
      {/* Topo Azul com Destaque para Área do Cuidador */}
      <header className="shrink-0 rounded-b-[36px] bg-[#15284B] px-6 pb-6 pt-8 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar para login do idoso"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-1.5 bg-blue-900/60 border border-blue-400/30 px-3 py-1 rounded-full text-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Área de Cuidados</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-300">
            <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Portal do Cuidador
          </h1>
        </div>

        <p className="text-sm font-medium text-slate-300 mt-1">
          Acompanhe e gerencie a rotina dos seus idosos
        </p>
      </header>

      {/* Formulário */}
      <main className="flex-1 px-6 py-6 flex flex-col justify-center overflow-y-auto">
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* E-mail / Usuário */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              E-mail profissional ou pessoal
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-white text-slate-900 font-bold pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
              Sua Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input 
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha de acesso"
                className="w-full bg-white text-slate-900 font-bold pl-12 pr-14 py-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
              <button 
                type="button" 
                onClick={() => setShowSenha(!showSenha)}
                aria-label={showSenha ? 'Ocultar senha' : 'Ver senha'}
                className="absolute right-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-transform cursor-pointer"
              >
                {showSenha ? <Eye className="w-5 h-5 stroke-[2.2]" /> : <EyeOff className="w-5 h-5 stroke-[2.2]" />}
              </button>
            </div>
          </div>

          {/* Botão Acessar Painel */}
          <button 
            type="submit"
            className="w-full bg-[#15284B] hover:bg-[#1e3b6e] active:scale-[0.98] transition-all text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Links Auxiliares */}
          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => navigate('/cadastro-cuidador')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer"
            >
              Novo cuidador? Cadastre-se aqui
            </button>
          </div>
        </form>
      </main>

      {/* Rodapé para retornar ao login padrão */}
      <footer className="p-5 border-t border-slate-200/80 bg-slate-50/80 text-center shrink-0">
        <button 
          type="button" 
          onClick={() => navigate('/')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          ← Voltar ao Login
        </button>
      </footer>
    </MobileContainer>
  );
}