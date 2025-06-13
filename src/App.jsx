// src/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  getParticipants, 
  getPrizes, 
  getSystemStats, 
  validateData,
  checkLocalFiles,
  preloadPrizeImages
} from './services/api';
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
  const [systemStats, setSystemStats] = useState(null);

  // Estados para el loading sincronizado
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando sistema...');

  const loadingSteps = [
    { message: 'Inicializando sistema de sorteo...', progress: 10 },
    { message: 'Verificando archivos JSON...', progress: 20 },
    { message: 'Cargando participantes...', progress: 40 },
    { message: 'Cargando premios...', progress: 60 },
    { message: 'Validando datos...', progress: 75 },
    { message: 'Precargando imágenes...', progress: 85 },
    { message: 'Calculando estadísticas...', progress: 95 },
    { message: '¡Sistema listo para sortear!', progress: 100 }
  ];

  // Función para actualizar el progreso de carga
  const updateLoadingProgress = (step, customMessage = null, customProgress = null) => {
    if (step < loadingSteps.length) {
      setLoadingStep(step);
      setLoadingProgress(customProgress || loadingSteps[step].progress);
      setLoadingMessage(customMessage || loadingSteps[step].message);
    }
  };

  // Cargar datos súper rápido desde JSON
  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      
      try {
        console.log('🚀 Iniciando carga súper rápida desde archivos JSON...');
        
        // Paso 1: Inicializar
        updateLoadingProgress(0);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Paso 2: Verificar archivos
        updateLoadingProgress(1);
        const fileCheck = await checkLocalFiles();
        
        if (!fileCheck.bothAvailable) {
          throw new Error('Faltan archivos JSON requeridos (participantes.json o premios.json)');
        }
        
        console.log('✅ Archivos JSON verificados correctamente');
        
        // Paso 3: Cargar participantes (súper rápido desde JSON)
        updateLoadingProgress(2);
        const participantsData = await getParticipants();
        
        if (participantsData.length === 0) {
          throw new Error('No se pudieron cargar los participantes');
        }
        
        setParticipants(participantsData);
        updateLoadingProgress(2, `✅ ${participantsData.length} participantes cargados`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Paso 4: Cargar premios (súper rápido desde JSON)
        updateLoadingProgress(3);
        const prizesData = await getPrizes();
        
        if (prizesData.length === 0) {
          throw new Error('No se pudieron cargar los premios');
        }
        
        setPrizes(prizesData);
        const totalUnits = prizesData.reduce((sum, prize) => sum + prize.cantidad, 0);
        updateLoadingProgress(3, `✅ ${prizesData.length} premios, ${totalUnits} unidades`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Paso 5: Validar datos
        updateLoadingProgress(4);
        const validation = await validateData();
        
        if (!validation.isValid) {
          throw new Error('Los datos cargados no son válidos');
        }
        
        console.log('✅ Datos validados correctamente');
        updateLoadingProgress(4, '✅ Datos validados correctamente');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Paso 6: Precargar imágenes (en paralelo, no bloquea)
        updateLoadingProgress(5);
        preloadPrizeImages().catch(err => 
          console.warn('⚠️ Algunas imágenes no se pudieron precargar:', err)
        );
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Paso 7: Calcular estadísticas
        updateLoadingProgress(6);
        const stats = await getSystemStats();
        setSystemStats(stats);
        
        if (stats) {
          updateLoadingProgress(6, `📊 Sistema preparado: ${stats.prizes.totalUnits} sorteos programados`);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Paso 8: Finalizar
        updateLoadingProgress(7);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log(`🎉 Sistema completamente cargado en ${totalTime}ms`);
        console.log(`📊 Resumen final:`, {
          participantes: participantsData.length,
          premios: prizesData.length,
          unidadesTotales: totalUnits,
          tiempoCarga: `${totalTime}ms`
        });
        
        // Finalizar loading
        setIsLoading(false);
        
      } catch (error) {
        console.error('💥 Error crítico cargando sistema:', error);
        
        // Mostrar error específico
        updateLoadingProgress(7, `❌ Error: ${error.message}`);
        
        // Mostrar mensaje de error por 3 segundos y luego reintentar
        setTimeout(() => {
          updateLoadingProgress(0, '🔄 Reintentando carga del sistema...');
          // Reiniciar la carga
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }, 3000);
      }
    };
    
    loadData();
  }, []);

  // Resto de las funciones del componente (sin cambios)
  const handleStartSorteo = (prize) => {
    console.log('🎯 Iniciando sorteo para premio:', prize.name);
    setSelectedPrize(prize);
    setCurrentScreen('sorteo');
  };

  const handleSorteoComplete = (prizeWinners) => {
    const actualWinners = prizeWinners.filter(winner => winner && winner.participant);
    setWinners(prev => [...prev, ...actualWinners]);
    setCompletedPrizes(prev => [...prev, selectedPrize.id]);
    setSelectedPrize(null);
    setCurrentScreen('prize-selection');
  };

  const handleResetSorteo = () => {
    console.log('🔄 Reiniciando sorteo completo');
    setWinners([]);
    setCompletedPrizes([]);
    setSelectedPrize(null);
    setCurrentScreen('prize-selection');
  };

  // Calcular totales
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

  // Mostrar la pantalla de ganadores cuando todos los premios estén sorteados
  useEffect(() => {
    if (!isLoading) {
      const totalExpectedWinners = getTotalExpectedWinners();
      const totalCurrentWinners = winners.length;

      if (
        totalExpectedWinners > 0 &&
        totalCurrentWinners >= totalExpectedWinners &&
        completedPrizes.length === prizes.length
      ) {
        setTimeout(() => {
          setCurrentScreen('winners');
        }, 800);
      }
    }
  }, [winners, completedPrizes, prizes, isLoading]);

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <LoadingScreen
        isLoading={isLoading}
        currentStep={loadingStep}
        totalSteps={loadingSteps.length}
        currentMessage={loadingMessage}
        progress={loadingProgress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      {/* Header */}
<header className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 border-b-2 border-prodispro-blue/30 shadow-xl">
  <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <img src={logoTransparente} alt="Prodispro" className="h-8 sm:h-10 md:h-12" />
        <div className="hidden sm:block">
          <p className="text-xs sm:text-sm text-gray-400">Sistema de Sorteos</p>
        </div>
      </div>
      
      {/* Información del progreso - Mejorada para móvil */}
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
        <div className="text-center">
          <div className="text-sm sm:text-lg font-bold text-prodispro-blue">
            {getCompletedPrizesCount()}/{getTotalPrizesCount()}
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">Premios</div>
        </div>
        <div className="text-center">
          <div className="text-sm sm:text-lg font-bold text-green-400">
            {getCurrentWinnersCount()}
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">Ganadores</div>
        </div>
        <div className="text-center">
          <div className="text-sm sm:text-lg font-bold text-yellow-400">
            {getTotalExpectedWinners()}
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">Total</div>
        </div>
        {currentScreen === 'sorteo' && selectedPrize && (
          <div className="text-center hidden md:block">
            <div className="text-sm font-bold text-yellow-400 truncate max-w-24">
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
          className="px-2 sm:px-4 py-1 sm:py-2 bg-prodispro-blue hover:bg-prodispro-blue/80 rounded-lg transition-colors text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Volver al Inicio</span>
          <span className="sm:hidden">🔙</span>
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
            systemStats={systemStats}
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