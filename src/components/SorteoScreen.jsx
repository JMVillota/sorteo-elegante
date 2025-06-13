// src/components/SorteoScreen.jsx - COMPLETO CON RESPONSIVIDAD MEJORADA
import React, { useState, useEffect } from 'react';
import RouletteWheel from './RouletteWheel';
import WinnerModal from './WinnerModal';

const SorteoScreen = ({ prize, participants, onComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinners, setRoundWinners] = useState([]);
  const [roundLosers, setRoundLosers] = useState([]);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const totalRounds = prize.cantidad * 3;
  const isWinnerRound = currentRound % 3 === 0;

  useEffect(() => {
    if (roundWinners.length >= prize.cantidad && currentRound > totalRounds) {
      console.log(`✅ Sorteo completado para ${prize.name}`);
      onComplete(roundWinners);
      return;
    }
  }, [currentRound, totalRounds, roundWinners, prize.cantidad, prize.name, onComplete]);

  const handleRoundComplete = (selectedParticipant) => {
    console.log(`🎲 Ronda ${currentRound} completada:`, {
      participant: selectedParticipant.name,
      isWinnerRound,
      expectedUnit: Math.ceil(currentRound / 3)
    });

    setCurrentWinner(selectedParticipant);
    setShowResult(true);
    
    if (isWinnerRound) {
      const newWinner = {
        participant: selectedParticipant,
        prize: prize,
        round: currentRound,
        unit: Math.ceil(currentRound / 3)
      };
      
      setRoundWinners([...roundWinners, newWinner]);
    } else {
      const newLoser = {
        participant: selectedParticipant,
        round: currentRound
      };
      
      setRoundLosers([...roundLosers, newLoser]);
    }
    
    setTimeout(() => {
      setShowWinnerModal(true);
    }, 1000);
  };

  const continueToNextRound = () => {
    setShowResult(false);
    setCurrentWinner(null);
    setShowWinnerModal(false);
    setCurrentRound(currentRound + 1);
    setIsRoundActive(false);
  };

  const handleModalContinue = () => {
    console.log('👆 Usuario continuó desde modal');
    continueToNextRound();
  };

  const startRound = () => {
    console.log(`🎯 Iniciando ronda ${currentRound} (${isWinnerRound ? 'GANADOR' : 'ELIMINADO'})`);
    setIsRoundActive(true);
  };

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

  const getCurrentUnit = () => Math.ceil(currentRound / 3);
  const getRoundInUnit = () => ((currentRound - 1) % 3) + 1;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      
      {/* Winner Modal */}
      <WinnerModal
        isOpen={showWinnerModal}
        winner={currentWinner}
        prize={prize}
        unit={getCurrentUnit()}
        onContinue={handleModalContinue}
        isWinnerRound={isWinnerRound}
      />

      {/* Header del Sorteo - Responsivo mejorado */}
      <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 p-3 sm:p-4 md:p-6 border-b-2 border-prodispro-blue/30 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 relative">
                {getPrizeImage(prize) ? (
                  <img 
                    src={getPrizeImage(prize)} 
                    alt={prize.name}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl border-2 sm:border-3 border-prodispro-blue shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-5xl bg-gradient-to-br from-slate-700 to-gray-700 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-prodispro-blue shadow-lg">
                    {getPrizeIcon(prize.name)}
                  </div>
                )}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-prodispro-blue to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                  {getCurrentUnit()}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-prodispro-blue to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2 truncate">
                  {prize.name}
                </h1>
                <p className="text-xs sm:text-base md:text-lg lg:text-xl text-gray-300 mb-1">
                  Unidad {getCurrentUnit()} de {prize.cantidad} • 
                  Ronda {getRoundInUnit()} de 3
                </p>
                <div className={`inline-block px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${
                  isWinnerRound 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                }`}>
                  {isWinnerRound ? '🏆 GANADOR' : '❌ ELIMINADO'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-prodispro-blue to-cyan-400 bg-clip-text text-transparent">
                {currentRound}/{totalRounds}
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-400">Rondas</div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-3 sm:mt-4 md:mt-6">
            <div className="w-full bg-slate-700 rounded-full h-2 sm:h-3 md:h-4 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-prodispro-blue via-cyan-400 to-blue-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Layout responsivo */}
      <div className="w-full p-3 sm:p-4 md:p-6">
        
        {/* Layout Desktop (2xl+) - 3 columnas */}
        <div className="hidden 2xl:grid 2xl:grid-cols-3 2xl:gap-8 2xl:h-[calc(100vh-200px)] w-full">
          
          {/* Máquina tragamonedas - Columna central */}
          <div className="col-span-1 bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-8 flex flex-col justify-center border border-slate-600 shadow-2xl w-full h-full">
            <RouletteWheel
              participants={participants}
              onWinnerSelected={handleRoundComplete}
              isActive={isRoundActive}
              onStart={startRound}
              showResult={showResult}
              currentWinner={currentWinner}
              isWinnerRound={isWinnerRound}
            />
          </div>

          {/* Eliminados */}
          <div className="col-span-1 bg-gradient-to-br from-red-900/30 to-rose-900/30 rounded-3xl p-6 flex flex-col min-h-0 border border-red-500/30 shadow-xl w-full h-full">
            <div className="flex items-center justify-center mb-6 flex-shrink-0">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-3 rounded-2xl">
                <h3 className="text-xl font-bold text-white text-center">
                  ❌ ELIMINADOS ({roundLosers.length})
                </h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              <div className="space-y-4">
                {roundLosers.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-6xl mb-4 animate-pulse">⏳</div>
                    <p className="text-xl">Sin eliminados aún</p>
                  </div>
                ) : (
                  roundLosers.map((loser, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-400/30 rounded-xl hover:from-red-500/20 hover:to-rose-500/20 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                          {loser.participant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg truncate text-white">{loser.participant.name}</h4>
                          <p className="text-red-300 text-sm">
                            {loser.participant.invoiceNumber} • R{loser.round}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {loser.participant.ciudad}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ganadores */}
          <div className="col-span-1 bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-3xl p-6 flex flex-col min-h-0 border border-emerald-500/30 shadow-xl w-full h-full">
            <div className="flex items-center justify-center mb-6 flex-shrink-0">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 rounded-2xl">
                <h3 className="text-xl font-bold text-white text-center">
                  🏆 GANADORES ({roundWinners.length}/{prize.cantidad})
                </h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              <div className="space-y-4">
                {roundWinners.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-6xl mb-4 animate-pulse">🎯</div>
                    <p className="text-xl">Sin ganadores aún</p>
                  </div>
                ) : (
                  roundWinners.map((winner, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-xl relative overflow-hidden hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-300">
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                          {winner.participant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg truncate text-white">{winner.participant.name}</h4>
                          <p className="text-emerald-300 text-sm">
                            {winner.participant.invoiceNumber} • U{winner.unit}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {winner.participant.ciudad}
                          </p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-shimmer" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Responsivo (móvil/tablet/desktop) */}
        <div className="2xl:hidden space-y-4 sm:space-y-6">
          
          {/* Máquina tragamonedas */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-600 shadow-xl">
            <RouletteWheel
              participants={participants}
              onWinnerSelected={handleRoundComplete}
              isActive={isRoundActive}
              onStart={startRound}
              showResult={showResult}
              currentWinner={currentWinner}
              isWinnerRound={isWinnerRound}
            />
          </div>

          {/* Grid de Ganadores y Eliminados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Ganadores */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-500/30 shadow-xl">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white text-center">
                    🏆 GANADORES ({roundWinners.length}/{prize.cantidad})
                  </h3>
                </div>
              </div>
              
              <div className="max-h-48 sm:max-h-64 md:max-h-80 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {roundWinners.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                      <p className="text-sm">Sin ganadores aún</p>
                    </div>
                  ) : (
                    roundWinners.map((winner, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-lg sm:rounded-xl relative overflow-hidden">
                        <div className="flex items-center space-x-3 relative z-10">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {winner.participant.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium sm:font-semibold truncate text-white text-sm sm:text-base">{winner.participant.name}</h4>
                            <p className="text-emerald-300 text-xs sm:text-sm">
                              {winner.participant.invoiceNumber} • U{winner.unit}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {winner.participant.ciudad}
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 animate-shimmer" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>{/* Eliminados */}
            <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-red-500/30 shadow-xl">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white text-center">
                    ❌ ELIMINADOS ({roundLosers.length})
                  </h3>
                </div>
              </div>
              
              <div className="max-h-48 sm:max-h-64 md:max-h-80 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {roundLosers.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-3xl sm:text-4xl mb-2">⏳</div>
                      <p className="text-sm">Sin eliminados aún</p>
                    </div>
                  ) : (
                    roundLosers.map((loser, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-400/30 rounded-lg sm:rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {loser.participant.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium sm:font-semibold truncate text-white text-sm sm:text-base">{loser.participant.name}</h4>
                            <p className="text-red-300 text-xs sm:text-sm">
                              {loser.participant.invoiceNumber} • R{loser.round}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {loser.participant.ciudad}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para scrollbar y animaciones */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #059669 #374151;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #059669, #10b981);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #047857, #059669);
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default SorteoScreen;