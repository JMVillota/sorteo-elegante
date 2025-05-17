import React, { useState, useEffect } from 'react';
import { getParticipants, getPrizes } from './services/api';
import LoadingScreen from './components/LoadingScreen';
import PrizeSelection from './components/PrizeSelection';
import ParticipantsList from './components/ParticipantsList';
import RouletteWheel from './components/RouletteWheel';
import WinnerDisplay from './components/WinnerDisplay';
import PreviousWinners from './components/PreviousWinners';

function App() {
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('participants'); // 'participants', 'roulette', 'winner'
  const [currentWinner, setCurrentWinner] = useState(null);

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
        }, 500);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Manejar selección de premio
  const handleSelectPrize = (prize) => {
    setSelectedPrize(prize);
  };

  // Iniciar el sorteo
  const startRoulette = () => {
    setCurrentScreen('roulette');
  };

  // Manejar ganador
  const handleWinner = (winner) => {
    const newWinner = {
      participant: winner,
      prize: selectedPrize
    };
    
    setWinners([...winners, newWinner]);
    setCurrentWinner(newWinner);
    setCurrentScreen('winner');
  };

  // Continuar con el siguiente premio
  const handleNextPrize = () => {
    const currentIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const nextIndex = (currentIndex + 1) % prizes.length;
    
    setSelectedPrize(prizes[nextIndex]);
    setCurrentScreen('participants');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-primary-dark text-white">
      {/* Header */}
      <header className="bg-primary-dark/50 p-4 border-b border-accent/30 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink">
            PRODISPRO CASINO
          </h1>
          {currentScreen === 'roulette' && (
            <div className="text-sm md:text-base animate-pulse">
              ¡Girando la ruleta!
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto p-4 flex flex-col md:flex-row md:gap-6">
        {/* Premios (columna izquierda) */}
        <div className="md:w-1/4 mb-6 md:mb-0">
          <PrizeSelection 
            prizes={prizes} 
            selectedPrize={selectedPrize}
            onSelectPrize={handleSelectPrize}
          />
        </div>

        {/* Área principal (columna central) */}
        <div className="md:w-2/4 flex flex-col items-center justify-center">
          {currentScreen === 'participants' && (
            <ParticipantsList 
              participants={participants}
              onStartRoulette={startRoulette}
              selectedPrize={selectedPrize}
            />
          )}
          
          {currentScreen === 'roulette' && (
            <RouletteWheel 
              participants={participants}
              onWinnerSelected={handleWinner}
            />
          )}
          
          {currentScreen === 'winner' && currentWinner && (
            <WinnerDisplay 
              winner={currentWinner}
              onNextPrize={handleNextPrize}
            />
          )}
        </div>

        {/* Ganadores anteriores (columna derecha) */}
        <div className="md:w-1/4 mt-6 md:mt-0">
          <PreviousWinners winners={winners} />
        </div>
      </main>
    </div>
  );
}

export default App;