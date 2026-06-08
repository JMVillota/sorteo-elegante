// src/components/WinnerModal.jsx
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import carchiBandera    from '../assets/images/carchi.png';
import imbaburabandera  from '../assets/images/imbabura.png';
import pichinchaBandera from '../assets/images/pichincha.png';

const PROVINCE_FLAGS = {
  'CARCHI':    carchiBandera,
  'IMBABURA':  imbaburabandera,
  'PICHINCHA': pichinchaBandera,
};

const WinnerModal = ({ isOpen, winner, prize, unit, totalUnits, onContinue, isWinnerRound = true }) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && isWinnerRound) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isOpen, isWinnerRound]);

  if (!isOpen || !winner) return null;

  const getPrizeImage = (p) => {
    if (!p?.imagen?.trim()) return null;
    return p.imagen.startsWith('data:image') ? p.imagen : `data:image/jpeg;base64,${p.imagen}`;
  };

  const isWinner = isWinnerRound;
  const accent   = isWinner ? '#10b981' : '#ef4444';
  const accentBg = isWinner ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
  const headerGrad = isWinner
    ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
    : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)';

  return (
    <>
      {showConfetti && isWinner && (
        <Confetti width={width} height={height} numberOfPieces={280} recycle={false} gravity={0.25}
          colors={['#10b981','#34d399','#eab308','#fbbf24','#f59e0b','#fff']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
        onClick={e => e.target === e.currentTarget && onContinue?.()}
      >
        <div className="modal-card w-full max-w-2xl mx-auto" style={{ borderColor: accent }}>

          {/* ── HEADER ── */}
          <div className="modal-header rounded-t-2xl px-6 py-5 flex items-center gap-4" style={{ background: headerGrad }}>
            {/* Ícono */}
            <div className="text-5xl flex-shrink-0" style={{ lineHeight: 1 }}>
              {isWinner ? '🏆' : '❌'}
            </div>
            {/* Título + nombre */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: isWinner ? '#6ee7b7' : '#fca5a5' }}>
                {isWinner ? '¡Ganador de esta unidad!' : '¡Eliminado en esta ronda!'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase break-words">
                {winner.name}
              </h2>
            </div>
            {/* Avatar inicial */}
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0 border-2"
              style={{ background: accentBg, borderColor: accent }}>
              {winner.name.charAt(0)}
            </div>
          </div>

          {/* ── CUERPO ── */}
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Fila de datos clave */}
            <div className="grid grid-cols-3 gap-3">
              {/* Factura */}
              <div className="data-pill" style={{ borderColor: accent, background: accentBg }}>
                <span className="data-pill-label">Factura</span>
                <span className="data-pill-value font-mono" style={{ color: accent }}>
                  {winner.invoiceNumber}
                </span>
              </div>
              {/* Ciudad / Zona */}
              <div className="data-pill" style={{ borderColor: 'rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.07)' }}>
                <span className="data-pill-label">Ciudad</span>
                <span className="data-pill-value text-white">{winner.ciudad || '—'}</span>
              </div>
              {/* Provincia con bandera de fondo */}
              {(() => {
                const flagSrc = PROVINCE_FLAGS[(winner.provincia || '').toUpperCase()];
                return (
                  <div className="data-pill relative overflow-hidden"
                    style={{ borderColor: 'rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.07)', minHeight: '72px' }}>
                    {/* Bandera de fondo */}
                    {flagSrc && (
                      <img src={flagSrc} alt="" aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                        style={{ opacity: 0.22 }} />
                    )}
                    <span className="data-pill-label relative z-10">Provincia</span>
                    <span className="data-pill-value text-white relative z-10">{winner.provincia || '—'}</span>
                  </div>
                );
              })()}
            </div>

            {/* Vendedor */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ borderColor: 'rgba(148,163,184,0.2)', background: 'rgba(30,41,59,0.6)' }}>
              <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                {winner.vendedor ? winner.vendedor.charAt(0) : '?'}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 leading-none mb-0.5">Vendedor</p>
                <p className="text-base font-bold text-white uppercase truncate">{winner.vendedor || 'N/A'}</p>
              </div>
              {winner.fechaFormateada && (
                <div className="ml-auto text-right flex-shrink-0">
                  <p className="text-xs text-gray-400 leading-none mb-0.5">Fecha factura</p>
                  <p className="text-sm font-semibold text-gray-200">{winner.fechaFormateada}</p>
                </div>
              )}
            </div>

            {/* Premio (solo ganador) o mensaje eliminado */}
            {isWinner && prize ? (
              <div className="flex items-center gap-4 px-4 py-3 rounded-xl border"
                style={{ borderColor: `${accent}55`, background: accentBg }}>
                <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2" style={{ borderColor: accent }}>
                  {getPrizeImage(prize)
                    ? <img src={getPrizeImage(prize)} alt={prize.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-800">🎁</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>Premio</p>
                  <p className="text-lg font-extrabold text-white uppercase truncate">{prize.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Unidad <span className="font-bold text-white">{unit}</span> de {prize.cantidad}
                    {unit < totalUnits && (
                      <span className="ml-2 text-yellow-400 font-semibold">
                        · Quedan {totalUnits - unit} más
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : !isWinner && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10">
                <span className="text-2xl">💪</span>
                <p className="text-sm text-gray-300">
                  Eliminado en esta ronda — el sorteo continúa hasta encontrar al ganador.
                </p>
              </div>
            )}

            {/* Botón continuar */}
            <button onClick={onContinue}
              className="w-full py-3.5 rounded-xl font-extrabold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ background: `linear-gradient(135deg, ${accent}, ${isWinner ? '#059669' : '#dc2626'})`,
                       boxShadow: `0 4px 20px ${accent}55` }}>
              <span className="text-xl">{isWinner ? '🎯' : '👍'}</span>
              {isWinner
                ? (unit < totalUnits ? `Sortear unidad ${unit + 1} de ${totalUnits}` : 'Finalizar este premio')
                : 'Continuar siguiente ronda'}
            </button>

          </div>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
          animation: modal-fade-in 0.2s ease-out forwards;
        }
        .modal-card {
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          border-radius: 20px;
          border-width: 2px;
          border-style: solid;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
          animation: modal-scale-up 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .data-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 8px;
          border-radius: 12px;
          border-width: 1px;
          border-style: solid;
          text-align: center;
        }
        .data-pill-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          line-height: 1;
        }
        .data-pill-value {
          font-size: 15px;
          font-weight: 800;
          line-height: 1.2;
          word-break: break-all;
        }
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-scale-up {
          from { opacity: 0; transform: scale(0.88) translateY(-16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </>
  );
};

export default WinnerModal;
