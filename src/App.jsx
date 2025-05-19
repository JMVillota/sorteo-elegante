import React, { useState, useEffect } from 'react';
import { getParticipants, getPrizes } from './services/api';
import LoadingScreen from './components/LoadingScreen';
import PrizeSelection from './components/PrizeSelection';
import ParticipantsList from './components/ParticipantsList';
import RouletteWheel from './components/RouletteWheel';
import WinnerDisplay from './components/WinnerDisplay';
import PodiumDisplay from './components/PodiumDisplay';

function App() {
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('participants'); // 'participants', 'roulette', 'winner', 'podium'
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
    // Verificar si el premio ya fue otorgado
    if (awardedPrizes.includes(prize.id)) {
      return; // No permitir seleccionar premios ya otorgados
    }
    
    setSelectedPrize(prize);
  };

  // Iniciar el sorteo
  const startSorteo = () => {
    // Cambiar directamente a modo ruleta
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
    
    // No cambiar la vista, solo mostrar el ganador temporalmente
    // y luego seleccionar automáticamente el siguiente premio
    setTimeout(() => {
      handleNextPrize();
    }, 5000); // Mostrar al ganador por 5 segundos
  };

  // Continuar con el siguiente premio o finalizar
  const handleNextPrize = () => {
    // Verificar si quedan premios por sortear
    const availablePrizes = prizes.filter(p => !awardedPrizes.includes(p.id));
    
    if (availablePrizes.length > 0) {
      // Seleccionar el siguiente premio disponible automáticamente
      setSelectedPrize(availablePrizes[0]);
    } else {
      // Todos los premios fueron sorteados, mostrar pantalla final
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-primary-dark text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-primary-dark/50 p-4 border-b border-accent/30 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink">
            PRODISPRO SORTEOS
          </h1>
          {currentScreen === 'gaming' && (
            <div className="text-sm md:text-base text-accent animate-pulse">
              {currentWinner ? "¡Tenemos un ganador!" : "¡Girando la ruleta!"}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      {currentScreen === 'podium' ? (
        <PodiumDisplay winners={winners} onReset={resetSorteo} />
      ) : currentScreen === 'participants' ? (
        <main className="container mx-auto p-4 flex flex-col md:flex-row md:gap-6">
          {/* Premios (columna izquierda) */}
          <div className="md:w-1/4 mb-6 md:mb-0">
            <PrizeSelection 
              prizes={prizes} 
              selectedPrize={selectedPrize}
              onSelectPrize={handleSelectPrize}
              awardedPrizes={awardedPrizes}
            />
          </div>

          {/* Lista de participantes (columna central) */}
          <div className="md:w-3/4 flex flex-col items-center justify-center">
            <ParticipantsList 
              participants={participants}
              onStartRoulette={startSorteo}
              selectedPrize={selectedPrize}
            />
          </div>
        </main>
      ) : (
        <main className="container mx-auto p-4 flex flex-col md:flex-row md:gap-6">
          {/* Premios (columna izquierda) */}
          <div className="md:w-1/4 mb-6 md:mb-0">
            <PrizeSelection 
              prizes={prizes} 
              selectedPrize={selectedPrize}
              onSelectPrize={handleSelectPrize}
              awardedPrizes={awardedPrizes}
            />
          </div>

          {/* Área de juego (columna central) */}
          <div className="md:w-2/4 flex flex-col items-center justify-center">
            <RouletteWheel 
              participants={participants}
              onWinnerSelected={handleWinner}
              currentWinner={currentWinner}
            />
          </div>
          
          {/* Ganadores anteriores (columna derecha) */}
          <div className="md:w-1/4 mt-6 md:mt-0">
            <div className="h-full">
              <h2 className="text-center text-xl font-bold text-accent mb-4">
                Ganadores
              </h2>
              
              <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
                {winners.length > 0 ? (
                  winners.map((winner, index) => (
                    <div 
                      key={index}
                      className="bg-secondary-purple/50 rounded-lg p-3 border border-accent/20 hover:border-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue to-pink flex items-center justify-center text-sm font-bold">
                          {winner.participant.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="overflow-hidden">
                          <h3 className="font-bold truncate">{winner.participant.name}</h3>
                          <p className="text-xs text-accent/90 truncate">#{winner.participant.ticketNumber}</p>
                          <p className="text-xs text-gray-300 truncate">{winner.prize.name}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 italic p-4">
                    Aún no hay ganadores
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;