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
  const [currentScreen, setCurrentScreen] = useState('prize-selection');
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
    console.log('🎯 Iniciando sorteo para premio:', prize.name);
    setSelectedPrize(prize);
    setCurrentScreen('sorteo');
  };

  // CORREGIDO: Manejar finalización del sorteo de un premio
  const handleSorteoComplete = (prizeWinners) => {
    // Agregar SOLO los ganadores reales (no perdedores) a la lista total
    const actualWinners = prizeWinners.filter(winner => winner && winner.participant);

    setWinners(prev => [...prev, ...actualWinners]);
    setCompletedPrizes(prev => [...prev, selectedPrize.id]);
    setSelectedPrize(null);
    setCurrentScreen('prize-selection'); // SIEMPRE volver a selección de premios
  };

  // Reiniciar todo el sorteo
  const handleResetSorteo = () => {
    console.log('🔄 Reiniciando sorteo completo');
    setWinners([]);
    setCompletedPrizes([]);
    setSelectedPrize(null);
    setCurrentScreen('prize-selection');
  };

  // CALCULAR TOTALES CORRECTOS
  const getTotalExpectedWinners = () => {
    return prizes.reduce((total, prize) => total + prize.cantidad, 0);
  };

  const getCurrentWinnersCount = () => {
    return winners.length;
  };

  const getCompletedPrizesCount = () => {
    return completedPrizes.length;
  };

  const getTotalPrizesCount = () => {
    return prizes.length;
  };

  // Debug: Log del estado actual cuando cambia
  useEffect(() => {
    console.log('📊 Estado actual de la aplicación:', {
      currentScreen,
      totalPrizes: getTotalPrizesCount(),
      prizesIds: prizes.map(p => ({ id: p.id, name: p.name, cantidad: p.cantidad })),
      completedPrizes: getCompletedPrizesCount(),
      completedPrizesIds: completedPrizes,
      totalWinners: getCurrentWinnersCount(),
      expectedWinners: getTotalExpectedWinners(),
      winnersDetails: winners.map(w => ({ 
        name: w.participant?.name, 
        prize: w.prize?.name,
        prizeId: w.prize?.id 
      })),
      selectedPrize: selectedPrize ? { id: selectedPrize.id, name: selectedPrize.name } : null
    });
  }, [currentScreen, prizes, completedPrizes, winners, selectedPrize]);

  // ADICIONAL: Verificar integridad de datos cuando se cargan los premios
  useEffect(() => {
    if (prizes.length > 0) {
      console.log('🎁 Premios cargados:', prizes.map(p => ({
        id: p.id,
        name: p.name,
        cantidad: p.cantidad
      })));
      console.log('🎯 Total de premios diferentes:', prizes.length);
      console.log('🏆 Total de ganadores esperados:', getTotalExpectedWinners());
    }
  }, [prizes]);

  // Nuevo efecto para mostrar la pantalla de ganadores SOLO cuando todos los premios estén sorteados
  useEffect(() => {
    const totalExpectedWinners = getTotalExpectedWinners();
    const totalCurrentWinners = winners.length;

    // Verifica que se hayan sorteado todas las unidades de todos los premios
    if (
      totalExpectedWinners > 0 &&
      totalCurrentWinners >= totalExpectedWinners &&
      completedPrizes.length === prizes.length
    ) {
      setTimeout(() => {
        setCurrentScreen('winners');
      }, 800);
    }
  }, [winners, completedPrizes, prizes]);

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
            
            {/* Información del progreso CORREGIDA */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-prodispro-blue">
                  {getCompletedPrizesCount()}/{getTotalPrizesCount()}
                </div>
                <div className="text-xs text-gray-400">Premios Completados</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  {getCurrentWinnersCount()}
                </div>
                <div className="text-xs text-gray-400">Ganadores Actuales</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {getTotalExpectedWinners()}
                </div>
                <div className="text-xs text-gray-400">Total Esperado</div>
              </div>
              {/* Mostrar premio actual si está en sorteo */}
              {currentScreen === 'sorteo' && selectedPrize && (
                <div className="text-center">
                  <div className="text-sm font-bold text-yellow-400">
                    {selectedPrize.name}
                  </div>
                  <div className="text-xs text-gray-400">Premio Actual</div>
                </div>
              )}
            </div>
            
            {currentScreen !== 'prize-selection' && currentScreen !== 'winners' && (
              <button
                onClick={() => {
                  console.log('🔙 Volviendo a selección de premios');
                  setCurrentScreen('prize-selection');
                }}
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
        
        {currentScreen === 'sorteo' && selectedPrize && (
          <SorteoScreen
            prize={selectedPrize}
            participants={participants}
            onComplete={handleSorteoComplete}
          />
        )}
        
        {currentScreen === 'winners' && (
          <WinnersScreen
            winners={winners}
            prizes={prizes}
            onReset={handleResetSorteo}
          />
        )}
      </main>
    </div>
  );
}

export default App;