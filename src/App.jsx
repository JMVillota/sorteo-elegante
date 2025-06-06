// src/App.jsx
import React, { useState, useEffect } from 'react';
import { getParticipants, getPrizes } from './services/api';
import LoadingScreen from './components/LoadingScreen';
import PrizeSelectionScreen from './components/PrizeSelectionScreen';
import SorteoScreen from './components/SorteoScreen';
import WinnersScreen from './components/WinnersScreen';
import logoTransparente from './assets/logo-transparente.png';

function App() {
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('prize-selection'); // 'prize-selection', 'sorteo', 'winners'
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [completedPrizes, setCompletedPrizes] = useState([]);

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
        }
        
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Manejar selección de premio y comenzar sorteo
  const handleStartSorteo = (prize) => {
    setSelectedPrize(prize);
    setCurrentScreen('sorteo');
  };

  // Manejar finalización del sorteo de un premio
  const handleSorteoComplete = (prizeWinners) => {
    // Agregar ganadores a la lista total
    setWinners([...winners, ...prizeWinners]);
    
    // Marcar premio como completado
    setCompletedPrizes([...completedPrizes, selectedPrize.id]);
    
    // Verificar si todos los premios están completados
    const allCompleted = prizes.every(prize => 
      completedPrizes.includes(prize.id) || prize.id === selectedPrize.id
    );
    
    if (allCompleted) {
      setCurrentScreen('winners');
    } else {
      setCurrentScreen('prize-selection');
    }
    
    setSelectedPrize(null);
  };

  // Reiniciar todo el sorteo
  const handleResetSorteo = () => {
    setWinners([]);
    setCompletedPrizes([]);
    setSelectedPrize(null);
    setCurrentScreen('prize-selection');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-prodispro-black text-white">
      {/* Header */}
      <header className="bg-prodispro-gray border-b border-prodispro-blue/30 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logoTransparente} alt="Prodispro" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-prodispro-blue">PRODISPRO</h1>
                <p className="text-sm text-gray-400">Sistema de Sorteos</p>
              </div>
            </div>
            
            {currentScreen !== 'prize-selection' && (
              <button
                onClick={() => setCurrentScreen('prize-selection')}
                className="px-4 py-2 bg-prodispro-blue hover:bg-prodispro-blue/80 rounded-lg transition-colors"
              >
                Volver al Inicio
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {currentScreen === 'prize-selection' && (
          <PrizeSelectionScreen
            prizes={prizes}
            participants={participants}
            completedPrizes={completedPrizes}
            onStartSorteo={handleStartSorteo}
          />
        )}
        
        {currentScreen === 'sorteo' && (
          <SorteoScreen
            prize={selectedPrize}
            participants={participants}
            onComplete={handleSorteoComplete}
          />
        )}
        
        {currentScreen === 'winners' && (
          <WinnersScreen
            winners={winners}
            onReset={handleResetSorteo}
          />
        )}
      </main>
    </div>
  );
}

export default App;