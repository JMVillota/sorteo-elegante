// src/App.jsx
import React, { useState, useEffect } from 'react';
import { getParticipants, getPrizes } from './services/api';
import LoadingScreen from './components/LoadingScreen';
import PrizeSelection from './components/PrizeSelection';
import ParticipantsList from './components/ParticipantsList';
import RouletteWheel from './components/RouletteWheel';
import WinnerDisplay from './components/WinnerDisplay';
import PodiumDisplay from './components/PodiumDisplay';
import logoTransparente from './assets/logo-transparente.png';

function App() {
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('participants'); // 'participants', 'gaming', 'podium'
  const [currentWinner, setCurrentWinner] = useState(null);
  const [awardedPrizes, setAwardedPrizes] = useState([]);

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const participantsData = await getParticipants();
        const prizesData = await getPrizes();
        
        if (participantsData.length > 0 && prizesData.length > 0) {
          setParticipants(participantsData);
          setPrizes(prizesData);
          setSelectedPrize(prizesData[0]);
        }
        
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Manejar selección de premio
  const handleSelectPrize = (prize) => {
    if (awardedPrizes.includes(prize.id)) {
      return; // No permitir seleccionar premios ya otorgados
    }
    
    setSelectedPrize(prize);
  };

  // Iniciar el sorteo
  const startSorteo = () => {
    setCurrentScreen('gaming');
  };

  // Manejar ganador
  const handleWinner = (winner) => {
    const newWinner = {
      participant: winner,
      prize: selectedPrize
    };
    
    // Actualizar lista de ganadores
    setWinners([...winners, newWinner]);
    setCurrentWinner(newWinner);
    
    // Marcar el premio como otorgado
    setAwardedPrizes([...awardedPrizes, selectedPrize.id]);
    
    // Verificar si quedan más premios por sortear
    setTimeout(() => {
      const stillAvailablePrizes = prizes.filter(p => 
        !awardedPrizes.includes(p.id) && p.id !== selectedPrize.id
      );
      
      // Si no quedan más premios, mostrar el podio después de un tiempo
      if (stillAvailablePrizes.length === 0) {
        setTimeout(() => {
          setCurrentScreen('podium');
        }, 5000); // Mostrar al último ganador por 5 segundos antes del podio
      } else {
        handleNextPrize();
      }
    }, 5000); // Mostrar al ganador por 5 segundos
  };

  // Continuar con el siguiente premio o finalizar
  const handleNextPrize = () => {
    const availablePrizes = prizes.filter(p => !awardedPrizes.includes(p.id));
    
    if (availablePrizes.length > 0) {
      setSelectedPrize(availablePrizes[0]);
      setCurrentWinner(null);
      if (currentScreen !== 'gaming') {
        setCurrentScreen('gaming');
      }
    } else {
      setCurrentScreen('podium');
    }
  };
  
  // Reiniciar todo el sorteo
  const resetSorteo = () => {
    setWinners([]);
    setAwardedPrizes([]);
    setCurrentScreen('participants');
    setSelectedPrize(prizes[0]);
  };

  const allPrizesAwarded = prizes.length > 0 && awardedPrizes.length === prizes.length;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-800 text-white overflow-x-hidden relative">
      {/* Logo de fondo */}
      <div className="fixed inset-0 flex items-center justify-center z-0 opacity-5 pointer-events-none">
        <img src={logoTransparente} alt="Prodispro" className="w-3/4 max-w-2xl" />
      </div>
      
      {/* Corazones flotantes */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={`heart-${i}`}
            className="absolute text-2xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            ❤️
          </div>
        ))}
      </div>
      
      {/* Header */}
      <header className="bg-red-600 p-4 border-b border-pink-300 shadow-lg relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoTransparente} alt="Prodispro" className="h-12 mr-3" />
            <h1 className="text-xl md:text-3xl font-bold text-white">
              <span className="mr-2">❤️</span> PRODISPRO SORTEO DÍA DE LA MADRE
            </h1>
          </div>
          
          {currentScreen === 'gaming' && (
            <div className="text-white font-bold animate-pulse">
              {currentWinner ? "¡Tenemos un ganador!" : "¡Girando la ruleta!"}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      {currentScreen === 'podium' ? (
        <PodiumDisplay winners={winners} onReset={resetSorteo} />
      ) : (
        <div className="container mx-auto p-4 flex flex-col z-10 relative">
          {/* Primera Fila - Premios (horizontales) */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center mb-4 text-white flex items-center justify-center">
              <span className="mr-2">🎁</span> Premios del Sorteo
            </h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                {prizes.map((prize) => {
                  const isAwarded = awardedPrizes.includes(prize.id);
                  const isSelected = selectedPrize && selectedPrize.id === prize.id;
                  
                  return (
                    <div
                      key={prize.id}
                      className={`
                        relative overflow-hidden bg-gradient-to-b from-red-700 to-red-900 p-3 rounded-lg text-center
                        transition-all duration-300 ease-in-out border-2 w-48
                        ${isAwarded ? 
                          'opacity-80 cursor-not-allowed border-green-500' : 
                          isSelected ? 
                            'border-yellow-300 shadow-lg shadow-yellow-500/20 transform -translate-y-1' : 
                            'border-transparent hover:-translate-y-1 hover:shadow-md'}
                      `}
                      onClick={() => !isAwarded && handleSelectPrize(prize)}
                    >
                      {isSelected && !isAwarded && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                      )}
                      
                      {isAwarded && (
                        <div className="absolute -right-8 top-0 bg-green-600 text-white font-bold py-1 px-8 transform rotate-45 shadow-md z-10 text-sm">
                          GANADO
                        </div>
                      )}
                      
                      <div className="text-2xl mb-1">
                        {prize.name.includes("Refrigeradora") ? "🧊" : 
                        prize.name.includes("Moto") ? "🛵" : 
                        prize.name.includes("Aspiradora") ? "🧹" : "☕"}
                      </div>
                      <h3 className={`text-sm font-bold ${isSelected && !isAwarded ? 'text-yellow-300' : 'text-white'}`}>
                        {prize.name}
                      </h3>
                      
                      {/* Etiqueta de GANADO */}
                      {isAwarded && (
                        <div className="absolute -left-6 top-4 bg-green-500 text-white text-xs font-bold py-1 px-4 transform -rotate-45">
                          GANADO
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Segunda Fila - Ruleta */}
          {currentScreen === 'gaming' ? (
            <div className="mb-6">
              <RouletteWheel 
                participants={participants}
                onWinnerSelected={handleWinner}
                currentWinner={currentWinner}
                allPrizesAwarded={allPrizesAwarded}
                selectedPrize={selectedPrize}
              />
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-red-700/70 rounded-xl p-6 border border-pink-300">
                <h2 className="text-2xl font-bold text-center mb-4 text-white">
                  <span className="mr-2">🎯</span> Participantes del Sorteo
                </h2>
                <div className="overflow-y-auto max-h-[50vh]">
                  <table className="w-full border-collapse">
                    <thead className="bg-red-800">
                      <tr>
                        <th className="p-3 text-left text-white">Cliente</th>
                        <th className="p-3 text-left text-white">Factura</th>
                        <th className="p-3 text-left text-white">Fecha</th>
                        <th className="p-3 text-left text-white">Vendedor</th>
                        <th className="p-3 text-left text-white">Ciudad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant, idx) => (
                        <tr 
                          key={participant.id} 
                          className={`border-b border-pink-300/10 hover:bg-red-600 transition-colors
                            ${idx % 2 === 0 ? 'bg-red-900/30' : 'bg-red-900/20'}`}
                        >
                          <td className="p-3">{participant.name}</td>
                          <td className="p-3">{participant.invoiceNumber}</td>
                          <td className="p-3">{participant.fechaFormateada}</td>
                          <td className="p-3 truncate max-w-[150px]">{participant.vendedor}</td>
                          <td className="p-3">{participant.ciudad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-center mt-6">
                  <button
                    onClick={startSorteo}
                    disabled={!selectedPrize}
                    className={`
                      px-8 py-3 rounded-full font-bold uppercase tracking-wider relative overflow-hidden
                      ${selectedPrize ? 
                        'bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 shadow-lg hover:-translate-y-1 transition-all duration-300' : 
                        'bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {selectedPrize && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    )}
                    <div className="flex items-center">
                      <span className="mr-2">🎮</span> Comenzar Sorteo
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Tercera Fila - Ganadores (scrollable horizontal) */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-4 text-white flex items-center justify-center">
              <span className="mr-2">🏆</span> Ganadores
            </h2>
            
            {winners.length > 0 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 min-w-max">
                  {winners.map((winner, index) => (
                    <div 
                      key={index}
                      className="bg-red-700 rounded-lg p-4 border border-pink-300/40 hover:border-pink-300/80 transition-all hover:-translate-y-1 duration-300 shadow-lg relative overflow-hidden w-60"
                    >
                      <div className="absolute top-0 right-0 bg-gradient-to-bl from-pink-500/30 to-transparent w-20 h-20 rounded-bl-full"></div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-lg font-bold shadow-md border-2 border-white/30">
                          {winner.participant.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="overflow-hidden flex-1">
                          <h3 className="font-bold truncate text-white">{winner.participant.name}</h3>
                          <p className="text-xs text-yellow-200 truncate">{winner.participant.invoiceNumber}</p>
                          <p className="text-xs text-yellow-200/80 truncate">{winner.participant.fechaFormateada}</p>
                          <p className="text-xs text-yellow-200/70 truncate">{winner.participant.ciudad}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-red-900/70 rounded-lg border border-yellow-500/20 text-center">
                        <p className="font-bold text-yellow-200">
                          {winner.prize.name.includes("Refrigeradora") ? "🧊 " : 
                          winner.prize.name.includes("Moto") ? "🛵 " : 
                          winner.prize.name.includes("Aspiradora") ? "🧹 " : "☕ "}
                          {winner.prize.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-white p-8 bg-red-800/50 rounded-xl border border-pink-300/40">
                <p className="text-lg">Aún no hay ganadores</p>
                <p className="text-sm mt-2">Los ganadores aparecerán aquí una vez iniciado el sorteo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-6 py-4 bg-red-800 text-center text-white text-sm border-t border-pink-300/40 relative z-10">
        <div className="container mx-auto">
          <p>❤️ PRODISPRO - Sorteo Día de la Madre 2025 ❤️</p>
        </div>
      </footer>
      
      {/* Animaciones globales */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default App;