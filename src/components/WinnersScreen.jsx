// src/components/WinnersScreen.jsx
import React from 'react';

const WinnersScreen = ({ winners, onReset }) => {
  const getPrizeIcon = (prizeName) => {
    if (prizeName.includes("CAFETERA")) return "☕";
    if (prizeName.includes("ASPIRADORA")) return "🧹";
    if (prizeName.includes("MOTO")) return "🏍️";
    if (prizeName.includes("REFRIGERADORA")) return "🧊";
    return "🎁";
  };

  // Agrupar ganadores por premio
  const groupedWinners = winners.reduce((acc, winner) => {
    const prizeId = winner.prize.id;
    if (!acc[prizeId]) {
      acc[prizeId] = {
        prize: winner.prize,
        winners: []
      };
    }
    acc[prizeId].winners.push(winner);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-prodispro-blue mb-4">🏆 Ganadores del Sorteo</h1>
        <p className="text-gray-400 text-lg">¡Felicitaciones a todos los ganadores!</p>
      </div>

      {/* Lista de ganadores por premio */}
      <div className="space-y-8 mb-8">
        {Object.values(groupedWinners).map((group, index) => (
          <div key={group.prize.id} className="bg-prodispro-gray rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl">{getPrizeIcon(group.prize.name)}</div>
              <div>
                <h2 className="text-2xl font-bold text-prodispro-blue">{group.prize.name}</h2>
                <p className="text-gray-400">{group.winners.length} ganador{group.winners.length > 1 ? 'es' : ''}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.winners.map((winner, winnerIndex) => (
                <div
                  key={winnerIndex}
                  className="bg-gradient-to-r from-green-600/20 to-green-400/20 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-lg font-bold">
                      {winner.participant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{winner.participant.name}</h3>
                      <p className="text-sm text-gray-400">Unidad #{winner.unit}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <span>📄</span>
                      <span>{winner.participant.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>{winner.participant.fechaFormateada}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📍</span>
                      <span>{winner.participant.ciudad}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>👤</span>
                      <span className="truncate">{winner.participant.vendedor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="bg-prodispro-gray rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-prodispro-blue mb-4">📊 Resumen del Sorteo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-prodispro-blue">{winners.length}</div>
            <div className="text-sm text-gray-400">Total Ganadores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-prodispro-blue">{Object.keys(groupedWinners).length}</div>
            <div className="text-sm text-gray-400">Premios Sorteados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-prodispro-blue">{winners.length * 3}</div>
            <div className="text-sm text-gray-400">Rondas Realizadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-prodispro-blue">100%</div>
            <div className="text-sm text-gray-400">Sorteo Completado</div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="text-center space-y-4">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-prodispro-blue hover:bg-prodispro-blue/80 rounded-lg font-bold transition-colors"
        >
          🔄 Nuevo Sorteo
        </button>
        
        <div className="text-sm text-gray-400">
          ¿Deseas realizar un nuevo sorteo? Esto reiniciará todo el sistema.
        </div>
      </div>
    </div>
  );
};

export default WinnersScreen;