// src/components/SorteoScreen.jsx
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

  // Calcular total de rondas (2 perdedores + 1 ganador por cada unidad del premio)
  const totalRounds = prize.cantidad * 3;
  const isWinnerRound = currentRound % 3 === 0;

  // Verificar finalización basada en ganadores REALES
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
    
    // CAMBIO: Mostrar modal para AMBOS casos (ganadores y perdedores)
    setTimeout(() => {
      setShowWinnerModal(true);
    }, 1000);
    
    // ELIMINADO: Ya no hay auto-continuar para perdedores
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
      
      {/* Winner Modal - ACTUALIZADO para manejar eliminados */}
      <WinnerModal
        isOpen={showWinnerModal}
        winner={currentWinner}
        prize={prize}
        unit={getCurrentUnit()}
        onContinue={handleModalContinue}
        isWinnerRound={isWinnerRound}
      />

      {/* Layout para pantallas grandes (4 columnas) */}
      <div className="hidden 2xl:flex flex-col h-screen">
        {/* Header del Sorteo */}
        <div className="bg-gradient-to-r via-gray-800 p-6 border-b-2 border-gradient-to-r from-prodispro-blue to-cyan-400 flex-shrink-0 shadow-xl">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 relative">
                {getPrizeImage(prize) ? (
                  <img 
                    src={getPrizeImage(prize)} 
                    alt={prize.name}
                    className="w-full h-full object-cover rounded-2xl border-3 border-gradient-to-r from-prodispro-blue to-cyan-400 shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-700 to-gray-700 rounded-2xl border-3 border-prodispro-blue shadow-lg">
                    {getPrizeIcon(prize.name)}
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-prodispro-blue to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {getCurrentUnit()}
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-prodispro-blue to-cyan-400 bg-clip-text text-transparent mb-2">
                  {prize.name}
                </h1>
                <p className="text-xl text-gray-300 mb-1">
                  Unidad {getCurrentUnit()} de {prize.cantidad} • 
                  Ronda {getRoundInUnit()} de 3
                </p>
                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                  isWinnerRound 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                }`}>
                  {isWinnerRound ? '🏆 GANADOR' : '❌ ELIMINADO'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-prodispro-blue to-cyan-400 bg-clip-text text-transparent">
                {currentRound}/{totalRounds}
              </div>
              <div className="text-lg text-gray-400">Rondas completadas</div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-6 max-w-screen-2xl mx-auto">
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-prodispro-blue via-cyan-400 to-blue-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal en 4 columnas */}
        <div className="flex-1 grid grid-cols-4 gap-6 p-6 max-w-screen-2xl mx-auto w-full min-h-0">
          
          {/* Columna 1 - Máquina tragamonedas (2 columnas de ancho) */}
          <div className="col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-8 flex flex-col justify-center border border-slate-600 shadow-2xl">
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

          {/* Columna 2 - ELIMINADOS (antes Perdedores) */}
          <div className="col-span-1 bg-gradient-to-br from-red-900/30 to-rose-900/30 rounded-3xl p-6 flex flex-col min-h-0 border border-red-500/30 shadow-xl">
            <div className="flex items-center justify-center mb-6 flex-shrink-0">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-3 rounded-2xl">
                <h3 className="text-2xl font-bold text-white text-center">
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
                    <p className="text-lg">Aparecerán aquí</p>
                  </div>
                ) : (
                  roundLosers.map((loser, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-400/30 rounded-xl flex-shrink-0 hover:from-red-500/20 hover:to-rose-500/20 transition-all duration-300">
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
                            {loser.participant.ciudad} • {loser.participant.fechaFormateada}
                          </p>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full font-semibold">
                              ELIMINADO
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Columna 3 - Ganadores */}
          <div className="col-span-1 bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-3xl p-6 flex flex-col min-h-0 border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-center mb-6 flex-shrink-0">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 rounded-2xl">
                <h3 className="text-2xl font-bold text-white text-center">
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
                    <p className="text-lg">Aparecerán aquí</p>
                  </div>
                ) : (
                  roundWinners.map((winner, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-xl relative overflow-hidden flex-shrink-0 hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-300">
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
                            {winner.participant.ciudad} • {winner.participant.fechaFormateada}
                          </p>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-semibold">
                              GANADOR
                            </span>
                          </div>
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
      </div>

      {/* Layout responsivo para pantallas menores */}
      <div className="2xl:hidden">
        {/* Header responsivo */}
        <div className="w-full bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 p-4 mb-4 border-b-2 border-prodispro-blue shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 relative">
                  {getPrizeImage(prize) ? (
                    <img 
                      src={getPrizeImage(prize)} 
                      alt={prize.name}
                      className="w-full h-full object-cover rounded-xl border-2 border-prodispro-blue shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-700 to-gray-700 rounded-xl border-2 border-prodispro-blue">
                      {getPrizeIcon(prize.name)}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-prodispro-blue rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {getCurrentUnit()}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-prodispro-blue to-cyan-400 bg-clip-text text-transparent">
                    {prize.name}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    U{getCurrentUnit()}/{prize.cantidad} • R{getRoundInUnit()}/3
                  </p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    isWinnerRound 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                  }`}>
                    {isWinnerRound ? '🏆 GANADOR' : '❌ ELIMINADO'}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-prodispro-blue to-cyan-400 bg-clip-text text-transparent">
                  {currentRound}/{totalRounds}
                </div>
                <div className="text-xs text-gray-400">Rondas</div>
              </div>
            </div>
            
            {/* Barra de progreso móvil */}
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-prodispro-blue via-cyan-400 to-blue-500 rounded-full transition-all duration-300 relative"
                  style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid responsivo móvil/tablet */}
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Máquina tragamonedas */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-4 mb-4 border border-slate-600 shadow-xl">
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

          {/* Grid 2x2 para ganadores y eliminados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ganadores */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-2xl p-4 border border-emerald-500/30 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 rounded-xl">
                  <h3 className="text-lg font-bold text-white text-center">
                    🏆 GANADORES ({roundWinners.length}/{prize.cantidad})
                  </h3>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {roundWinners.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">🎯</div>
                      <p className="text-sm">Sin ganadores aún</p>
                    </div>
                  ) : (
                    roundWinners.map((winner, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-lg relative overflow-hidden">
                        <div className="flex items-center space-x-3 relative z-10">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {winner.participant.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-white">{winner.participant.name}</h4>
                            <p className="text-emerald-300 text-xs">
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
            </div>

            {/* Eliminados (antes Perdedores) */}
            <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 rounded-2xl p-4 border border-red-500/30 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 rounded-xl">
                  <h3 className="text-lg font-bold text-white text-center">
                    ❌ ELIMINADOS ({roundLosers.length})
                  </h3>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {roundLosers.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">⏳</div>
                      <p className="text-sm">Sin eliminados aún</p>
                    </div>
                  ) : (
                    roundLosers.map((loser, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-400/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {loser.participant.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-white">{loser.participant.name}</h4>
                            <p className="text-red-300 text-xs">
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
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #059669, #10b981);
          border-radius: 4px;
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