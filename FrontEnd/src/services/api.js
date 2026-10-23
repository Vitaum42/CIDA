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
export async function buscarLocaisProximos({ lat, lng, tipo = 'pharmacy', raio = 2000, limite = 10 }) {
  try {
    const { data } = await api.get('/places/nearby', {
      params: { lat, lng, tipo, raio, limite },
    });
    return data;
  } catch (error) {
    throw new Error(extrairMensagem(error, 'Erro ao buscar locais próximos.'));
  }
}
