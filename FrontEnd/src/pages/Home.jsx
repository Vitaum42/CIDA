import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ambulance, Pill, Calendar, FileText, Phone, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getProximaDoseHoje, concluirDoseHoje } from '../utils/rotinaStorage';
import { acionarSOS } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [proximaDose, setProximaDose] = useState(null);

  // Carrega e sincroniza a próxima dose pendente
  const carregarProxima = () => {
    setProximaDose(getProximaDoseHoje());
  };

  useEffect(() => {
    carregarProxima();

    // Escuta alterações vindas de outras ações/telas
    const handleAtualizacao = () => carregarProxima();
    window.addEventListener('rotina_atualizada', handleAtualizacao);
    window.addEventListener('storage', handleAtualizacao);

    return () => {
      window.removeEventListener('rotina_atualizada', handleAtualizacao);
      window.removeEventListener('storage', handleAtualizacao);
    };
  }, []);

  // SOS: avisa o backend (que notifica o cuidador) e, SEMPRE, abre o discador do SAMU (192)
  const sosEmAndamento = useRef(false);

  const handleSOS = async () => {
    if (sosEmAndamento.current) return; // ignora toques repetidos enquanto avisa
    sosEmAndamento.current = true;

    try {
      await acionarSOS();
    } catch (error) {
      // Sem internet/sessão expirada: não bloqueia a ligação (nada de alert() aqui)
      console.error('Falha ao notificar o cuidador:', error);
    } finally {
      sosEmAndamento.current = false;
      window.location.href = 'tel:192';
    }
  };

  const handleMarcarTomado = (e, id) => {
    e.stopPropagation();
    concluirDoseHoje(id);
    carregarProxima();
  };

  return (
    <MobileContainer>
      {/* Scroll do Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Topo Azul Componentizado */}
        <Header 
          title="Olá, Seu João!" 
          subtitle="Cuidado para idosos"
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
          {/* Botão SOS Emergência */}
          <button 
            type="button" 
            onClick={handleSOS}
            className="w-full bg-[#E02938] hover:bg-red-700 active:scale-[0.98] transition-all text-white rounded-2xl py-4 px-5 flex items-center justify-center gap-3 shadow-lg shadow-black/25 cursor-pointer mt-4"
          >
            <Ambulance className="w-7 h-7 stroke-[2.5]" />
            <span className="text-xl font-black tracking-wider uppercase">
              SOS EMERGÊNCIA
            </span>
          </button>
        </Header>

        {/* Área Branca Central */}
        <div className="px-5 pt-5 pb-6">
          
          {/* CARD DINÂMICO: PRÓXIMA DOSE */}
          {proximaDose ? (
            <div 
              onClick={() => navigate('/rotina')}
              className="bg-white rounded-3xl p-4 border-2 border-emerald-500/30 shadow-md shadow-emerald-950/5 flex items-center justify-between mb-6 cursor-pointer hover:border-emerald-500/50 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 shrink-0">
                  <Pill className="w-6 h-6 rotate-45 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                      Próxima Dose
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {proximaDose.horario}
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 leading-snug mt-1 truncate">
                    {proximaDose.titulo}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {proximaDose.detalhe}
                  </p>
                </div>
              </div>

              {/* Botão de confirmação rápida */}
              <button
                type="button"
                onClick={(e) => handleMarcarTomado(e, proximaDose.id)}
                className="ml-3 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white rounded-2xl font-black text-xs shrink-0 shadow-md shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer transition-all"
                title="Marcar remédio como tomado"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Tomar</span>
              </button>
            </div>
          ) : (
            /* Estado quando todas as tarefas foram cumpridas */
            <div 
              onClick={() => navigate('/rotina')}
              className="bg-emerald-50/80 rounded-3xl p-4 border border-emerald-200/80 mb-6 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-950">Tudo tomado por hoje!</h3>
                  <p className="text-xs font-semibold text-emerald-700">Todas as doses do dia foram concluídas.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
          )}

          {/* Atalhos Rápidos */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 px-1">
              Atalhos rápidos
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => navigate('/remedios')}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-start gap-2.5 text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center text-emerald-700">
                  <Pill className="w-5 h-5 rotate-45 stroke-[2.4]" />
                </div>
                <span className="font-bold text-slate-900 text-sm leading-snug">
                  Meus Remédios
                </span>
              </button>

              <button 
                type="button" 
                onClick={() => navigate('/rotina')}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-start gap-2.5 text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700">
                  <Calendar className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span className="font-bold text-slate-900 text-sm leading-snug">
                  Minha Rotina
                </span>
              </button>

              <button 
                type="button" 
                onClick={() => alert("Módulo de Ocorrências em breve")}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-start gap-2.5 text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-700">
                  <FileText className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span className="font-bold text-slate-900 text-sm leading-snug">
                  Ocorrências
                </span>
              </button>

              <button 
                type="button" 
                onClick={() => navigate('/perfil')}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col items-start gap-2.5 text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100/70 flex items-center justify-center text-purple-700">
                  <Phone className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span className="font-bold text-slate-900 text-sm leading-snug">
                  Contatos
                </span>
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Footer Componentizado */}
      <BottomNav />
    </MobileContainer>
  );
}