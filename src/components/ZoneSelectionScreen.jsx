// src/components/ZoneSelectionScreen.jsx
import React, { useState, useMemo } from 'react';
import { Play, MapPin, Users } from 'lucide-react';
import carchiBandera    from '../assets/images/carchi.png';
import imbaburabandera  from '../assets/images/imbabura.png';
import pichinchaBandera from '../assets/images/pichincha.png';

// Colores + imagen de bandera por provincia
const PROVINCE_COLORS = {
  'CARCHI':    { bg: 'rgba(22,163,74,0.15)',  border: 'rgba(22,163,74,0.7)',  accent: '#16a34a', light: 'rgba(22,163,74,0.25)',  flag: carchiBandera    },
  'IMBABURA':  { bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.7)',  accent: '#dc2626', light: 'rgba(220,38,38,0.25)',  flag: imbaburabandera  },
  'PICHINCHA': { bg: 'rgba(202,138,4,0.15)',  border: 'rgba(202,138,4,0.7)',  accent: '#ca8a04', light: 'rgba(202,138,4,0.25)',  flag: pichinchaBandera },
};

// Paleta fallback para provincias no mapeadas
const FALLBACK_COLORS = [
  { bg: 'rgba(1,155,220,0.15)',   border: 'rgba(1,155,220,0.6)',   accent: '#019BDC', light: 'rgba(1,155,220,0.25)',   stripe: '#019BDC' },
  { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.6)', accent: '#a78bfa', light: 'rgba(167,139,250,0.25)', stripe: '#a78bfa' },
  { bg: 'rgba(34,211,238,0.15)',  border: 'rgba(34,211,238,0.6)',  accent: '#22d3ee', light: 'rgba(34,211,238,0.25)',  stripe: '#22d3ee' },
  { bg: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.6)',  accent: '#fb923c', light: 'rgba(251,146,60,0.25)',  stripe: '#fb923c' },
  { bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.6)',  accent: '#34d399', light: 'rgba(52,211,153,0.25)',  stripe: '#34d399' },
];

const getZoneColor = (name, fallbackIdx) => {
  const match = PROVINCE_COLORS[name?.toUpperCase()];
  return match || FALLBACK_COLORS[fallbackIdx % FALLBACK_COLORS.length];
};

// Genera puntos distribuidos en el perímetro de un rectángulo dado
const makeDots = (w, h, gap = 22) => {
  const dots = [];
  // top
  for (let x = gap; x < w - gap / 2; x += gap) dots.push([x, 0]);
  // right
  for (let y = gap; y < h - gap / 2; y += gap) dots.push([w, y]);
  // bottom (reversed)
  for (let x = w - gap; x > gap / 2; x -= gap) dots.push([x, h]);
  // left (reversed)
  for (let y = h - gap; y > gap / 2; y -= gap) dots.push([0, y]);
  return dots;
};

const CasinoBorder = ({ color }) => {
  const W = 300, H = 300;
  const dots = makeDots(W, H, 20);
  return (
    <svg
      className="zone-casino-border"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={color} style={{ animationDelay: `${(i * 0.13) % 0.5}s` }} />
      ))}
    </svg>
  );
};

const ZoneSelectionScreen = ({ prize, participants, currentUnit, onConfirm, onBack }) => {
  const [filterType, setFilterType] = useState('provincia');
  const [selectedZone, setSelectedZone] = useState(null);
  const getPrizeImage = (prize) => {
    if (prize.imagen && prize.imagen.trim()) {
      if (prize.imagen.startsWith('data:image')) return prize.imagen;
      return `data:image/jpeg;base64,${prize.imagen}`;
    }
    return null;
  };

  const zones = useMemo(() => {
    const grouped = {};
    participants.forEach(p => {
      const key = filterType === 'provincia'
        ? (p.provincia || 'SIN PROVINCIA')
        : (p.supervisor || 'SIN SUPERVISOR');
      if (!grouped[key]) {
        grouped[key] = { name: key, participants: [], codigoSPV: p.codigoSPV, codigoProvincia: p.codigoProvincia };
      }
      grouped[key].participants.push(p);
    });
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [participants, filterType]);

  const selectedParticipants = useMemo(() => {
    if (!selectedZone) return [];
    return zones.find(z => z.name === selectedZone)?.participants || [];
  }, [selectedZone, zones]);

  const handleConfirm = () => {
    if (selectedZone && selectedParticipants.length > 0) onConfirm(selectedParticipants, selectedZone);
  };

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in-up">

      {/* Barra superior: premio + toggle */}
      <div className="flex-shrink-0 flex items-center gap-3">
        {/* Premio compacto */}
        <div className="flex items-center gap-3 bg-slate-800/70 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-0">
          <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-prodispro-blue/40">
            {getPrizeImage(prize) ? (
              <img src={getPrizeImage(prize)} alt={prize.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl bg-slate-700">🎁</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 leading-none mb-0.5">Premio · Unidad <span className="text-prodispro-blue font-bold">{currentUnit}</span> de {prize.cantidad}</p>
            <p className="font-bold text-white text-sm truncate">{prize.name}</p>
          </div>
          {currentUnit === 1 && (
            <button onClick={onBack} className="flex-shrink-0 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
              Cambiar
            </button>
          )}
        </div>

        {/* Toggle */}
        <div className="flex-shrink-0 flex bg-slate-800 rounded-xl p-1 border border-slate-600">
          {['provincia', 'supervisor'].map(type => (
            <button
              key={type}
              onClick={() => { setFilterType(type); setSelectedZone(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === type ? 'bg-prodispro-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {type === 'provincia' ? 'Por Provincia' : 'Por Supervisor'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de zonas — ocupa todo el espacio disponible */}
      <div className="flex-1 min-h-0 overflow-y-auto zone-scroll px-1">
        <div className="zone-grid" style={{minHeight:'100%', paddingBottom:'100px', alignContent:'center'}}>
          {zones.map((zone, idx) => {
            const color = getZoneColor(zone.name, idx);
            const isSelected = selectedZone === zone.name;
            const count = zone.participants.length;

            return (
              <div
                key={zone.name}
                onClick={() => setSelectedZone(isSelected ? null : zone.name)}
                className={`zone-card-wrapper${isSelected ? ' zone-card-wrapper--selected' : ''}`}
                style={{ '--neon-color': color.accent }}
              >
              {/* Puntos de casino parpadeantes sobre el borde */}
              <CasinoBorder color={color.accent} />

              <div
                className="zone-card"
                style={{
                  background: isSelected ? color.bg : 'rgba(30,41,59,0.7)',
                  boxShadow: isSelected ? `0 0 25px ${color.accent}66, 0 0 50px ${color.accent}22` : 'none',
                }}
              >
                {/* Bandera: ocupa la mitad superior de la card */}
                <div
                  className="zone-flag"
                  style={color.flag
                    ? { backgroundImage: `url(${color.flag})`, backgroundSize: 'cover', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }
                    : { background: color.stripe || color.accent }
                  }
                />

                {/* Línea separadora */}
                <div className="zone-divider" style={{ background: color.border }} />

                {/* Datos: mitad inferior */}
                <div className="zone-body">
                  {/* Icono + nombre */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="zone-icon-lg" style={{ background: color.light, color: color.accent }}>
                      <MapPin size={26} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-white text-2xl leading-tight truncate">{zone.name}</h3>
                      <p className="text-sm mt-0.5" style={{ color: color.accent }}>
                        {filterType === 'provincia' ? `Provincia ${zone.codigoProvincia || '—'}` : `Supervisor ${zone.codigoSPV || '—'}`}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: color.accent }}>
                        <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Participantes */}
                  <div className="flex items-center gap-2 text-xl font-bold text-white">
                    <Users size={20} style={{ color: color.accent }} />
                    <span>{count.toLocaleString()}</span>
                    <span className="text-base text-gray-400 font-normal">participantes</span>
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast fijo al seleccionar zona */}
      {selectedZone && (() => {
        const idx = zones.findIndex(z => z.name === selectedZone);
        const color = getZoneColor(selectedZone, idx);
        return (
          <div
            className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-5 px-6 py-4 rounded-2xl shadow-2xl z-50 border animate-scale-up"
            style={{ background: 'rgba(15,23,42,0.95)', borderColor: color.border, boxShadow: `0 0 40px ${color.light}`, backdropFilter: 'blur(12px)', minWidth: '420px' }}
          >
            <div className="zone-icon flex-shrink-0" style={{ background: color.light, color: color.accent }}>
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base truncate">{selectedZone}</p>
              <p className="text-sm" style={{ color: color.accent }}>{selectedParticipants.length.toLocaleString()} participantes</p>
            </div>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-105 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, #22c55e, #16a34a)`, boxShadow: '0 4px 15px rgba(34,197,94,0.4)' }}
            >
              <Play size={16} fill="white" />
              Iniciar Sorteo
            </button>
          </div>
        );
      })()}

      <style>{`
        .zone-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          padding: 2px;
          align-content: start;
        }
        /* Wrapper sin overflow:hidden para que los puntos de casino sean visibles */
        .zone-card-wrapper {
          position: relative;
          border-radius: 18px;
          cursor: pointer;
          padding: 3px;
          background: rgba(255,255,255,0.06);
          height: 300px;
          transition: background 0.3s;
        }
        .zone-card-wrapper:hover { filter: brightness(1.07); }

        /* Puntos de casino — SVG inline animado sobre el borde */
        .zone-casino-border {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .zone-card-wrapper--selected .zone-casino-border {
          opacity: 1;
        }
        .zone-casino-border circle {
          animation: casino-blink 0.45s ease-in-out infinite alternate;
        }
        @keyframes casino-blink {
          0%   { opacity: 0.1;  }
          100% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
        }

        /* Card interior: overflow hidden para bandera */
        .zone-card {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: box-shadow 0.3s, background 0.3s;
        }
        .zone-flag {
          height: 180px;
          flex-shrink: 0;
          width: 100%;
          display: block;
        }
        .zone-divider {
          height: 3px;
          width: 100%;
          flex-shrink: 0;
          opacity: 0.7;
        }
        .zone-body {
          flex: 1;
          padding: 14px 18px 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .zone-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .zone-icon-lg {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .zone-scroll {
          scrollbar-width: thin;
          scrollbar-color: #019BDC #1e293b;
        }
        .zone-scroll::-webkit-scrollbar { width: 4px; }
        .zone-scroll::-webkit-scrollbar-track { background: #1e293b; border-radius: 2px; }
        .zone-scroll::-webkit-scrollbar-thumb { background: #019BDC; border-radius: 2px; }
        @keyframes scale-up {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .animate-scale-up { animation: scale-up 0.22s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ZoneSelectionScreen;
