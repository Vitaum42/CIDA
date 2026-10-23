import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { getSessao, rotaInicialPorRole } from './services/api';

// Importação das Telas de Autenticação
import Login from './pages/Login';
import LoginCuidador from './pages/LoginCuidador';
import Cadastro from './pages/Cadastro';
import CadastroCuidador from './pages/CadastroCuidador';
import RecuperarSenha from './pages/RecuperarSenha';

// Importação das Telas Principais
import Home from './pages/Home';
import Remedios from './pages/Remedios';
import Rotina from './pages/Rotina';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';
import PainelCuidador from './pages/PainelCuidador';

// Guarda de rota (não renderiza nada visual): só deixa entrar quem tem sessão
// válida E o perfil esperado. O backend continua sendo a barreira real dos dados.
function RotaProtegida({ roles, loginPath, children }) {
  const sessao = getSessao();
  if (!sessao) return <Navigate to={loginPath} replace />;
  if (!roles.includes(sessao.role)) return <Navigate to={rotaInicialPorRole(sessao.role)} replace />;
  return children;
}

const SO_IDOSO = ['elder'];
const SO_CUIDADOR = ['caregiver', 'family'];

export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/home" element={<RotaProtegida roles={SO_IDOSO} loginPath="/"><Home /></RotaProtegida>} />
          <Route path="/remedios" element={<RotaProtegida roles={SO_IDOSO} loginPath="/"><Remedios /></RotaProtegida>} />
          <Route path="/rotina" element={<RotaProtegida roles={SO_IDOSO} loginPath="/"><Rotina /></RotaProtegida>} />
          <Route path="/perfil" element={<RotaProtegida roles={SO_IDOSO} loginPath="/"><Perfil /></RotaProtegida>} />
          <Route path="/configuracoes" element={<RotaProtegida roles={SO_IDOSO} loginPath="/"><Configuracoes /></RotaProtegida>} />
          <Route path="/login-cuidador" element={<LoginCuidador />} />
          <Route path="/painel-cuidador" element={<RotaProtegida roles={SO_CUIDADOR} loginPath="/login-cuidador"><PainelCuidador /></RotaProtegida>} />
          <Route path="/cadastro-cuidador" element={<CadastroCuidador />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}