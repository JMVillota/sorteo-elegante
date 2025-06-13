// src/components/PrizeSelectionScreen.jsx
import React, { useState, useCallback } from 'react';

const PrizeSelectionScreen = ({ prizes, participants, completedPrizes, onStartSorteo, systemStats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrize, setSelectedPrize] = useState(null);

  const filteredParticipants = participants.filter(participant => 
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Optimización: useCallback para evitar re-renders innecesarios
  const handlePrizeSelect = useCallback((prize) => {
    if (!completedPrizes.includes(prize.id)) {
      setSelectedPrize(prize);
    }
  }, [completedPrizes]);

  const handleStartSorteo = useCallback(() => {
    if (selectedPrize) {
      onStartSorteo(selectedPrize);
    }
  }, [selectedPrize, onStartSorteo]);

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
    <div className="animate-fade-in-up">
      {/* Header con estadísticas */}
      {systemStats && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-modern text-center">
            <div className="text-3xl font-bold text-gradient-primary mb-2">
              {systemStats.participants.total}
            </div>
            <div className="text-sm text-gray-400">Participantes</div>
          </div>
          <div className="card-modern text-center">
            <div className="text-3xl font-bold text-gradient-winner mb-2">
              {systemStats.prizes.totalPrizeTypes}
            </div>
            <div className="text-sm text-gray-400">Tipos de Premios</div>
          </div>
          <div className="card-modern text-center">
            <div className="text-3xl font-bold text-gradient-loser mb-2">
              {systemStats.prizes.totalUnits}
            </div>
            <div className="text-sm text-gray-400">Unidades Totales</div>
          </div>
          <div className="card-modern text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {systemStats.participants.citiesCount}
            </div>
            <div className="text-sm text-gray-400">Ciudades</div>
          </div>
        </div>
      )}

      {/* Grid con altura uniforme - SIN SCROLL en premios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[800px]">
        {/* Panel de Premios - SIN SCROLL VERTICAL */}
        <div className="card-modern h-full flex flex-col">
          <h2 className="text-3xl font-bold mb-6 text-gradient-primary text-center flex-shrink-0">
            🎁 Premios Disponibles
          </h2>
          
          {/* Lista de premios SIN SCROLL - altura fija */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {prizes.map((prize) => {
              const isCompleted = completedPrizes.includes(prize.id);
              const isSelected = selectedPrize?.id === prize.id;
              const prizeImage = getPrizeImage(prize);
              
              return (
                <div
                  key={prize.id}
                  className={`prize-card p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 gpu-accelerated ${
                    isCompleted 
                      ? 'border-green-500 bg-green-500/10 opacity-60 cursor-not-allowed'
                      : isSelected
                        ? 'border-prodispro-blue bg-prodispro-blue/10 shadow-glow transform scale-[1.02]'
                        : 'border-slate-600 bg-slate-800/50 hover:border-prodispro-blue/50 hover:bg-slate-800/70'
                  }`}
                  onClick={() => handlePrizeSelect(prize)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Imagen del premio */}
                      <div className="w-20 h-20 flex-shrink-0 relative">
                        {prizeImage ? (
                          <img 
                            src={prizeImage} 
                            alt={prize.name}
                            className="w-full h-full object-cover rounded-xl border-2 border-prodispro-blue/50 shadow-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full ${prizeImage ? 'hidden' : 'flex'} items-center justify-center text-5xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-prodispro-blue/50 shadow-lg`}
                        >
                          {getPrizeIcon(prize.name)}
                        </div>
                        
                        {/* Badge de cantidad */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-prodispro-blue to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {prize.cantidad}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{prize.name}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold">Cantidad:</span> {prize.cantidad} {prize.cantidad === 1 ? 'unidad' : 'unidades'}
                          </p>
                          <p className="text-xs text-gray-400">
                            <span className="font-semibold">Sorteos:</span> {prize.cantidad * 3} total ({prize.cantidad * 2} eliminados + {prize.cantidad} ganador{prize.cantidad > 1 ? 'es' : ''})
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Estados del premio */}
                    <div className="flex items-center space-x-3">
                      {isCompleted && (
                        <div className="text-green-400 font-bold text-lg animate-custom-pulse">
                          ✅ COMPLETADO
                        </div>
                      )}
                      
                      {isSelected && !isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartSorteo();
                          }}
                          className="btn-modern btn-primary px-6 py-3 text-lg font-bold flex items-center space-x-2 animate-pulse"
                        >
                          <span>🚀</span>
                          <span>GO</span>
                        </button>
                      )}
                      
                      {!isSelected && !isCompleted && (
                        <div className="text-gray-500 text-sm">
                          Click para seleccionar
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Participantes - CON SCROLL */}
        <div className="card-modern h-full flex flex-col">
          <h2 className="text-3xl font-bold mb-6 text-gradient-primary text-center flex-shrink-0">
            👥 Participantes
          </h2>
          
          {/* Buscador - Fijo */}
          <div className="mb-6 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar participante, factura, ciudad, vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus-modern transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-prodispro-blue">{filteredParticipants.length}</span> de <span className="font-semibold">{participants.length}</span> participantes
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Limpiar filtro ✖️
                </button>
              )}
            </div>
          </div>
          
          {/* Lista de Participantes - CON SCROLL */}
          <div className="flex-1 overflow-y-auto smooth-scroll custom-scrollbar min-h-0 pr-2">
            <div className="space-y-3">
              {filteredParticipants.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-6xl mb-4 animate-float-gentle">🔍</div>
                  <p className="text-lg">No se encontraron participantes</p>
                  <p className="text-sm">Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                filteredParticipants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="participant-item p-4 bg-slate-800/50 rounded-xl border border-slate-600 hover:border-prodispro-blue/50 gpu-accelerated transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-prodispro-blue to-cyan-400 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg flex-shrink-0">
                        {participant.name.charAt(0)}
                      </div>
                      
                      {/* Información del participante */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate text-lg">
                          {participant.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <span>📄</span>
                            <span className="font-mono">{participant.invoiceNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>📅</span>
                            <span>{participant.fechaFormateada}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>📍</span>
                            <span className="truncate">{participant.ciudad}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>👤</span>
                            <span className="truncate">{participant.vendedor || 'N/A'}</span>
                          </div>
                        </div>
                        
                        {/* Información adicional */}
                        {participant.totalFactura && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span>💰 Total: $</span>
                            <span className="font-semibold">{participant.totalFactura.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Número de orden */}
                      <div className="text-xs text-gray-500 font-mono bg-slate-700 px-2 py-1 rounded flex-shrink-0">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información del premio seleccionado - COMPACT */}
      {selectedPrize && !completedPrizes.includes(selectedPrize.id) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-prodispro-blue/10 to-cyan-400/10 border-2 border-prodispro-blue/50 rounded-2xl backdrop-modern animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex-shrink-0">
                {getPrizeImage(selectedPrize) ? (
                  <img 
                    src={getPrizeImage(selectedPrize)} 
                    alt={selectedPrize.name}
                    className="w-full h-full object-cover rounded-xl border-2 border-prodispro-blue shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-prodispro-blue">
                    {getPrizeIcon(selectedPrize.name)}
                  </div>
                )}
              </div>
              <div>
                <h5 className="text-lg font-bold text-white">{selectedPrize.name}</h5>
                <p className="text-sm text-gray-400">
                  {selectedPrize.cantidad} unidad{selectedPrize.cantidad > 1 ? 'es' : ''} • {selectedPrize.cantidad * 3} sorteos total
                </p>
              </div>
            </div>
            
            <button
              onClick={handleStartSorteo}
              className="btn-modern btn-primary px-8 py-3 text-lg font-bold flex items-center space-x-3 sorteo-glow"
            >
              <span className="text-xl">🎯</span>
              <span>Comenzar Sorteo</span>
              <span className="text-xl">🎰</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #019BDC #374151;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #019BDC, #22D3EE);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0284c7, #0891b2);
        }
        
        /* Optimización de transiciones */
        .prize-card {
          will-change: transform, box-shadow;
        }
        
        .participant-item {
          will-change: border-color, background-color;
        }
      `}</style>
    </div>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
export default React.memo(PrizeSelectionScreen);