import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const TOKEN_KEY = 'access_token';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o JWT em toda requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Converte o erro do axios em Error com mensagem legível (o FastAPI manda "detail")
function extrairMensagem(error, padrao) {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg).join(' ');
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (!error.response) {
    return 'Não foi possível conectar ao servidor.';
  }
  return padrao;
}

export async function criarUsuario(usuario) {
  try {
    const { data } = await api.post('/users', usuario);
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao criar usuário'));
  }
}

// identificador = e-mail ou telefone
export async function loginUsuario({ identificador, senha }) {
  try {
    const { data } = await api.post('/auth/login', { identificador, senha });
    return data; // { access_token, token_type, user }
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Não foi possível entrar.'));
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

// tipo: 'pharmacy' | 'hospital' | 'drugstore' | 'doctor'
// q (opcional): busca por texto, ex.: 'farmacia', 'drogasil', 'farmácia 24 horas'
export async function buscarLocaisProximos({ lat, lng, tipo = 'pharmacy', raio = 2000, limite = 10, q }) {
  try {
    const { data } = await api.get('/places/nearby', {
      params: { lat, lng, tipo, raio, limite, q: q || undefined },
    });
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao buscar locais próximos.'));
  }
}

// ---------------------------------------------------------------------------
// Sessão e perfil (role)
// ---------------------------------------------------------------------------

function decodificarToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Lê a sessão do token salvo. Serve só para ROTEAMENTO/UX: quem protege os
// dados de verdade é o backend (ele valida a assinatura e lê o perfil do banco).
export function getSessao() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = decodificarToken(token);
  if (!payload || !payload.exp || payload.exp * 1000 <= Date.now()) return null;
  return { token, userId: payload.user_id, role: payload.role };
}

// 'elder' => Home do idoso | 'caregiver' / 'family' => Painel do Cuidador
export function rotaInicialPorRole(role) {
  if (role === 'elder') return '/home';
  if (role === 'caregiver' || role === 'family') return '/painel-cuidador';
  return '/';
}

// ---------------------------------------------------------------------------
// Dados segregados por usuário (o backend filtra pelo user_id do token)
// ---------------------------------------------------------------------------

export async function obterMeuPerfilIdoso() {
  try {
    const { data } = await api.get('/elders/me');
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao carregar seu perfil.'));
  }
}

export async function listarMeusIdosos() {
  try {
    const { data } = await api.get('/caregivers/me/elders');
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao carregar os idosos vinculados.'));
  }
}

// Idoso gera um código de uso único (válido por 24h)...
export async function gerarConviteIdoso() {
  try {
    const { data } = await api.post('/elders/me/invite');
    return data; // { codigo, expira_em }
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao gerar o código de convite.'));
  }
}

// ...e o cuidador/familiar informa esse código para se vincular a ele.
export async function vincularIdoso(codigo) {
  try {
    const { data } = await api.post('/caregivers/me/elders', { codigo });
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Não foi possível vincular o idoso.'));
  }
}

// ---------------------------------------------------------------------------
// Emergência (SOS)
// ---------------------------------------------------------------------------

// Avisa o backend, que registra o alerta e notifica os cuidadores/familiares vinculados.
// O timeout curto garante que, sem internet, a ligação para o SAMU não fique esperando.
export async function acionarSOS() {
  try {
    const { data } = await api.post('/api/emergency/sos', null, { timeout: 3000 });
    return data; // { alert_id, criado_em, notificados, ja_existia }
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Não foi possível avisar o cuidador.'));
  }
}

// Cuidador/Familiar: alertas recebidos (só dos idosos vinculados a ele)
export async function listarAlertasEmergencia() {
  try {
    const { data } = await api.get('/api/emergency/alerts');
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao carregar os alertas.'));
  }
}

export async function marcarAlertaComoLido(alertId) {
  try {
    await api.post(`/api/emergency/alerts/${alertId}/read`);
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao marcar o alerta como lido.'));
  }
}
