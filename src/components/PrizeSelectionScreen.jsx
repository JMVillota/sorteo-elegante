// src/components/PrizeSelectionScreen.jsx
import React, { useState, useCallback } from 'react';
import { FaPlay, FaTimes } from 'react-icons/fa';

const PrizeSelectionScreen = ({ prizes, participants, completedPrizes, onStartSorteo, systemStats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrize, setSelectedPrize] = useState(null);

  const filteredParticipants = participants.filter(participant => 
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrizeSelect = useCallback((prize) => {
    if (!completedPrizes.includes(prize.id)) {
      setSelectedPrize(selectedPrize?.id === prize.id ? null : prize);
    }
  }, [completedPrizes, selectedPrize]);

  const handleStartSorteo = () => {
    if (selectedPrize) {
      onStartSorteo(selectedPrize);
      setSelectedPrize(null);
    }
  };

  const handleCancelSelection = () => {
    setSelectedPrize(null);
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

  return (
    <div className="animate-fade-in-up px-2 sm:px-4">
      {/* Header con estadísticas - Responsivo */}
      {systemStats && (
        <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="card-modern text-center p-3 sm:p-4">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1">
              {systemStats.participants.total}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Participantes</div>
          </div>
          <div className="card-modern text-center p-3 sm:p-4">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-winner mb-1">
              {systemStats.prizes.totalPrizeTypes}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Tipos Premios</div>
          </div>
          <div className="card-modern text-center p-3 sm:p-4">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-loser mb-1">
              {systemStats.prizes.totalUnits}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Unidades</div>
          </div>
          <div className="card-modern text-center p-3 sm:p-4">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 mb-1">
              {systemStats.participants.citiesCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Ciudades</div>
          </div>
        </div>
      )}

      {/* Layout responsivo - Stack en móvil, Grid en desktop */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        
        {/* Panel de Premios */}
        <div className="card-modern">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gradient-primary text-center">
            🎁 Premios Disponibles
          </h2>
          
          <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {prizes.map((prize) => {
              const isCompleted = completedPrizes.includes(prize.id);
              const isSelected = selectedPrize?.id === prize.id;
              const prizeImage = getPrizeImage(prize);
              
              return (
                <div
                  key={prize.id}
                  className={`relative prize-card rounded-xl sm:rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isCompleted 
                      ? 'border-green-500 bg-green-500/10 opacity-60 cursor-not-allowed'
                      : isSelected
                        ? 'border-prodispro-blue bg-prodispro-blue/20 shadow-lg shadow-prodispro-blue/25'
                        : 'border-slate-600 bg-slate-800/50 hover:border-prodispro-blue/50 hover:bg-slate-800/70 hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {/* Contenido principal del premio */}
                  <div
                    className={`p-3 sm:p-4 ${isSelected ? 'pr-12 sm:pr-16' : ''}`}
                    onClick={() => !isCompleted && handlePrizeSelect(prize)}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Imagen del premio */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex-shrink-0 relative">
                        {prizeImage ? (
                          <img 
                            src={prizeImage} 
                            alt={prize.name}
                            className="w-full h-full object-cover rounded-lg border-2 border-prodispro-blue/50 shadow-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full ${prizeImage ? 'hidden' : 'flex'} items-center justify-center text-lg sm:text-xl md:text-2xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-2 border-prodispro-blue/50 shadow-lg`}
                        >
                          {getPrizeIcon(prize.name)}
                        </div>
                        
                        {/* Badge de cantidad */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-prodispro-blue to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                          {prize.cantidad}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 truncate">
                          {prize.name}
                        </h3>
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm text-gray-300">
                            {prize.cantidad} {prize.cantidad === 1 ? 'unidad' : 'unidades'} • {prize.cantidad * 3} sorteos
                          </p>
                          {!isCompleted && !isSelected && (
                            <p className="text-xs text-prodispro-blue">
                              👆 Toca para seleccionar
                            </p>
                          )}
                          {isSelected && (
                            <p className="text-xs text-prodispro-blue animate-pulse">
                              ✨ Premio seleccionado
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Estado del premio */}
                      <div className="flex-shrink-0">
                        {isCompleted && (
                          <div className="text-green-400 font-bold text-xs animate-pulse">
                            ✅
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción flotantes */}
                  {isSelected && !isCompleted && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                      {/* Botón Iniciar Sorteo */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSorteo();
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 group"
                        title="Iniciar Sorteo"
                      >
                        <FaPlay className="text-xs sm:text-sm ml-0.5" />
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Iniciar
                        </div>
                      </button>
                      
                      {/* Botón Cancelar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelSelection();
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 group"
                        title="Cancelar"
                      >
                        <FaTimes className="text-xs sm:text-sm" />
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Cancelar
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Efecto de brillo para premio seleccionado */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-prodispro-blue/10 to-transparent animate-shimmer pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Participantes */}
        <div className="card-modern">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gradient-primary text-center">
            👥 Participantes ({participants.length})
          </h2>
          
          {/* Buscador */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar participante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/80 border-2 border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus-modern transition-all duration-300 text-sm sm:text-base"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2 sm:mt-3">
              <p className="text-xs sm:text-sm text-gray-400">
                <span className="font-semibold text-prodispro-blue">{filteredParticipants.length}</span> de <span className="font-semibold">{participants.length}</span>
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Limpiar ✖️
                </button>
              )}
            </div>
          </div>
          
          {/* Lista de Participantes */}
          <div className="max-h-80 sm:max-h-96 md:max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-2 sm:space-y-3">
              {filteredParticipants.length === 0 ? (
                <div className="text-center text-gray-400 py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-pulse">🔍</div>
                  <p className="text-sm sm:text-lg">No se encontraron participantes</p>
                </div>
              ) : (
                filteredParticipants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="participant-item p-3 sm:p-4 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-600 hover:border-prodispro-blue/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-prodispro-blue to-cyan-400 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-lg flex-shrink-0">
                        {participant.name.charAt(0)}
                      </div>
                      
                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm sm:text-base truncate">
                          {participant.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-300">
                            <span>📄</span>
                            <span className="font-mono truncate">{participant.invoiceNumber}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <span>📍</span>
                            <span className="truncate">{participant.ciudad}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Número */}
                      <div className="text-xs text-gray-500 font-mono bg-slate-700 px-1.5 py-0.5 rounded flex-shrink-0">
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

      {/* Información del premio seleccionado */}
      {selectedPrize && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-96 bg-gradient-to-r from-prodispro-blue/90 to-cyan-500/90 backdrop-blur-sm border border-prodispro-blue/50 rounded-2xl p-4 shadow-2xl z-40 animate-scale-up">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex-shrink-0">
              {getPrizeImage(selectedPrize) ? (
                <img 
                  src={getPrizeImage(selectedPrize)} 
                  alt={selectedPrize.name}
                  className="w-full h-full object-cover rounded-xl border-2 border-white/30"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-white/20 rounded-xl border-2 border-white/30">
                  {getPrizeIcon(selectedPrize.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm truncate">
                {selectedPrize.name}
              </h3>
              <p className="text-xs text-white/80">
                {selectedPrize.cantidad} unidades • {selectedPrize.cantidad * 3} sorteos
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartSorteo}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <FaPlay className="text-xs" />
                <span>Sortear</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #019BDC #374151;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #019BDC, #22D3EE);
          border-radius: 3px;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        @keyframes scale-up {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(PrizeSelectionScreen);