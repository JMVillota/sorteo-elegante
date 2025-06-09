// src/components/SorteoScreen.jsx
import React, { useState, useEffect } from 'react';
import RouletteWheel from './RouletteWheel';

const SorteoScreen = ({ prize, participants, onComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinners, setRoundWinners] = useState([]);
  const [roundLosers, setRoundLosers] = useState([]);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Calcular total de rondas (2 perdedores + 1 ganador por cada unidad del premio)
  const totalRounds = prize.cantidad * 3;
  const isWinnerRound = currentRound % 3 === 0; // Cada tercera ronda es ganador

  // CORREGIDO: Verificar finalización basada en ganadores REALES
  useEffect(() => {
    console.log(`🎯 SorteoScreen - Estado actual:`, {
      currentRound,
      totalRounds,
      roundWinners: roundWinners.length,
      roundLosers: roundLosers.length,
      expectedWinners: prize.cantidad
    });

    // SOLO terminar cuando tengamos la cantidad exacta de ganadores esperados
    if (roundWinners.length >= prize.cantidad && currentRound > totalRounds) {
      console.log(`✅ Sorteo completado para ${prize.name}`);
      console.log(`🏆 Enviando ${roundWinners.length} ganadores reales`);
      
      // Enviar SOLO los ganadores reales
      onComplete(roundWinners);
      return;
    }
  }, [currentRound, totalRounds, roundWinners, roundLosers, prize.cantidad, prize.name, onComplete]);

  const handleRoundComplete = (selectedParticipant) => {
    console.log(`🎲 Ronda ${currentRound} completada:`, {
      participant: selectedParticipant.name,
      isWinnerRound,
      expectedUnit: Math.ceil(currentRound / 3)
    });

    setCurrentWinner(selectedParticipant);
    setShowResult(true);
    
    if (isWinnerRound) {
      const newWinner = {
        participant: selectedParticipant,
        prize: prize,
        round: currentRound,
        unit: Math.ceil(currentRound / 3)
      };
      
      console.log(`🏆 GANADOR agregado:`, newWinner);
      setRoundWinners([...roundWinners, newWinner]);
    } else {
      const newLoser = {
        participant: selectedParticipant,
        round: currentRound
      };
      
      console.log(`❌ Perdedor agregado:`, newLoser);
      setRoundLosers([...roundLosers, newLoser]);
    }

    // Mostrar resultado por 3 segundos y continuar
    setTimeout(() => {
      setShowResult(false);
      setCurrentWinner(null);
      setCurrentRound(currentRound + 1);
      setIsRoundActive(false);
    }, 3000);
  };

  const startRound = () => {
    console.log(`🎯 Iniciando ronda ${currentRound} (${isWinnerRound ? 'GANADOR' : 'PERDEDOR'})`);
    setIsRoundActive(true);
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

  const getCurrentUnit = () => Math.ceil(currentRound / 3);
  const getRoundInUnit = () => ((currentRound - 1) % 3) + 1;

  return (
    <div className="w-full min-h-screen bg-prodispro-black overflow-hidden">
      {/* Layout para pantallas grandes (2XL) */}
      <div className="hidden 2xl:flex flex-col h-screen">
        {/* Header del Sorteo - Fijo arriba */}
        <div className="bg-prodispro-gray p-8 border-b border-prodispro-blue/30 flex-shrink-0">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20">
                {getPrizeImage(prize) ? (
                  <img 
                    src={getPrizeImage(prize)} 
                    alt={prize.name}
                    className="w-full h-full object-cover rounded-xl border-2 border-prodispro-blue"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-prodispro-light-gray rounded-xl border-2 border-prodispro-blue">
                    {getPrizeIcon(prize.name)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-prodispro-blue">{prize.name}</h1>
                <p className="text-xl text-gray-300">
                  Unidad {getCurrentUnit()} de {prize.cantidad} • 
                  Ronda {getRoundInUnit()} de 3 • 
                  {isWinnerRound ? 'GANADOR' : 'PERDEDOR'}
                </p>
                {/* INFORMACIÓN DE DEBUG */}
                <p className="text-sm text-gray-500">
                  Ganadores: {roundWinners.length}/{prize.cantidad} • 
                  Perdedores: {roundLosers.length}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-6xl font-bold text-prodispro-blue">
                {currentRound}/{totalRounds}
              </div>
              <div className="text-lg text-gray-400">Rondas completadas</div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-6 max-w-screen-2xl mx-auto">
            <div className="w-full bg-prodispro-light-gray rounded-full h-4">
              <div 
                className="bg-prodispro-blue h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Indicador del tipo de ronda */}
        <div className="text-center py-6 bg-prodispro-gray/50 flex-shrink-0">
          <div className={`inline-block px-12 py-4 rounded-full font-bold text-2xl ${
            isWinnerRound 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {isWinnerRound ? '🏆 RONDA GANADORA' : '❌ RONDA PERDEDORA'}
          </div>
          <p className="text-gray-300 mt-3 text-lg">
            {isWinnerRound 
              ? 'El siguiente participante ganará el premio' 
              : 'El siguiente participante no ganará (pero participa)'}
          </p>
        </div>

        {/* Contenido principal en 3 columnas CON SCROLL CORREGIDO */}
        <div className="flex-1 grid grid-cols-3 gap-8 p-8 max-w-screen-2xl mx-auto w-full min-h-0">
          
          {/* Columna 1 - Máquina tragamonedas (SIN SCROLL) */}
          <div className="col-span-1 bg-prodispro-gray rounded-2xl p-8 flex flex-col justify-center">
            <RouletteWheel
              participants={participants}
              onWinnerSelected={handleRoundComplete}
              isActive={isRoundActive}
              onStart={startRound}
              showResult={showResult}
              currentWinner={currentWinner}
              isWinnerRound={isWinnerRound}
            />
          </div>

          {/* Columna 2 - Perdedores CON SCROLL VERTICAL */}
          <div className="col-span-1 bg-prodispro-gray rounded-2xl p-8 flex flex-col min-h-0">
            <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center flex-shrink-0">
              ❌ PERDEDORES ({roundLosers.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              <div className="space-y-4">
                {roundLosers.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl">Aún no hay perdedores</p>
                    <p className="text-lg">Los perdedores aparecerán aquí</p>
                  </div>
                ) : (
                  roundLosers.map((loser, index) => (
                    <div key={index} className="p-6 bg-yellow-600/10 border border-yellow-600/30 rounded-xl flex-shrink-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-lg font-bold">
                          {loser.participant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xl truncate">{loser.participant.name}</h4>
                          <p className="text-gray-300 text-sm">
                            {loser.participant.invoiceNumber} • Ronda {loser.round}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {loser.participant.ciudad} • {loser.participant.fechaFormateada}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Vendedor: {loser.participant.vendedor || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Columna 3 - Ganadores CON SCROLL VERTICAL */}
          <div className="col-span-1 bg-prodispro-gray rounded-2xl p-8 flex flex-col min-h-0">
            <h3 className="text-3xl font-bold text-green-400 mb-6 text-center flex-shrink-0">
              🏆 GANADORES ({roundWinners.length}/{prize.cantidad})
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              <div className="space-y-4">
                {roundWinners.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-xl">Aún no hay ganadores</p>
                    <p className="text-lg">Los ganadores aparecerán aquí</p>
                  </div>
                ) : (
                  roundWinners.map((winner, index) => (
                    <div key={index} className="p-6 bg-green-600/10 border border-green-600/30 rounded-xl relative overflow-hidden flex-shrink-0">
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-lg font-bold">
                          {winner.participant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xl truncate">{winner.participant.name}</h4>
                          <p className="text-gray-300 text-sm">
                            {winner.participant.invoiceNumber} • Unidad {winner.unit}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {winner.participant.ciudad} • {winner.participant.fechaFormateada}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Vendedor: {winner.participant.vendedor || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 animate-pulse"></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout original para pantallas normales - MISMO CÓDIGO PERO CON LOS COUNTERS CORREGIDOS */}
      <div className="2xl:hidden">
        {/* Header del Sorteo */}
        <div className="w-full bg-prodispro-gray p-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16">
                  {getPrizeImage(prize) ? (
                    <img 
                      src={getPrizeImage(prize)} 
                      alt={prize.name}
                      className="w-full h-full object-cover rounded-xl border border-prodispro-blue"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-prodispro-light-gray rounded-xl border border-prodispro-blue">
                      {getPrizeIcon(prize.name)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-prodispro-blue">{prize.name}</h1>
                  <p className="text-gray-400">
                    Unidad {getCurrentUnit()} de {prize.cantidad} • 
                    Ronda {getRoundInUnit()} de 3 • 
                    {isWinnerRound ? 'GANADOR' : 'PERDEDOR'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ganadores: {roundWinners.length}/{prize.cantidad}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-prodispro-blue">
                  {currentRound}/{totalRounds}
                </div>
                <div className="text-sm text-gray-400">Rondas completadas</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-prodispro-light-gray rounded-full h-3">
                <div 
                  className="bg-prodispro-blue h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador del tipo de ronda */}
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg ${
            isWinnerRound 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {isWinnerRound ? '🏆 RONDA GANADORA' : '❌ RONDA PERDEDORA'}
          </div>
          <p className="text-gray-400 mt-2">
            {isWinnerRound 
              ? 'El siguiente participante ganará el premio' 
              : 'El siguiente participante no ganará (pero participa)'}
          </p>
        </div>

        {/* Layout en 2 columnas para pantallas normales */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna 1 - Máquina tragamonedas */}
          <div className="bg-prodispro-gray rounded-xl p-6">
            <RouletteWheel
              participants={participants}
              onWinnerSelected={handleRoundComplete}
              isActive={isRoundActive}
              onStart={startRound}
              showResult={showResult}
              currentWinner={currentWinner}
              isWinnerRound={isWinnerRound}
            />
          </div>

          {/* Columna 2 - Ganadores y Perdedores CON SCROLL HORIZONTAL EN MÓVIL */}
          <div className="space-y-6">
            {/* Ganadores CON SCROLL */}
            <div className="bg-prodispro-gray rounded-xl p-6 flex flex-col">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex-shrink-0">
                🏆 Ganadores ({roundWinners.length}/{prize.cantidad})
              </h3>
              
              <div className="overflow-auto custom-scrollbar">
                <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 pb-2 lg:pb-0">
                  {roundWinners.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 min-w-[200px] lg:min-w-0">
                      <p>Aún no hay ganadores</p>
                      <p className="text-sm">Los ganadores aparecerán aquí</p>
                    </div>
                  ) : (
                    roundWinners.map((winner, index) => (
                      <div key={index} className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg flex-shrink-0 min-w-[280px] lg:min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {winner.participant.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{winner.participant.name}</h4>
                            <p className="text-sm text-gray-400 truncate">
                              {winner.participant.invoiceNumber} • Unidad {winner.unit}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {winner.participant.ciudad} • {winner.participant.fechaFormateada}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Vendedor: {winner.participant.vendedor || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Perdedores CON SCROLL */}
            <div className="bg-prodispro-gray rounded-xl p-6 flex flex-col">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex-shrink-0">
                ❌ Perdedores ({roundLosers.length})
             </h3>
             
             <div className="overflow-auto custom-scrollbar">
               <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 pb-2 lg:pb-0">
                 {roundLosers.length === 0 ? (
                   <div className="text-center text-gray-500 py-8 min-w-[200px] lg:min-w-0">
                     <p>Aún no hay perdedores</p>
                     <p className="text-sm">Los perdedores aparecerán aquí</p>
                   </div>
                 ) : (
                   roundLosers.map((loser, index) => (
                     <div key={index} className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg flex-shrink-0 min-w-[280px] lg:min-w-0">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">
                           {loser.participant.name.charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-medium truncate">{loser.participant.name}</h4>
                           <p className="text-sm text-gray-400 truncate">
                             {loser.participant.invoiceNumber} • Ronda {loser.round}
                           </p>
                           <p className="text-xs text-gray-500 truncate">
                             {loser.participant.ciudad} • {loser.participant.fechaFormateada}
                           </p>
                           <p className="text-xs text-gray-500 truncate">
                             Vendedor: {loser.participant.vendedor || 'N/A'}
                           </p>
                         </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* ESTILOS PARA SCROLLBAR PERSONALIZADO */}
     <style>{`
       .custom-scrollbar {
         scrollbar-width: thin;
         scrollbar-color: #019BDC #333333;
       }
       
       .custom-scrollbar::-webkit-scrollbar {
         width: 8px;
         height: 8px;
       }
       
       .custom-scrollbar::-webkit-scrollbar-track {
         background: #333333;
         border-radius: 4px;
       }
       
       .custom-scrollbar::-webkit-scrollbar-thumb {
         background: #019BDC;
         border-radius: 4px;
       }
       
       .custom-scrollbar::-webkit-scrollbar-thumb:hover {
         background: rgba(1, 155, 220, 0.8);
       }
       
       .custom-scrollbar::-webkit-scrollbar-corner {
         background: #333333;
       }
     `}</style>
   </div>
 );
};

export default SorteoScreen;