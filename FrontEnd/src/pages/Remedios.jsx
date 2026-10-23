import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Mic, 
  ArrowDown, 
  ArrowUp, 
  MapPin, 
  Phone, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { buscarLocaisProximos } from '../services/api';

// Distância em km entre dois pontos (fórmula de Haversine)
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  const rad = (g) => (g * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Converte um local do Google Places para o formato que os cards já renderizam.
// O Google Places NÃO informa preço de remédio, por isso preco fica nulo.
function adaptarLocal(local, lat, lng) {
  const km = calcularDistanciaKm(lat, lng, local.latitude, local.longitude);
  return {
    id: local.id,
    nome: local.nome,
    endereco: local.endereco,
    mapaUrl: local.mapa_url,
    preco: null,
    distanciaKm: km,
    rotulo: `${km.toFixed(1).replace('.', ',')} km · sem preço`,
  };
}

export default function Remedios() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState(''); // Inicializa vazio
  const [farmacias, setFarmacias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [localizacao, setLocalizacao] = useState(null); // { lat, lng } do navegador

  // Ordenação: 'preco_asc' | 'preco_desc' | 'dist_asc' | 'dist_desc'
  const [modoOrdenacao, setModoOrdenacao] = useState('preco_asc');

  // Busca no backend (Google Places) as farmácias próximas da localização.
  // Com `termo`, busca por texto (ex.: "farmacia", "drogasil"); sem termo, as mais próximas.
  const carregarFarmaciasProximas = useCallback(async ({ lat, lng }, termo = '') => {
    setCarregando(true);
    setErro(null);

    try {
      const locais = await buscarLocaisProximos({ lat, lng, tipo: 'pharmacy', raio: 3000, limite: 15, q: termo || undefined });
      setFarmacias(locais.map((local) => adaptarLocal(local, lat, lng)));
    } catch (err) {
      setErro(err.message || 'Erro ao buscar farmácias próximas.');
      setFarmacias([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Pega a localização atual do usuário (geolocalização do navegador)
  useEffect(() => {
    if (!navigator.geolocation) {
      setErro('Seu navegador não suporta geolocalização.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Mantém o mesmo objeto se a posição não mudou (evita buscar duas vezes)
        setLocalizacao((atual) => (atual && atual.lat === lat && atual.lng === lng ? atual : { lat, lng }));
      },
      () => setErro('Permita o acesso à localização no navegador para ver as farmácias próximas.'),
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  // Carrega a lista: com termo digitado busca por texto; sem termo, as mais próximas.
  // (A busca não usa mais o endpoint /medicamentos/busca, que não existe no backend.)
  const carregarMedicamentos = useCallback(async (termo) => {
    if (!localizacao) {
      // Ainda sem localização (ou permissão negada: o aviso já está em `erro`)
      setFarmacias([]);
      return;
    }
    await carregarFarmaciasProximas(localizacao, termo.trim());
  }, [localizacao, carregarFarmaciasProximas]);

  // Dispara a busca quando o termo de pesquisa (ou a localização) mudar
  useEffect(() => {
    carregarMedicamentos(termoPesquisa);
  }, [carregarMedicamentos, termoPesquisa]);

  // Submissão do campo de busca (Enter no teclado ou clique)
  const handleBuscar = (e) => {
    e.preventDefault();
    if (busca.trim()) {
      setTermoPesquisa(busca);
    }
  };

  // Alternador da ordenação da seta
  const alternarOrdenacao = () => {
    setModoOrdenacao((atual) => {
      if (atual === 'preco_asc') return 'preco_desc';
      if (atual === 'preco_desc') return 'dist_asc';
      if (atual === 'dist_asc') return 'dist_desc';
      return 'preco_asc';
    });
  };

  const configuracaoBotao = {
    preco_asc: { rotulo: 'Preço', Icone: ArrowDown },
    preco_desc: { rotulo: 'Preço', Icone: ArrowUp },
    dist_asc: { rotulo: 'Distância', Icone: ArrowDown },
    dist_desc: { rotulo: 'Distância', Icone: ArrowUp },
  }[modoOrdenacao];

  // Ordenação dinâmica dos dados que vieram da API
  const farmaciasOrdenadas = useMemo(() => {
    return [...farmacias].sort((a, b) => {
      if (modoOrdenacao === 'preco_asc') return a.preco - b.preco;
      if (modoOrdenacao === 'preco_desc') return b.preco - a.preco;
      if (modoOrdenacao === 'dist_asc') return a.distanciaKm - b.distanciaKm;
      if (modoOrdenacao === 'dist_desc') return b.distanciaKm - a.distanciaKm;
      return 0;
    });
  }, [farmacias, modoOrdenacao]);

  const BotaoIcone = configuracaoBotao.Icone;

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto">
        
        {/* Topo Azul Componentizado */}
        <Header
          title="Buscar Remédios"
          rightAction={
            <button 
              type="button" 
              onClick={() => navigate('/perfil')}
              title="Ir para o Perfil"
              aria-label="Ir para o Perfil"
              className="rounded-full transition-transform active:scale-90 hover:opacity-90 cursor-pointer focus:outline-none"
            >
              <img 
                src="https://images.pexels.com/photos/8439740/pexels-photo-8439740.jpeg" 
                alt="Foto de perfil de Seu João" 
                className="w-11 h-11 rounded-full object-cover border-2 border-white/80 shadow"
              />
            </button>
          }
        >
          {/* Formulário de Busca */}
          <form onSubmit={handleBuscar} className="relative flex items-center mt-3">
            <span className="absolute left-4 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome do remédio..."
              className="w-full bg-white text-slate-900 font-semibold pl-12 pr-12 py-3.5 rounded-2xl shadow-inner focus:outline-none text-base border-none placeholder:text-slate-400 placeholder:font-normal"
            />
            <button 
              type="button" 
              onClick={() => alert("Pesquisa por voz em desenvolvimento")}
              className="absolute right-3 p-1.5 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Pesquisa por voz"
            >
              <Mic className="w-5 h-5" />
            </button>
          </form>
        </Header>

        {/* Conteúdo Principal */}
        <div className="px-5 pt-5 pb-6">
          
          {/* Cabeçalho de Contexto e Botão de Ordenação */}
          <div className="flex justify-between items-center mb-4 px-1">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {carregando 
                  ? 'Buscando drogarias...' 
                  : termoPesquisa 
                    ? `Resultados para "${termoPesquisa}"` 
                    : 'Medicamentos disponíveis'}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                São Paulo - SP
              </span>
            </div>
            
            <button 
              type="button" 
              disabled={farmaciasOrdenadas.length === 0}
              onClick={alternarOrdenacao}
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors ${
                farmaciasOrdenadas.length === 0 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-600 border border-slate-200 cursor-pointer hover:bg-slate-50'
              }`}
            >
              <span>{configuracaoBotao.rotulo}</span>
              <BotaoIcone className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Feedback de Carregamento (Loading) */}
          {carregando && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-700">Consultando drogarias na internet...</p>
            </div>
          )}

          {/* Feedback de Erro de Conexão */}
          {!carregando && erro && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2.5">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
              <p className="text-xs font-bold text-red-800">{erro}</p>
              <button
                type="button"
                onClick={() => carregarMedicamentos(termoPesquisa)}
                className="text-xs font-bold bg-white text-red-700 border border-red-200 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Lista de Resultados da API */}
          {!carregando && !erro && (
            <div className="space-y-4">
              {farmaciasOrdenadas.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
                  <p className="text-sm font-bold text-slate-800">
                    {termoPesquisa ? 'Nenhum medicamento encontrado' : 'Nenhum medicamento pesquisado'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Digite o nome de um remédio na busca acima para começar a pesquisa.
                  </p>
                </div>
              ) : (
                farmaciasOrdenadas.map((farmacia) => (
                  <div 
                    key={farmacia.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={farmacia.imagem || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=100&auto=format&fit=crop&q=80'} 
                          alt={`${farmacia.nome} Fachada`} 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {farmacia.nome}
                          </h3>
                          <span className="text-base font-extrabold text-emerald-600 block mt-0.5">
                            R$ {Number(farmacia.preco).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      
                      {farmacia.rotulo && (
                        <span className={`${farmacia.corRotulo || 'bg-blue-100 text-blue-700'} font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                          {farmacia.rotulo}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button 
                        type="button" 
                        onClick={() => alert(`Abrindo mapa para ${farmacia.nome}...`)}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-slate-700" />
                        <span>Ver Mapa</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => alert(`Discando para ${farmacia.nome}: ${farmacia.telefone}`)}
                        className="w-full bg-[#15284B] hover:bg-[#1f3a6d] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Ligar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}