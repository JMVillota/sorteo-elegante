// src/components/WinnersScreen.jsx
import React from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';

const WinnersScreen = ({ winners, onReset }) => {
  const { width, height } = useWindowSize();

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

  // Agrupar ganadores por premio
  const groupedWinners = winners.reduce((acc, winner) => {
    const prizeId = winner.prize.id;
    if (!acc[prizeId]) {
      acc[prizeId] = {
        prize: winner.prize,
        winners: []
      };
    }
    acc[prizeId].winners.push(winner);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-prodispro-black relative">
      {/* Confeti de celebración */}
      <Confetti
        width={width}
        height={height}
        numberOfPieces={150}
        recycle={true}
        colors={['#019BDC', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#F97316']}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-prodispro-blue to-green-400 mb-4">
            🎉 ¡Sorteo Completado! 🎉
          </h1>
          <p className="text-xl text-gray-300">
            Felicitaciones a todos los ganadores del sorteo PRODISPRO 2025
          </p>
          <div className="mt-6">
            <button
              onClick={onReset}
              className="px-8 py-3 bg-prodispro-blue hover:bg-prodispro-blue/80 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
            >
              🔄 Nuevo Sorteo
            </button>
          </div>
        </div>

        {/* Lista de ganadores por premio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {Object.values(groupedWinners).map((group, groupIndex) => (
            <div 
              key={groupIndex}
              className="bg-prodispro-gray rounded-2xl p-6 border-2 border-green-500/30 relative overflow-hidden"
            >
              {/* Efecto de brillo para premios */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 animate-pulse"></div>
              
              <div className="relative z-10">
                {/* Header del premio */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16">
                    {getPrizeImage(group.prize) ? (
                      <img 
                        src={getPrizeImage(group.prize)} 
                        alt={group.prize.name}
                        className="w-full h-full object-cover rounded-xl border border-green-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-prodispro-light-gray rounded-xl border border-green-500">
                        {getPrizeIcon(group.prize.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-400">{group.prize.name}</h2>
                    <p className="text-gray-400">
                      {group.winners.length} ganador{groupes}
                   </p>
                 </div>
               </div>

               {/* Lista de ganadores del premio */}
               <div className="space-y-4">
                 {group.winners.map((winner, index) => (
                   <div 
                     key={index}
                     className="p-4 bg-green-600/10 border border-green-600/30 rounded-xl hover:bg-green-600/20 transition-all duration-300"
                   >
                     <div className="flex items-center space-x-3">
                       <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                         {winner.participant.name.charAt(0)}
                       </div>
                       <div className="flex-1">
                         <h3 className="font-bold text-white text-lg">
                           {winner.participant.name}
                         </h3>
                         <p className="text-green-300 text-sm">
                           📄 {winner.participant.invoiceNumber} • Unidad {winner.unit}
                         </p>
                         <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                           <span>📍 {winner.participant.ciudad}</span>
                           <span>📅 {winner.participant.fechaFormateada}</span>
                           {/* VENDEDOR AGREGADO */}
                           <span>👤 {winner.participant.vendedor || 'N/A'}</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl">🏆</div>
                         <div className="text-xs text-green-400 font-bold">
                           GANADOR
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         ))}
       </div>

       {/* Resumen del sorteo */}
       <div className="mt-12 bg-prodispro-gray rounded-2xl p-8">
         <h2 className="text-3xl font-bold text-center mb-8 text-prodispro-blue">
           📊 Resumen del Sorteo
         </h2>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Total de ganadores */}
           <div className="text-center p-6 bg-green-600/10 border border-green-600/30 rounded-xl">
             <div className="text-4xl mb-2">🏆</div>
             <div className="text-3xl font-bold text-green-400">
               {winners.length}
             </div>
             <div className="text-gray-400">
               Total Ganadores
             </div>
           </div>

           {/* Total de premios */}
           <div className="text-center p-6 bg-prodispro-blue/10 border border-prodispro-blue/30 rounded-xl">
             <div className="text-4xl mb-2">🎁</div>
             <div className="text-3xl font-bold text-prodispro-blue">
               {Object.keys(groupedWinners).length}
             </div>
             <div className="text-gray-400">
               Premios Entregados
             </div>
           </div>

           {/* Fecha del sorteo */}
           <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
             <div className="text-4xl mb-2">📅</div>
             <div className="text-lg font-bold text-yellow-400">
               {new Date().toLocaleDateString('es-ES', {
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric'
               })}
             </div>
             <div className="text-gray-400">
               Fecha del Sorteo
             </div>
           </div>
         </div>
       </div>

       {/* Lista detallada de todos los ganadores */}
       <div className="mt-12 bg-prodispro-gray rounded-2xl p-8">
         <h2 className="text-2xl font-bold text-center mb-8 text-prodispro-blue">
           🎯 Lista Completa de Ganadores
         </h2>
         
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b border-prodispro-blue/30">
                 <th className="text-left py-3 px-4 text-prodispro-blue">#</th>
                 <th className="text-left py-3 px-4 text-prodispro-blue">Ganador</th>
                 <th className="text-left py-3 px-4 text-prodispro-blue">Factura</th>
                 <th className="text-left py-3 px-4 text-prodispro-blue">Premio</th>
                 <th className="text-left py-3 px-4 text-prodispro-blue">Ciudad</th>
                 <th className="text-left py-3 px-4 text-prodispro-blue">Vendedor</th>
               </tr>
             </thead>
             <tbody>
               {winners.map((winner, index) => (
                 <tr 
                   key={index}
                   className="border-b border-gray-700 hover:bg-green-500/5 transition-colors"
                 >
                   <td className="py-3 px-4 text-green-400 font-bold">
                     {index + 1}
                   </td>
                   <td className="py-3 px-4">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                         {winner.participant.name.charAt(0)}
                       </div>
                       <span className="font-medium text-white">
                         {winner.participant.name}
                       </span>
                     </div>
                   </td>
                   <td className="py-3 px-4 text-gray-300">
                     {winner.participant.invoiceNumber}
                   </td>
                   <td className="py-3 px-4">
                     <div className="flex items-center space-x-2">
                       <span className="text-2xl">
                         {getPrizeIcon(winner.prize.name)}
                       </span>
                       <div>
                         <div className="text-white font-medium">
                           {winner.prize.name}
                         </div>
                         <div className="text-xs text-gray-400">
                           Unidad {winner.unit}
                         </div>
                       </div>
                     </div>
                   </td>
                   <td className="py-3 px-4 text-gray-300">
                     {winner.participant.ciudad}
                   </td>
                   {/* VENDEDOR AGREGADO EN LA TABLA */}
                   <td className="py-3 px-4 text-gray-300">
                     {winner.participant.vendedor || 'N/A'}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>

       {/* Footer con botón de nuevo sorteo */}
       <div className="text-center mt-12">
         <div className="inline-block p-8 bg-prodispro-gray rounded-2xl border border-prodispro-blue/30">
           <div className="text-6xl mb-4">🎊</div>
           <h3 className="text-2xl font-bold text-prodispro-blue mb-4">
             ¡Gracias por participar!
           </h3>
           <p className="text-gray-400 mb-6">
             El sorteo PRODISPRO 2025 ha concluido exitosamente
           </p>
           <button
             onClick={onReset}
             className="px-8 py-4 bg-gradient-to-r from-prodispro-blue to-green-500 hover:from-prodispro-blue/80 hover:to-green-500/80 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 transform"
           >
             🚀 Iniciar Nuevo Sorteo
           </button>
         </div>
       </div>
     </div>

     {/* Efectos de partículas flotantes */}
     <div className="fixed inset-0 pointer-events-none overflow-hidden">
       {[...Array(20)].map((_, i) => (
         <div
           key={i}
           className="absolute w-2 h-2 bg-prodispro-blue rounded-full opacity-30"
           style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animation: `float ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
           }}
         />
       ))}
     </div>

     <style>{`
       @keyframes float {
         0%, 100% { 
           transform: translateY(0) rotate(0deg); 
           opacity: 0.3; 
         }
         50% { 
           transform: translateY(-20px) rotate(180deg); 
           opacity: 0.7; 
         }
       }
     `}</style>
   </div>
 );
};

export default WinnersScreen;