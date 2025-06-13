// src/components/WinnerModal.jsx - COMPLETO
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { FaCheck, FaTimes } from "react-icons/fa";

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
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isWinnerRound]);

  if (!isOpen || !winner) return null;

  const getPrizeImage = (prize) => {
    if (prize.imagen && prize.imagen.trim()) {
      if (prize.imagen.startsWith('data:image')) {
        return prize.imagen;
      }
      return `data:image/jpeg;base64,${prize.imagen}`;
    }
    return null;
  };

  const getPrizeIcon = (prizeName) => {
    if (prizeName.includes("CAFETERA")) return "☕";
    if (prizeName.includes("ASPIRADORA")) return "🧹";
    if (prizeName.includes("MOTO")) return "🏍️";
    if (prizeName.includes("REFRIGERADORA")) return "🧊";
    return "🎁";
  };

  return (
    <>
      {/* Confetti solo para ganadores */}
      {showConfetti && isWinnerRound && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={150}
          recycle={false}
          gravity={0.3}
          colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        onClick={(e) => e.target === e.currentTarget && onContinue?.()}
      >
        {/* Modal - Más compacto */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-600 max-w-xs sm:max-w-sm md:max-w-md w-full mx-2 animate-scale-up">
          
          {/* Header compacto */}
          <div className={`p-4 sm:p-6 text-center rounded-t-2xl sm:rounded-t-3xl ${
            isWinnerRound 
              ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
              : 'bg-gradient-to-r from-red-600 to-rose-600'
          }`}>
            <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 animate-bounce">
              {isWinnerRound ? '🎉' : '❌'}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
              {isWinnerRound ? '¡GANADOR!' : '¡ELIMINADO!'}
            </h2>
            <div className="text-sm sm:text-base text-white/90">
              {isWinnerRound ? 'Felicitaciones' : 'Has sido eliminado'}
            </div>
          </div>

          {/* Content compacto */}
          <div className="p-4 sm:p-6">
            {/* Winner Info compacta */}
            <div className="text-center mb-4 sm:mb-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-lg ${
                isWinnerRound 
                  ? 'bg-gradient-to-br from-emerald-600 to-green-700' 
                 : 'bg-gradient-to-br from-red-600 to-rose-700'
             }`}>
               {winner.name.charAt(0)}
             </div>
             <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 truncate px-2">
               {winner.name}
             </h3>
             <div className="text-xs sm:text-sm text-slate-400 space-y-1">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                 <p className="flex items-center justify-center space-x-1">
                   <span>📄</span>
                   <span className="truncate font-mono text-xs">{winner.invoiceNumber}</span>
                 </p>
                 <p className="flex items-center justify-center space-x-1">
                   <span>📍</span>
                   <span className="truncate">{winner.ciudad}</span>
                 </p>
                 <p className="flex items-center justify-center space-x-1 sm:col-span-2">
                   <span>👤</span>
                   <span className="truncate">{winner.vendedor || 'N/A'}</span>
                 </p>
               </div>
             </div>
           </div>

           {/* Prize Info compacta - Solo para ganadores */}
           {isWinnerRound && prize && (
             <div className="p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-400/30">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                   {getPrizeImage(prize) ? (
                     <img 
                       src={getPrizeImage(prize)}
                       alt={prize.name}
                       className="w-full h-full object-cover rounded-lg border-2 border-emerald-400"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-2 border-emerald-400">
                       {getPrizeIcon(prize.name)}
                     </div>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="text-sm sm:text-base md:text-lg font-bold text-emerald-400 mb-1 truncate">
                     {prize.name}
                   </h4>
                   <p className="text-xs sm:text-sm text-slate-300">
                     Unidad {unit} de {prize.cantidad}
                   </p>
                   <p className="text-xs text-slate-400 hidden sm:block">
                     ¡Has ganado este increíble premio!
                   </p>
                 </div>
               </div>
             </div>
           )}

           {/* Mensaje para eliminados */}
           {!isWinnerRound && (
             <div className="p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-400/30">
               <div className="text-center">
                 <div className="text-2xl sm:text-3xl mb-2">💪</div>
                 <h4 className="text-sm sm:text-base md:text-lg font-bold text-red-400 mb-1">
                   No te desanimes
                 </h4>
                 <p className="text-xs sm:text-sm text-slate-300 mb-1">
                   Has sido eliminado en esta ronda
                 </p>
                 <p className="text-xs text-slate-400">
                   ¡Gracias por participar!
                 </p>
               </div>
             </div>
           )}

           {/* Continue Button compacto */}
           <button
             onClick={onContinue}
             className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center space-x-2 sm:space-x-3 ${
               isWinnerRound
                 ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white'
                 : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white'
             }`}
           >
             <span className="text-lg sm:text-xl animate-bounce">
               {isWinnerRound ? '🎯' : '👍'}
             </span>
             <span>Continuar</span>
             <span className="text-lg sm:text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>
               {isWinnerRound ? '🎉' : '🔥'}
             </span>
           </button>

           <div className="text-center mt-3 sm:mt-4">
             <p className="text-xs sm:text-sm text-slate-400">
               {isWinnerRound 
                 ? 'Presiona para continuar' 
                 : 'Presiona para continuar'}
             </p>
           </div>
         </div>
       </div>
     </div>

     <style>{`
       @keyframes fade-in {
         from { opacity: 0; }
         to { opacity: 1; }
       }
       
       @keyframes scale-up {
         from { 
           opacity: 0; 
           transform: scale(0.8) translateY(-20px); 
         }
         to { 
           opacity: 1; 
           transform: scale(1) translateY(0); 
         }
       }
       
       .animate-fade-in {
         animation: fade-in 0.3s ease-out forwards;
       }
       
       .animate-scale-up {
         animation: scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
       }
     `}</style>
   </>
 );
};

const PrizeConfirmationModal = ({ isOpen, prize, onCancel, onConfirm }) => {
  if (!isOpen || !prize) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4" onClick={e => e.target === e.currentTarget && onCancel()}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-600 w-full max-w-xs sm:max-w-sm mx-auto p-4 animate-scale-up flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-prodispro-blue flex items-center justify-center mb-2 shadow-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1 text-center">¿Confirmar Sorteo?</h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-2 text-center">¿Sortear este premio?</p>
          <div className="flex flex-col items-center w-full mb-3">
            <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center mb-2 border-2 border-prodispro-blue">
              {prize.imagen ? (
                <img src={prize.imagen} alt={prize.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-2xl">🎁</span>
              )}
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm sm:text-base truncate">{prize.name}</div>
              <div className="text-xs text-slate-400 mt-1">{prize.cantidad} unidad{prize.cantidad > 1 ? "es" : ""}</div>
              <div className="text-xs text-slate-400">{prize.sorteos} sorteos total</div>
            </div>
          </div>
          {/* Botones redondos solo iconos */}
          <div className="flex justify-center gap-6 mt-2 w-full">
            <button
              onClick={onCancel}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-2xl shadow-lg transition-all"
              title="Cancelar"
            >
              <FaTimes />
            </button>
            <button
              onClick={onConfirm}
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white text-2xl shadow-lg transition-all"
              title="Comenzar"
            >
              <FaCheck />
            </button>
          </div>
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