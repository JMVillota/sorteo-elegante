// src/components/WinnerModal.jsx
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';

const WinnerModal = ({
  isOpen,
  winner,
  prize,
  unit,
  onContinue,
  isWinnerRound = true
}) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && isWinnerRound) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isWinnerRound]);

  if (!isOpen || !winner) return null;

  return (
    <>
      {showConfetti && isWinnerRound && (
        <Confetti width={width} height={height} numberOfPieces={120} recycle={false} gravity={0.3} />
      )}
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4" onClick={e => e.target === e.currentTarget && onContinue()}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-600 w-full max-w-xs sm:max-w-sm mx-auto p-4 animate-scale-up flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg ${isWinnerRound ? 'bg-green-500' : 'bg-red-500'}`}>
            <span className="text-2xl">{isWinnerRound ? '🎉' : '❌'}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1 text-center">{isWinnerRound ? '¡GANADOR!' : '¡ELIMINADO!'}</h2>
          <div className="grid grid-cols-1 gap-1 w-full text-xs sm:text-sm text-slate-200 mb-2">
            <div className="flex items-center gap-2"><span>📄</span><span className="truncate font-mono">{winner.invoiceNumber}</span></div>
            <div className="flex items-center gap-2"><span>📍</span><span className="truncate">{winner.ciudad}</span></div>
            <div className="flex items-center gap-2"><span>👤</span><span className="truncate">{winner.vendedor || 'N/A'}</span></div>
          </div>
          <div className="font-bold text-white text-sm sm:text-base mb-2 truncate">{winner.name}</div>
          {isWinnerRound && prize && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-400/30 rounded-xl px-3 py-2 mb-2 w-full">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                {prize.imagen ? (
                  <img src={prize.imagen} alt={prize.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-lg">🎁</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-green-400 truncate">{prize.name}</div>
                <div className="text-xs text-slate-400">Unidad {unit} de {prize.cantidad}</div>
              </div>
            </div>
          )}
          <button
            onClick={onContinue}
            className={`w-12 h-12 rounded-full ${isWinnerRound ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} flex items-center justify-center text-white text-2xl shadow-lg transition-all mt-2`}
            title="Continuar"
          >
            {isWinnerRound ? '🎯' : '👍'}
          </button>
        </div>
      </div>
      <style>{`
        .animate-scale-up {
          animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.8) translateY(20px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }
      `}</style>
    </>
  );
};

export default WinnerModal;