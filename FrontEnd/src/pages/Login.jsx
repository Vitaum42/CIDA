import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario, logout, rotaInicialPorRole, TOKEN_KEY } from '../services/api';
import { 
  Heart, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  HeartHandshake 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");

  // Chegar na tela de login encerra qualquer sessão anterior (cobre o botão "Sair")
  useEffect(() => {
    logout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identificador.trim() || !password) {
      alert('Informe seu celular (ou e-mail) e sua senha.');
      return;
    }

    try {
      const { access_token, role } = await loginUsuario({
        identificador: identificador.trim(),
        senha: password,
      });
      localStorage.setItem(TOKEN_KEY, access_token);
      // Idoso -> Home | Cuidador/Familiar -> Painel do Cuidador
      navigate(rotaInicialPorRole(role));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center bg-slate-900 min-h-screen p-0 sm:p-4">
      {/* Container Mobile */}
      <div className="w-full max-w-[420px] bg-slate-100 h-screen sm:h-[844px] flex flex-col justify-between relative shadow-2xl overflow-hidden sm:rounded-[44px] border border-slate-300">
        
        {/* Topo Azul Marinho */}
        <div className="bg-[#15284B] pt-10 px-6 pb-8 rounded-b-[36px] shadow-md text-center shrink-0">
          <div className="flex justify-center items-center gap-2 mb-3">
            <Heart className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
            <span className="text-3xl font-black tracking-wider text-white">CIDA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Que bom ver você!
          </h1>
          <p className="text-slate-300 text-sm font-medium mt-1">
            Digite seus dados para acessar sua rotina
          </p>
        </div>

        {/* Formulário */}
        <div className="flex-1 px-6 py-6 flex flex-col justify-center">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Campo Usuário / CPF */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
                Seu Celular ou CPF
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="(11) 98765-4321 ou CPF"
                  className="w-full bg-white text-slate-900 font-bold pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 ml-1">
                Sua Senha
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha de 6 dígitos"
                  className="w-full bg-white text-slate-900 font-bold pl-12 pr-14 py-4 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-base shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                />
                
                {/* Alternância de Visibilidade */}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                  className="absolute right-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-transform cursor-pointer"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <EyeOff className="w-5 h-5 stroke-[2.2]" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Entrar no CIDA</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Links Auxiliares */}
            <div className="text-center pt-1">
              <button 
                type="button" 
                onClick={() => navigate('/recuperar-senha')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline p-1 cursor-pointer"
              >
                Esqueceu a senha? Peça ajuda aqui
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs font-medium text-slate-500">Ainda não tem conta? </span>
              <button 
                type="button" 
                onClick={() => navigate('/cadastro')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Cadastre-se grátis
              </button>
            </div>
          </form>
        </div>

        {/* Card Cuidador */}
        <div className="p-6 pt-0 shrink-0">
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <h2 className="text-xs font-bold text-slate-900 leading-tight">
                  É familiar ou cuidador?
                </h2>
                <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                  Acesse a área de gerenciamento
                </span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => navigate('/login-cuidador')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              Entrar aqui
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}