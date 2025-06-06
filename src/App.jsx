// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getParticipants, getPrizes } from './services/api';
import LoadingScreen from './components/LoadingScreen';
import PrizeSelection from './components/PrizeSelection';
import ParticipantsList from './components/ParticipantsList';
import RouletteWheel from './components/RouletteWheel';
import WinnerDisplay from './components/WinnerDisplay';
import PodiumDisplay from './components/PodiumDisplay';
import useWindowSize from './hooks/useWindowSize';
import logoTransparente from './assets/logo-transparente.png';

function App() {
  const { width, height } = useWindowSize();
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('participants'); // 'participants', 'gaming', 'podium'
  const [currentWinner, setCurrentWinner] = useState(null);
  const [awardedPrizes, setAwardedPrizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [isHeartAnimationReset, setIsHeartAnimationReset] = useState(false);

  // Refs for the animation elements
  const heartRefs = useRef([]);
  
  // Calculate appropriate maximum heights based on window size for responsive layout
  const calculateMaxHeight = () => {
    const headerHeight = 80; // Approximate header height
    const footerHeight = 60; // Approximate footer height
    const padding = 40; // General padding
    
    return height - headerHeight - footerHeight - padding;
  };
  
  const maxContentHeight = calculateMaxHeight();
  
  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredParticipants(participants);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredParticipants(participants.filter(participant => 
        participant.name.toLowerCase().includes(lowercasedSearch) ||
        participant.invoiceNumber.toLowerCase().includes(lowercasedSearch) ||
        participant.ciudad.toLowerCase().includes(lowercasedSearch) ||
        participant.vendedor.toLowerCase().includes(lowercasedSearch)
      ));
    }
  }, [searchTerm, participants]);
  
  // Heart background animation reset control
  useEffect(() => {
    if (isHeartAnimationReset) {
      // Reset animation by recreating hearts
      setIsHeartAnimationReset(false);
    }
  }, [isHeartAnimationReset]);

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const participantsData = await getParticipants();
        const prizesData = await getPrizes();
        
        if (participantsData.length > 0 && prizesData.length > 0) {
          setParticipants(participantsData);
          setFilteredParticipants(participantsData);
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

const handleWinner = (winner) => {
  const newWinner = {
    participant: winner,
    prize: selectedPrize
  };
  
  // Add winner to list
  setWinners([...winners, newWinner]);
  setCurrentWinner(newWinner);
  
  // Find the prize in the prizes array to get the updated quantity
  const prize = prizes.find(p => p.id === selectedPrize.id);
  
  // If this is the last unit of this prize, mark it as awarded
  if (!prize || prize.cantidad <= 1) {
    // Mark the prize as fully awarded
    setAwardedPrizes([...awardedPrizes, selectedPrize.id]);
  } else {
    // Reduce the quantity of this prize
    const updatedPrizes = prizes.map(p => {
      if (p.id === selectedPrize.id) {
        return { ...p, cantidad: p.cantidad - 1 };
      }
      return p;
    });
    setPrizes(updatedPrizes);
  }
  
  // Verify if there are more prizes to award
  setTimeout(() => {
    // Get available prizes (not fully awarded)
    const availablePrizes = prizes.filter(p => !awardedPrizes.includes(p.id));
    
    // Check if there are no more available prizes
    if (availablePrizes.length === 0 || 
       (availablePrizes.length === 1 && availablePrizes[0].id === selectedPrize.id && prize?.cantidad <= 1)) {
      setTimeout(() => {
        setCurrentScreen('podium');
      }, 5000); // Show the last winner for 5 seconds before podium
    } else {
      handleNextPrize();
    }
  }, 5000); // Show the winner for 5 seconds
};

// Continue with the next prize or finish
const handleNextPrize = () => {
  // Get available prizes that haven't been fully awarded
  const availablePrizes = prizes.filter(p => !awardedPrizes.includes(p.id));
  
  if (availablePrizes.length > 0) {
    // If the current selected prize still has quantity, keep it selected
    const currentPrize = availablePrizes.find(p => p.id === selectedPrize?.id);
    if (currentPrize && currentPrize.cantidad > 1) {
      setSelectedPrize(currentPrize);
    } else {
      // Otherwise, select the first available prize
      setSelectedPrize(availablePrizes[0]);
    }
    
    setCurrentWinner(null);
    if (currentScreen !== 'gaming') {
      setCurrentScreen('gaming');
    }
  } else {
    setCurrentScreen('podium');
  }
};

// Calculate if all prizes have been awarded
const allPrizesAwarded = prizes.length > 0 && 
  prizes.every(prize => awardedPrizes.includes(prize.id) || prize.cantidad <= 0);
  
  // Reiniciar todo el sorteo
  const resetSorteo = () => {
    setWinners([]);
    setAwardedPrizes([]);
    setCurrentScreen('participants');
    setSelectedPrize(prizes[0]);
    // Reset heart animations
    setIsHeartAnimationReset(true);
  };


  // Generate heart elements
  const generateHearts = () => {
    return [...Array(15)].map((_, i) => {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomDelay = Math.random() * 5;
      const randomDuration = 5 + Math.random() * 10;
      
      return (
        <div 
          key={`heart-${i}`}
          ref={el => heartRefs.current[i] = el}
          className="absolute text-2xl animate-float"
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
            animationDelay: `${randomDelay}s`,
            animationDuration: `${randomDuration}s`
          }}
        >
          ❤️
        </div>
      );
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue to-red-800 text-white overflow-hidden relative">
      {/* Logo de fondo */}
      <div className="fixed inset-0 flex items-center justify-center z-0 opacity-5 pointer-events-none">
        <img src={logoTransparente} alt="Prodispro" className="w-3/4 max-w-2xl" />
      </div>
      
      {/* Corazones flotantes */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        {generateHearts()}
      </div>
      
      {/* Header */}
      <header className="bg-red-600 p-4 border-b border-pink-300 shadow-lg relative z-10 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoTransparente} alt="Prodispro" className="h-10 md:h-12 mr-2 md:mr-3" />
            <h1 className="text-lg md:text-3xl font-bold text-white">
              <span className="mr-1 md:mr-2">❤️</span> PRODISPRO SORTEO DÍA DE LA MADRE
            </h1>
          </div>
          
          {currentScreen === 'gaming' && (
            <div className="text-white font-bold animate-pulse">
              {currentWinner ? "¡Tenemos un ganador!" : "¡Girando la ruleta!"}
            </div>
          )}
        </div>
      </header>

      {/* Content - Using flex-grow-1 to take all available space */}
      <main className="flex-grow flex items-stretch overflow-hidden relative z-10">
        {currentScreen === 'podium' ? (
          <PodiumDisplay winners={winners} onReset={resetSorteo} maxHeight={maxContentHeight} />
        ) : (
          <div className="container mx-auto p-4 flex flex-col h-full overflow-hidden">
            {/* Primera Fila - Premios (scrollable horizontalmente pero no verticalmente) */}
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-center mb-2 text-white flex items-center justify-center">
                <span className="mr-2">🎁</span> Premios del Sorteo
              </h2>
              <div className="overflow-x-auto pb-2">
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
                        
                        {/* Contador de premios si tiene cantidad */}
                        {prize.cantidad && prize.cantidad > 1 && (
                          <div className="mt-1 text-xs bg-red-800 rounded-full px-2 py-0.5 inline-block">
                            Cantidad: {prize.cantidad}
                          </div>
                        )}
                        
                        {/* Etiqueta de GANADO */}
                        {isAwarded && (
                          <div className="absolute -left-6 top-4 bg-green-500 text-white text-xs font-bold py-1 px-4 transform -rotate-45">
                            GANADO
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Segunda Fila - Ruleta o Participantes */}
            {currentScreen === 'gaming' ? (
              <div className="flex-grow overflow-hidden">
                <RouletteWheel 
                  participants={participants}
                  onWinnerSelected={handleWinner}
                  currentWinner={currentWinner}
                  allPrizesAwarded={allPrizesAwarded}
                  selectedPrize={selectedPrize}
                  maxHeight={maxContentHeight * 0.6}
                />
              </div>
            ) : (
              <div className="flex-grow overflow-hidden">
                <div className="bg-red-700/70 rounded-xl p-4 border border-pink-300 flex flex-col h-full">
                  <h2 className="text-xl font-bold text-center mb-2 text-white flex-shrink-0">
                    <span className="mr-2">🎯</span> Participantes del Sorteo
                  </h2>
                  
                  {/* Search input */}
                  <div className="mb-3 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar participante, factura, ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-red-800/60 border border-pink-300/40 rounded-full text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-200">
                        🔍
                      </div>
                    </div>
                    <div className="text-sm text-pink-200 mt-1">
                      {filteredParticipants.length} participantes encontrados
                    </div>
                  </div>
                  
                  {/* Table container with dynamic height */}
                  <div 
                    className="overflow-y-auto overflow-x-hidden flex-grow"
                    style={{ maxHeight: `${maxContentHeight * 0.5}px` }}
                  >
                    <table className="w-full border-collapse">
                      <thead className="bg-red-800 sticky top-0 z-10">
                        <tr>
                          <th className="p-2 text-left text-white">Cliente</th>
                          <th className="p-2 text-left text-white">Factura</th>
                          <th className="p-2 text-left text-white">Fecha</th>
                          <th className="p-2 text-left text-white">Vendedor</th>
                          <th className="p-2 text-left text-white">Ciudad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParticipants.map((participant, idx) => (
                          <tr 
                            key={participant.id} 
                            className={`border-b border-pink-300/10 hover:bg-red-600 transition-colors
                              ${idx % 2 === 0 ? 'bg-red-900/30' : 'bg-red-900/20'}`}
                          >
                            <td className="p-2">{participant.name}</td>
                            <td className="p-2">{participant.invoiceNumber}</td>
                            <td className="p-2">{participant.fechaFormateada}</td>
                            <td className="p-2 truncate max-w-[150px]">{participant.vendedor}</td>
                            <td className="p-2">{participant.ciudad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Start button */}
                  <div className="text-center mt-3 flex-shrink-0">
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
            <div className="mt-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-center mb-2 text-white flex items-center justify-center">
                <span className="mr-2">🏆</span> Ganadores
              </h2>
              
              {winners.length > 0 ? (
                <div className="overflow-x-auto pb-2">
                  <div className="flex space-x-4 min-w-max">
                    {winners.map((winner, index) => (
                      <div 
                        key={index}
                        className="bg-red-700 rounded-lg p-3 border border-pink-300/40 hover:border-pink-300/80 transition-all hover:-translate-y-1 duration-300 shadow-lg relative overflow-hidden w-56"
                      >
                        <div className="absolute top-0 right-0 bg-gradient-to-bl from-pink-500/30 to-transparent w-20 h-20 rounded-bl-full"></div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-lg font-bold shadow-md border-2 border-white/30">
                            {winner.participant.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="overflow-hidden flex-1">
                            <h3 className="font-bold truncate text-white">{winner.participant.name}</h3>
                            <p className="text-xs text-yellow-200 truncate">{winner.participant.invoiceNumber}</p>
                            <p className="text-xs text-yellow-200/80 truncate">{winner.participant.fechaFormateada}</p>
                            <p className="text-xs text-yellow-200/70 truncate">{winner.participant.ciudad}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 p-2 bg-red-900/70 rounded-lg border border-yellow-500/20 text-center">
                          <p className="font-bold text-yellow-200 text-sm">
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
                <div className="text-center text-white py-4 px-2 bg-red-800/50 rounded-xl border border-pink-300/40">
                  <p className="text-lg">Aún no hay ganadores</p>
                  <p className="text-sm mt-1">Los ganadores aparecerán aquí una vez iniciado el sorteo</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 bg-red-800 text-center text-white text-sm border-t border-pink-300/40 relative z-10 flex-shrink-0">
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