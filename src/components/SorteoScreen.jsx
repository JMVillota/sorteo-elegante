// src/components/SorteoScreen.jsx
import React, { useState, useEffect } from 'react';
import RouletteWheel from './RouletteWheel';

const SorteoScreen = ({ prize, participants, onComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinners, setRoundWinners] = useState([]);
  const [roundLosers, setRoundLosers] = useState([]);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Calcular total de rondas (2 perdedores + 1 ganador por cada unidad del premio)
  const totalRounds = prize.cantidad * 3;
  const isWinnerRound = currentRound % 3 === 0; // Cada tercera ronda es ganador

  useEffect(() => {
    // Si completamos todas las rondas, finalizar
    if (currentRound > totalRounds) {
      onComplete(roundWinners);
      return;
    }
  }, [currentRound, totalRounds, roundWinners, onComplete]);

  const handleRoundComplete = (selectedParticipant) => {
    setCurrentWinner(selectedParticipant);
    setShowResult(true);
    
    if (isWinnerRound) {
      setRoundWinners([...roundWinners, {
        participant: selectedParticipant,
        prize: prize,
        round: currentRound,
        unit: Math.ceil(currentRound / 3)
      }]);
    } else {
      setRoundLosers([...roundLosers, {
        participant: selectedParticipant,
        round: currentRound
      }]);
    }

    // Mostrar resultado por 3 segundos
    setTimeout(() => {
      setShowResult(false);
      setCurrentWinner(null);
      setCurrentRound(currentRound + 1);
      setIsRoundActive(false);
    }, 3000);
  };

  const startRound = () => {
    setIsRoundActive(true);
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
    <div className="w-full min-h-screen bg-prodispro-black">
      {/* Header del Sorteo */}
      <div className="w-full bg-prodispro-gray p-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getPrizeIcon(prize.name)}</div>
              <div>
                <h1 className="text-2xl font-bold text-prodispro-blue">{prize.name}</h1>
                <p className="text-gray-400">
                  Unidad {getCurrentUnit()} de {prize.cantidad} • 
                  Ronda {getRoundInUnit()} de 3 • 
                  {isWinnerRound ? 'GANADOR' : 'PERDEDOR'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-prodispro-blue">
                {currentRound}/{totalRounds}
              </div>
              <div className="text-sm text-gray-400">Rondas completadas</div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="w-full bg-prodispro-light-gray rounded-full h-3">
              <div 
                className="bg-prodispro-blue h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador del tipo de ronda */}
      <div className="text-center mb-6">
        <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg ${
          isWinnerRound 
            ? 'bg-green-600 text-white' 
            : 'bg-yellow-600 text-white'
        }`}>
          {isWinnerRound ? '🏆 RONDA GANADORA' : '❌ RONDA PERDEDORA'}
        </div>
        <p className="text-gray-400 mt-2">
          {isWinnerRound 
            ? 'El siguiente participante ganará el premio' 
            : 'El siguiente participante no ganará (pero participa)'}
        </p>
      </div>

      {/* Layout en 2 columnas */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna 1 - Máquina tragamonedas */}
        <div className="bg-prodispro-gray rounded-xl p-6">
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

        {/* Columna 2 - Ganadores y Perdedores */}
        <div className="space-y-6">
          {/* Ganadores */}
          <div className="bg-prodispro-gray rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4">🏆 Ganadores ({roundWinners.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {roundWinners.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Aún no hay ganadores</p>
                  <p className="text-sm">Los ganadores aparecerán aquí</p>
                </div>
              ) : (
                roundWinners.map((winner, index) => (
                  <div key={index} className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {winner.participant.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{winner.participant.name}</h4>
                        <p className="text-sm text-gray-400">
                          {winner.participant.invoiceNumber} • Unidad {winner.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          {winner.participant.ciudad} • {winner.participant.fechaFormateada}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Perdedores */}
          <div className="bg-prodispro-gray rounded-xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">❌ Perdedores ({roundLosers.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {roundLosers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Aún no hay perdedores</p>
                  <p className="text-sm">Los perdedores aparecerán aquí</p>
                </div>
              ) : (
                roundLosers.map((loser, index) => (
                  <div key={index} className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {loser.participant.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{loser.participant.name}</h4>
                        <p className="text-sm text-gray-400">
                          {loser.participant.invoiceNumber} • Ronda {loser.round}
                        </p>
                        <p className="text-xs text-gray-500">
                          {loser.participant.ciudad} • {loser.participant.fechaFormateada}
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
  );
};

export default SorteoScreen;