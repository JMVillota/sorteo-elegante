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
import ZoneSelectionScreen from './components/ZoneSelectionScreen';
import SorteoScreen from './components/SorteoScreen';
import WinnersScreen from './components/WinnersScreen';
import logoProdispro from './assets/logo-prodispro.svg';

function App() {
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('prize-selection');
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [selectedZoneParticipants, setSelectedZoneParticipants] = useState(null);
  const [selectedZoneName, setSelectedZoneName] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(1);
  const [accumulatedWinners, setAccumulatedWinners] = useState([]);
  const [accumulatedLosers, setAccumulatedLosers] = useState([]);  // eliminados entre unidades
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
    console.log('🎯 Premio seleccionado, eligiendo zona para unidad 1:', prize.name);
    setSelectedPrize(prize);
    setCurrentUnit(1);
    setAccumulatedWinners([]);
    setCurrentScreen('zone-selection');
  };

  const handleZoneConfirm = (zoneParticipants, zoneName) => {
    console.log(`🗺️ Zona "${zoneName}" seleccionada — unidad ${currentUnit}`);
    setSelectedZoneParticipants(zoneParticipants);
    setSelectedZoneName(zoneName);
    setCurrentScreen('sorteo');
  };

  const handleZoneBack = () => {
    setSelectedZoneParticipants(null);
    setSelectedZoneName(null);
    setCurrentUnit(1);
    setAccumulatedWinners([]);
    setAccumulatedLosers([]);
    setCurrentScreen('prize-selection');
  };

  // Se llama cuando termina UNA unidad (winner + losers de esa unidad)
  const handleUnitComplete = (unitWinner, unitLosers = []) => {
    const newAccumulatedWinners = [...accumulatedWinners, unitWinner];
    const newAccumulatedLosers  = [...accumulatedLosers, ...unitLosers];
    setAccumulatedWinners(newAccumulatedWinners);
    setAccumulatedLosers(newAccumulatedLosers);

    const nextUnit = currentUnit + 1;

    if (nextUnit > selectedPrize.cantidad) {
      setWinners(prev => [...prev, ...newAccumulatedWinners]);
      setCompletedPrizes(prev => [...prev, selectedPrize.id]);
      setSelectedPrize(null);
      setSelectedZoneParticipants(null);
      setSelectedZoneName(null);
      setCurrentUnit(1);
      setAccumulatedWinners([]);
      setAccumulatedLosers([]);
      setCurrentScreen('prize-selection');
    } else {
      setCurrentUnit(nextUnit);
      setSelectedZoneParticipants(null);
      setSelectedZoneName(null);
      setCurrentScreen('zone-selection');
    }
  };

  const handleResetSorteo = () => {
    console.log('🔄 Reiniciando sorteo completo');
    setWinners([]);
    setCompletedPrizes([]);
    setSelectedPrize(null);
    setSelectedZoneParticipants(null);
    setSelectedZoneName(null);
    setCurrentUnit(1);
    setAccumulatedWinners([]);
    setAccumulatedLosers([]);
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden">
      {/* Header — oculto en pantalla de sorteo para maximizar espacio */}
<header className={`flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-b border-white/[0.06] ${currentScreen === 'sorteo' ? 'hidden' : ''}`}>
  <div className="px-4 py-2 flex items-center gap-4">
    {/* Logo */}
    <img src={logoProdispro} alt="Prodispro" className="h-9 flex-shrink-0" />

    {/* Separador */}
    <div className="h-6 w-px bg-white/10 flex-shrink-0" />

    {/* Pill de progreso */}
    <div className="flex items-center gap-3 text-xs">
      <span className="header-pill header-pill--blue">
        Premios&nbsp;<strong>{getCompletedPrizesCount()}/{getTotalPrizesCount()}</strong>
      </span>
      <span className="header-pill header-pill--green">
        Ganadores&nbsp;<strong>{getCurrentWinnersCount()}</strong>
      </span>
      <span className="header-pill header-pill--amber">
        Total&nbsp;<strong>{getTotalExpectedWinners()}</strong>
      </span>
      {currentScreen === 'sorteo' && selectedPrize && (
        <span className="header-pill header-pill--purple hidden md:flex truncate max-w-40">
          {selectedPrize.name}
        </span>
      )}
      {currentScreen === 'sorteo' && selectedZoneName && (
        <span className="header-pill header-pill--cyan hidden lg:flex truncate max-w-40">
          {selectedZoneName}
        </span>
      )}
    </div>

    {/* Botón volver */}
    {currentScreen !== 'prize-selection' && currentScreen !== 'winners' && (
      <button
        onClick={() => {
          setSelectedZoneParticipants(null);
          setSelectedZoneName(null);
          setCurrentScreen('prize-selection');
        }}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors border border-white/10"
      >
        ← Inicio
      </button>
    )}
  </div>
</header>

      {/* Content — ocupa todo el espacio restante sin scroll de página */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className={`h-full ${currentScreen === 'sorteo' ? 'p-2' : 'container mx-auto px-3 py-3'}`}>
        {currentScreen === 'prize-selection' && (
          <PrizeSelectionScreen
            prizes={prizes}
            participants={participants}
            completedPrizes={completedPrizes}
            onStartSorteo={handleStartSorteo}
            systemStats={systemStats}
          />
        )}

        {currentScreen === 'zone-selection' && selectedPrize && (
          <ZoneSelectionScreen
            prize={selectedPrize}
            participants={participants}
            currentUnit={currentUnit}
            onConfirm={handleZoneConfirm}
            onBack={handleZoneBack}
          />
        )}

        {currentScreen === 'sorteo' && selectedPrize && selectedZoneParticipants && (
          <SorteoScreen
            prize={selectedPrize}
            participants={selectedZoneParticipants}
            zoneName={selectedZoneName}
            currentUnit={currentUnit}
            onUnitComplete={handleUnitComplete}
            previousWinners={accumulatedWinners}
            previousLosers={accumulatedLosers}
            onBack={() => {
              setSelectedZoneParticipants(null);
              setSelectedZoneName(null);
              setCurrentUnit(1);
              setAccumulatedWinners([]);
              setAccumulatedLosers([]);
              setCurrentScreen('prize-selection');
            }}
          />
        )}
        
        {currentScreen === 'winners' && (
          <WinnersScreen
            winners={winners}
            prizes={prizes}
            onReset={handleResetSorteo}
          />
        )}
        </div>
      </main>
    </div>
  );
}

export default App;