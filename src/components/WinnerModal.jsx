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
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
          colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => e.target === e.currentTarget && onContinue?.()}
      >
        {/* Modal */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-600 max-w-lg w-full mx-4 animate-scale-up">
          
          {/* Header - ACTUALIZADO para eliminados */}
          <div className={`p-8 text-center rounded-t-3xl ${
            isWinnerRound 
              ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
              : 'bg-gradient-to-r from-red-600 to-rose-600'
          }`}>
            <div className="text-6xl mb-4 animate-bounce">
              {isWinnerRound ? '🎉' : '❌'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isWinnerRound ? '¡GANADOR!' : '¡ELIMINADO!'}
            </h2>
            <div className="text-xl text-white/90">
              {isWinnerRound ? 'Felicitaciones' : 'Has sido eliminado'}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Winner Info */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ${
                isWinnerRound 
                  ? 'bg-gradient-to-br from-emerald-600 to-green-700' 
                 : 'bg-gradient-to-br from-red-600 to-rose-700'
             }`}>
               {winner.name.charAt(0)}
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">
               {winner.name}
             </h3>
             <div className="text-slate-400 space-y-1">
               <p className="flex items-center justify-center space-x-2">
                 <span>📄</span>
                 <span>{winner.invoiceNumber}</span>
               </p>
               <p className="flex items-center justify-center space-x-2">
                 <span>📍</span>
                 <span>{winner.ciudad}</span>
               </p>
               <p className="flex items-center justify-center space-x-2">
                 <span>👤</span>
                 <span>{winner.vendedor || 'N/A'}</span>
               </p>
             </div>
           </div>

           {/* Prize Info - Solo para ganadores */}
           {isWinnerRound && prize && (
             <div className="p-6 rounded-2xl mb-8 border-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-400/30">
               <div className="flex items-center space-x-4">
                 <div className="w-16 h-16 flex-shrink-0">
                   {getPrizeImage(prize) ? (
                     <img 
                       src={getPrizeImage(prize)}
                       alt={prize.name}
                       className="w-full h-full object-cover rounded-xl border-2 border-emerald-400"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-emerald-400">
                       {getPrizeIcon(prize.name)}
                     </div>
                   )}
                 </div>
                 <div className="flex-1">
                   <h4 className="text-xl font-bold text-emerald-400 mb-1">
                     {prize.name}
                   </h4>
                   <p className="text-slate-300">
                     Unidad {unit} de {prize.cantidad}
                   </p>
                   <p className="text-sm text-slate-400 mt-1">
                     ¡Has ganado este increíble premio!
                   </p>
                 </div>
               </div>
             </div>
           )}

           {/* Mensaje para eliminados */}
           {!isWinnerRound && (
             <div className="p-6 rounded-2xl mb-8 border-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-400/30">
               <div className="text-center">
                 <div className="text-4xl mb-3">💪</div>
                 <h4 className="text-xl font-bold text-red-400 mb-2">
                   No te desanimes
                 </h4>
                 <p className="text-slate-300 mb-2">
                   Has sido eliminado en esta ronda
                 </p>
                 <p className="text-sm text-slate-400">
                   ¡Gracias por participar en nuestro sorteo!
                 </p>
               </div>
             </div>
           )}

           {/* Continue Button */}
           <button
             onClick={onContinue}
             className={`w-full py-4 px-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center space-x-3 ${
               isWinnerRound
                 ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white'
                 : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white'
             }`}
           >
             <span className="text-2xl animate-bounce">
               {isWinnerRound ? '🎯' : '👍'}
             </span>
             <span>Continuar</span>
             <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>
               {isWinnerRound ? '🎉' : '🔥'}
             </span>
           </button>

           <div className="text-center mt-4">
             <p className="text-sm text-slate-400">
               {isWinnerRound 
                 ? 'Presiona para continuar al siguiente sorteo' 
                 : 'Presiona para continuar con el sorteo'}
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

export default WinnerModal;