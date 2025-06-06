// src/components/PrizeSelectionScreen.jsx
import React, { useState } from 'react';

const PrizeSelectionScreen = ({ prizes, participants, completedPrizes, onStartSorteo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrize, setSelectedPrize] = useState(null);

  const filteredParticipants = participants.filter(participant => 
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrizeIcon = (prizeName) => {
    if (prizeName.includes("CAFETERA")) return "☕";
    if (prizeName.includes("ASPIRADORA")) return "🧹";
    if (prizeName.includes("MOTO")) return "🏍️";
    if (prizeName.includes("REFRIGERADORA")) return "🧊";
    return "🎁";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Panel de Premios */}
      <div className="bg-prodispro-gray rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-prodispro-blue">Premios Disponibles</h2>
        
        <div className="space-y-4">
          {prizes.map((prize) => {
            const isCompleted = completedPrizes.includes(prize.id);
            const isSelected = selectedPrize?.id === prize.id;
            
            return (
              <div
                key={prize.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? 'border-green-500 bg-green-500/10 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-prodispro-blue bg-prodispro-blue/10'
                      : 'border-prodispro-light-gray hover:border-prodispro-blue/50'
                }`}
                onClick={() => !isCompleted && setSelectedPrize(prize)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getPrizeIcon(prize.name)}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{prize.name}</h3>
                      <p className="text-sm text-gray-400">
                        Cantidad: {prize.cantidad} {prize.cantidad === 1 ? 'unidad' : 'unidades'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sorteos: {prize.cantidad * 2} perdedores + {prize.cantidad} ganador{prize.cantidad > 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="text-green-500 font-bold">
                      ✓ COMPLETADO
                    </div>
                  )}
                  
                  {isSelected && !isCompleted && (
                    <div className="text-prodispro-blue font-bold">
                      SELECCIONADO
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedPrize && !completedPrizes.includes(selectedPrize.id) && (
          <div className="mt-6 p-4 bg-prodispro-blue/10 border border-prodispro-blue rounded-lg">
            <h4 className="font-semibold text-prodispro-blue mb-2">Premio Seleccionado:</h4>
            <p className="text-lg">{selectedPrize.name}</p>
            <p className="text-sm text-gray-400 mb-4">
              Se realizarán {selectedPrize.cantidad * 3} sorteos total 
              ({selectedPrize.cantidad * 2} perdedores + {selectedPrize.cantidad} ganador{selectedPrize.cantidad > 1 ? 'es' : ''})
            </p>
            
            <button
              onClick={() => onStartSorteo(selectedPrize)}
              className="w-full bg-prodispro-blue hover:bg-prodispro-blue/80 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🎯</span>
              <span>Comenzar Sorteo</span>
            </button>
          </div>
        )}
      </div>

      {/* Panel de Participantes */}
      <div className="bg-prodispro-gray rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-prodispro-blue">Participantes</h2>
        
        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar participante, factura, ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-prodispro-light-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-prodispro-blue"
          />
          <p className="text-sm text-gray-400 mt-2">
            {filteredParticipants.length} de {participants.length} participantes
          </p>
        </div>
        
        {/* Lista de Participantes */}
        <div className="h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className="p-3 bg-prodispro-light-gray rounded-lg hover:bg-prodispro-light-gray/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-prodispro-blue rounded-full flex items-center justify-center text-sm font-bold">
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{participant.name}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                      <span>📄 {participant.invoiceNumber}</span>
                      <span>📅 {participant.fechaFormateada}</span>
                      <span>📍 {participant.ciudad}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeSelectionScreen;