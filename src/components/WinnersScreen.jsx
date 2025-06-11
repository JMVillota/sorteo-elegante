// src/components/WinnersScreen.jsx - COMPLETO
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';

const WinnersScreen = ({ winners, onReset }) => {
 const { width, height } = useWindowSize();
 const [showConfetti, setShowConfetti] = useState(true);
 const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

 // Eliminar duplicados basados en participant.id y prize.id
 const uniqueWinners = winners.filter((winner, index, self) => 
   index === self.findIndex((w) => 
     w.participant.id === winner.participant.id && 
     w.prize.id === winner.prize.id
   )
 );

 // Debug: Verificar que solo lleguen ganadores reales
 useEffect(() => {
   console.log('🏆 WinnersScreen - Ganadores recibidos:', winners.length);
   console.log('✅ Ganadores únicos:', uniqueWinners.length);
   console.log('📊 Ganadores por premio:', uniqueWinners.reduce((acc, winner) => {
     const prizeName = winner.prize?.name || 'Sin premio';
     acc[prizeName] = (acc[prizeName] || 0) + 1;
     return acc;
   }, {}));
 }, [winners, uniqueWinners]);

 // Efecto para mostrar confeti al cargar la pantalla
 useEffect(() => {
   setShowConfetti(true);
   const confettiTimer = setTimeout(() => {
     setShowConfetti(false);
   }, 10000);
   return () => clearTimeout(confettiTimer);
 }, []);

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

 // Función para generar PDF
 const generatePDF = async () => {
   setIsGeneratingPDF(true);
   
   try {
     console.log('📄 Generando PDF con ganadores únicos:', uniqueWinners.length);
     
     if (uniqueWinners.length === 0) {
       alert('No hay ganadores para generar el PDF');
       setIsGeneratingPDF(false);
       return;
     }

     const htmlContent = generatePDFContent();
     const printWindow = window.open('', '_blank');
     printWindow.document.write(htmlContent);
     printWindow.document.close();
     
     printWindow.onload = () => {
       setTimeout(() => {
         printWindow.print();
       }, 500);
     };
     
   } catch (error) {
     console.error('Error generando PDF:', error);
     alert('Error al generar el PDF. Por favor, intenta nuevamente.');
   } finally {
     setIsGeneratingPDF(false);
   }
 };

 // Generar contenido HTML para el PDF
 const generatePDFContent = () => {
   const currentDate = new Date().toLocaleDateString('es-ES', {
     year: 'numeric',
     month: 'long',
     day: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   });

   // Agrupar ganadores únicos por premio
   const groupedWinners = uniqueWinners.reduce((acc, winner) => {
     if (!winner || !winner.prize || !winner.participant) {
       return acc;
     }

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

   return `
   <!DOCTYPE html>
   <html lang="es">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Ganadores Sorteo PRODISPRO 2025</title>
     <style>
       @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
       
       * {
         margin: 0;
         padding: 0;
         box-sizing: border-box;
       }
       
       body {
         font-family: 'Inter', sans-serif;
         line-height: 1.6;
         color: #333;
         background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
         min-height: 100vh;
       }
       
       .container {
         max-width: 1200px;
         margin: 0 auto;
         padding: 40px 20px;
       }
       
       .header {
         text-align: center;
         margin-bottom: 50px;
         background: white;
         padding: 40px;
         border-radius: 20px;
         box-shadow: 0 20px 40px rgba(0,0,0,0.1);
         position: relative;
         overflow: hidden;
       }
       
       .header::before {
         content: '';
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         height: 5px;
         background: linear-gradient(90deg, #019BDC, #22C55E, #EAB308);
       }
       
       .logo {
         font-size: 48px;
         font-weight: 700;
         color: #019BDC;
         margin-bottom: 10px;
         text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
       }
       
       .title {
         font-size: 36px;
         font-weight: 600;
         color: #1f2937;
         margin-bottom: 10px;
       }
       
       .subtitle {
         font-size: 18px;
         color: #6b7280;
         margin-bottom: 20px;
       }
       
       .date {
         font-size: 16px;
         color: #019BDC;
         font-weight: 600;
         background: #f0f9ff;
         padding: 10px 20px;
         border-radius: 25px;
         display: inline-block;
       }
       
       .stats {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
         gap: 20px;
         margin-bottom: 40px;
       }
       
       .stat-card {
         background: white;
         padding: 30px;
         border-radius: 15px;
         text-align: center;
         box-shadow: 0 10px 30px rgba(0,0,0,0.1);
         border-left: 5px solid #019BDC;
       }
       
       .stat-number {
         font-size: 36px;
         font-weight: 700;
         color: #019BDC;
         margin-bottom: 10px;
       }
       
       .stat-label {
         font-size: 16px;
         color: #6b7280;
         font-weight: 500;
       }
       
       .prize-section {
         margin-bottom: 40px;
         background: white;
         border-radius: 20px;
         padding: 30px;
         box-shadow: 0 15px 35px rgba(0,0,0,0.1);
         border: 2px solid #22C55E;
       }
       
       .prize-header {
         display: flex;
         align-items: center;
         margin-bottom: 25px;
         padding-bottom: 20px;
         border-bottom: 2px solid #f3f4f6;
       }
       
       .prize-icon {
         font-size: 48px;
         margin-right: 20px;
         background: #f0fdf4;
         padding: 15px;
         border-radius: 15px;
         border: 2px solid #22C55E;
       }
       
       .prize-info h2 {
         font-size: 28px;
         color: #1f2937;
         margin-bottom: 8px;
         font-weight: 600;
       }
       
       .prize-info p {
         color: #6b7280;
         font-size: 16px;
       }
       
       .winners-grid {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
         gap: 20px;
       }
       
       .winner-card {
         background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
         border: 2px solid #22C55E;
         border-radius: 15px;
         padding: 25px;
         position: relative;
         overflow: hidden;
       }
       
       .winner-card::before {
         content: '🏆';
         position: absolute;
         top: 15px;
         right: 15px;
         font-size: 24px;
         opacity: 0.3;
       }
       
       .winner-number {
         position: absolute;
         top: -10px;
         left: -10px;
         background: #22C55E;
         color: white;
         width: 40px;
         height: 40px;
         border-radius: 50%;
         display: flex;
         align-items: center;
         justify-content: center;
         font-weight: 700;
         font-size: 16px;
       }
       
       .winner-name {
         font-size: 20px;
         font-weight: 600;
         color: #1f2937;
         margin-bottom: 8px;
         margin-top: 10px;
       }
       
       .winner-details {
         font-size: 14px;
         color: #6b7280;
         line-height: 1.4;
       }
       
       .winner-details span {
         display: block;
         margin-bottom: 4px;
       }
       
       .footer {
         text-align: center;
         margin-top: 50px;
         padding: 30px;
         background: white;
         border-radius: 20px;
         box-shadow: 0 10px 30px rgba(0,0,0,0.1);
       }
       
       .footer-logo {
         font-size: 32px;
         font-weight: 700;
         color: #019BDC;
         margin-bottom: 15px;
       }
       
       .footer-text {
         color: #6b7280;
         font-size: 16px;
       }
       
       @media print {
         body {
           background: white !important;
         }
         
         .container {
           max-width: none;
           padding: 20px;
         }
         
         .prize-section {
           page-break-inside: avoid;
           margin-bottom: 30px;
         }
         
         .winner-card {
           page-break-inside: avoid;
         }
       }
     </style>
   </head>
   <body>
     <div class="container">
       <!-- Header -->
       <div class="header">
         <div class="logo">PRODISPRO</div>
         <h1 class="title">🏆 GANADORES DEL SORTEO 2025 🏆</h1>
         <p class="subtitle">Felicitaciones a todos los participantes ganadores</p>
         <div class="date">📅 ${currentDate}</div>
       </div>
       
       <!-- Estadísticas -->
       <div class="stats">
         <div class="stat-card">
           <div class="stat-number">${uniqueWinners.length}</div>
           <div class="stat-label">Total Ganadores</div>
         </div>
         <div class="stat-card">
           <div class="stat-number">${Object.keys(groupedWinners).length}</div>
           <div class="stat-label">Premios Entregados</div>
         </div>
         <div class="stat-card">
           <div class="stat-number">${new Date().getFullYear()}</div>
           <div class="stat-label">Año del Sorteo</div>
         </div>
       </div>
       
       <!-- Premios y Ganadores -->
       ${Object.values(groupedWinners).map((group, index) => `
         <div class="prize-section">
           <div class="prize-header">
             <div class="prize-icon">${getPrizeIcon(group.prize.name)}</div>
             <div class="prize-info">
               <h2>${group.prize.name}</h2>
               <p>${group.winners.length} ganador${group.winners.length > 1 ? 'es' : ''}</p>
             </div>
           </div>
           
           <div class="winners-grid">
             ${group.winners.map((winner, winnerIndex) => `
               <div class="winner-card">
                 <div class="winner-number">${winnerIndex + 1}</div>
                 <div class="winner-name">${winner.participant.name}</div>
                 <div class="winner-details">
                   <span><strong>📄 Factura:</strong> ${winner.participant.invoiceNumber}</span>
                   <span><strong>📍 Ciudad:</strong> ${winner.participant.ciudad}</span>
                   <span><strong>📅 Fecha:</strong> ${winner.participant.fechaFormateada}</span>
                   <span><strong>👤 Vendedor:</strong> ${winner.participant.vendedor || 'N/A'}</span>
                   <span><strong>🎁 Unidad:</strong> ${winner.unit}</span>
                 </div>
               </div>
             `).join('')}
           </div>
         </div>
       `).join('')}
       
       <!-- Footer -->
       <div class="footer">
         <div class="footer-logo">PRODISPRO</div>
         <p class="footer-text">
           Gracias por participar en nuestro sorteo 2025<br>
           Documento generado automáticamente - ${currentDate}<br>
           <strong>Total de ganadores: ${uniqueWinners.length}</strong>
         </p>
       </div>
     </div>
   </body>
   </html>
   `;
 };

 // Agrupar ganadores únicos por premio para mostrar
 const groupedWinners = uniqueWinners.reduce((acc, winner) => {
   if (!winner || !winner.prize || !winner.participant) {
     console.warn('⚠️ Ganador inválido en groupedWinners:', winner);
     return acc;
   }

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
   <div className="min-h-screen bg-prodispro-black relative overflow-hidden">
     {/* Confeti de celebración */}
     {showConfetti && (
       <Confetti
         width={width}
         height={height}
         numberOfPieces={300}
         recycle={true}
         gravity={0.1}
         wind={0.02}
         colors={['#019BDC', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#F97316']}
         style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
       />
     )}

     <div className="container mx-auto px-4 py-8 relative z-10">
       {/* Header mejorado */}
       <div className="text-center mb-12 relative">
         <div className="absolute inset-0 bg-gradient-to-r from-prodispro-blue/20 via-green-500/20 to-yellow-500/20 rounded-3xl blur-3xl"></div>
         
         <div className="relative bg-prodispro-gray/90 backdrop-blur-sm rounded-3xl p-8 border border-prodispro-blue/30">
           <div className="text-8xl mb-4 animate-bounce">🎉</div>
           <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-prodispro-blue via-green-400 to-yellow-400 mb-4">
             ¡Sorteo Completado!
           </h1>
           <p className="text-2xl text-gray-300 mb-8">
             Felicitaciones a todos los ganadores del sorteo PRODISPRO 2025
           </p>
           
           {/* Botones de acción */}
           <div className="flex flex-wrap justify-center gap-4">
             <button
               onClick={() => setShowConfetti(!showConfetti)}
               className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
             >
               <span>{showConfetti ? '🎊' : '✨'}</span>
               <span>{showConfetti ? 'Ocultar Confeti' : 'Mostrar Confeti'}</span>
             </button>
             
             <button
               onClick={generatePDF}
               disabled={isGeneratingPDF || uniqueWinners.length === 0}
               className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
             >
               <span>📄</span>
               <span>{isGeneratingPDF ? 'Generando...' : `Certificado PDF (${uniqueWinners.length})`}</span>
               {isGeneratingPDF && (
                 <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2"></div>
               )}
             </button>
             
             <button
               onClick={onReset}
               className="px-8 py-4 bg-gradient-to-r from-prodispro-blue to-cyan-500 hover:from-prodispro-blue/80 hover:to-cyan-500/80 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
             >
               <span>🔄</span>
               <span>Nuevo Sorteo</span>
             </button>
           </div>
         </div>
       </div>

       {/* Verificar que hay ganadores antes de mostrar el resto */}
       {uniqueWinners.length === 0 ? (
         <div className="text-center py-20">
           <div className="text-8xl mb-6">😅</div>
           <h2 className="text-3xl font-bold text-gray-400 mb-4">
             No hay ganadores para mostrar
           </h2>
           <p className="text-gray-500 mb-8">
             Parece que no se completó ningún sorteo o hubo un error en los datos.
           </p>
           <button
             onClick={onReset}
             className="px-8 py-4 bg-prodispro-blue hover:bg-prodispro-blue/80 text-white font-bold rounded-xl transition-all duration-300"
           >
             Volver al Inicio
           </button>
         </div>
       ) : (
         <>
           {/* Estadísticas mejoradas */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
             <div className="text-center p-8 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
               <div className="text-6xl mb-4">🏆</div>
               <div className="text-4xl font-bold text-green-400 mb-2">
                 {uniqueWinners.length}
               </div>
               <div className="text-gray-300 text-lg">
                 Total Ganadores
               </div>
             </div>

             <div className="text-center p-8 bg-gradient-to-br from-prodispro-blue/20 to-cyan-600/20 border border-prodispro-blue/30 rounded-2xl backdrop-blur-sm">
               <div className="text-6xl mb-4">🎁</div>
               <div className="text-4xl font-bold text-prodispro-blue mb-2">
                 {Object.keys(groupedWinners).length}
               </div>
               <div className="text-gray-300 text-lg">
                 Premios Entregados
               </div>
             </div>

             <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl backdrop-blur-sm">
               <div className="text-6xl mb-4">📅</div>
               <div className="text-2xl font-bold text-yellow-400 mb-2">
                 {new Date().toLocaleDateString('es-ES', {
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric'
                 })}
               </div>
               <div className="text-gray-300 text-lg">
                 Fecha del Sorteo
               </div>
             </div>
           </div>

           {/* Lista de ganadores por premio */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
             {Object.values(groupedWinners).map((group, groupIndex) => (
               <div 
                 key={groupIndex}
                 className="bg-gradient-to-br from-prodispro-gray/90 to-prodispro-light-gray/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-green-500/30 relative overflow-hidden"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-green-400/10 to-green-400/5 animate-pulse"></div>
                 
                 <div className="relative z-10">
                   {/* Header del premio */}
                   <div className="flex items-center space-x-6 mb-8">
                     <div className="w-20 h-20 relative">
                       {getPrizeImage(group.prize) ? (
                         <img 
                           src={getPrizeImage(group.prize)} 
                           alt={group.prize.name}
                           className="w-full h-full object-cover rounded-2xl border-2 border-green-500 shadow-lg"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-prodispro-light-gray to-gray-600 rounded-2xl border-2 border-green-500 shadow-lg">
                           {getPrizeIcon(group.prize.name)}
                         </div>
                       )}
                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                         {group.winners.length}
                       </div>
                     </div>
                     <div>
                       <h2 className="text-2xl font-bold text-green-400 mb-2">{group.prize.name}</h2>
                       <p className="text-gray-300 text-lg">
                         {group.winners.length} ganador{group.winners.length > 1 ? 'es' : ''}
                       </p>
                     </div>
                   </div>

                   {/* Lista de ganadores del premio */}
                   <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                     {group.winners.map((winner, index) => (
                       <div 
                         key={index}
                         className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-600/30 rounded-2xl hover:from-green-600/20 hover:to-emerald-600/20 transition-all duration-300 group"
                       >
                         <div className="flex items-center space-x-4">
                           <div className="relative">
                             <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
                               {winner.participant.name.charAt(0)}
                             </div>
                             <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black">
                               {index + 1}
                             </div>
                           </div>
                           <div className="flex-1">
                             <h3 className="font-bold text-white text-xl mb-2 group-hover:text-green-300 transition-colors">
                               {winner.participant.name}
                             </h3>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                               <p className="text-green-300">
                                 📄 {winner.participant.invoiceNumber}
                               </p>
                               <p className="text-gray-400">
                                 🎁 Unidad {winner.unit}
                               </p>
                               <p className="text-gray-400">
                                 📍 {winner.participant.ciudad}
                               </p>
                               <p className="text-gray-400">
                                 📅 {winner.participant.fechaFormateada}
                               </p>
                               <p className="text-gray-400 col-span-2">
                                 👤 {winner.participant.vendedor || 'N/A'}
                               </p>
                             </div>
                           </div>
                           <div className="text-center">
                             <div className="text-4xl mb-2 animate-bounce">🏆</div>
                             <div className="text-xs text-green-400 font-bold uppercase tracking-wider">
                               Ganador
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

           {/* Tabla completa de ganadores - Solo en desktop */}
           <div className="hidden lg:block bg-gradient-to-br from-prodispro-gray/90 to-prodispro-light-gray/90 backdrop-blur-sm rounded-3xl p-8 border border-prodispro-blue/30 mb-12">
             <h2 className="text-3xl font-bold text-center mb-8 text-prodispro-blue">
               🎯 Lista Completa de Ganadores
             </h2>
             
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="border-b-2 border-prodispro-blue/30">
                     <th className="text-left py-4 px-6 text-prodispro-blue font-bold text-lg">#</th>
                     <th className="text-left py-4 px-6 text-prodispro-blue font-bold text-lg">Ganador</th>
                     <th className="text-left py-4 px-6 text-prodispro-blue font-bold text-lg">Factura</th>
                     <th className="text-left py-4 px-6 text-prodispro-blue font-bold text-lg">Premio</th>
                     <th className="text-left py-4 px-6 text-prodispro-blue font-bold text-lg">Ciudad</th>
                     <th className="text-left py-4 px-6 text-prodispro-blue font-bold text-lg">Vendedor</th>
                   </tr>
                 </thead>
                 <tbody>
                   {uniqueWinners.map((winner, index) => (
                     <tr 
                       key={index}
                       className="border-b border-gray-700 hover:bg-green-500/10 transition-all duration-300 group"
                     >
                       <td className="py-4 px-6">
                         <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                           {index + 1}
                         </div>
                       </td>
                       <td className="py-4 px-6">
                         <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-gradient-to-br from-prodispro-blue to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                             {winner.participant.name.charAt(0)}
                           </div>
                           <span className="font-medium text-white text-lg group-hover:text-green-300 transition-colors">
                             {winner.participant.name}
                           </span>
                         </div>
                       </td>
                       <td className="py-4 px-6 text-gray-300 font-mono">
                         {winner.participant.invoiceNumber}
                       </td>
                       <td className="py-4 px-6">
                         <div className="flex items-center space-x-3">
                           <span className="text-3xl">
                             {getPrizeIcon(winner.prize.name)}
                           </span>
                           <div>
                             <div className="text-white font-medium">
                               {winner.prize.name}
                             </div>
                             <div className="text-xs text-gray-400">
                               Unidad {winner.unit}</div>
                           </div>
                         </div>
                       </td>
                       <td className="py-4 px-6 text-gray-300">
                         {winner.participant.ciudad}
                       </td>
                       <td className="py-4 px-6 text-gray-300">
                         {winner.participant.vendedor || 'N/A'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Lista móvil de ganadores - Solo en móvil */}
           <div className="lg:hidden bg-gradient-to-br from-prodispro-gray/90 to-prodispro-light-gray/90 backdrop-blur-sm rounded-3xl p-6 mb-12">
             <h2 className="text-2xl font-bold text-center mb-6 text-prodispro-blue">
               🎯 Todos los Ganadores
             </h2>
             
             <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
               {uniqueWinners.map((winner, index) => (
                 <div 
                   key={index}
                   className="p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-600/30 rounded-xl"
                 >
                   <div className="flex items-start space-x-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                       {index + 1}
                     </div>
                     <div className="flex-1">
                       <h4 className="font-bold text-white text-lg mb-2">
                         {winner.participant.name}
                       </h4>
                       <div className="space-y-1 text-sm">
                         <p className="text-green-300 flex items-center">
                           <span className="mr-2">🎁</span>
                           {winner.prize.name} (Unidad {winner.unit})
                         </p>
                         <p className="text-gray-400">
                           📄 {winner.participant.invoiceNumber}
                         </p>
                         <p className="text-gray-400">
                           📍 {winner.participant.ciudad}
                         </p>
                         <p className="text-gray-400">
                           👤 {winner.participant.vendedor || 'N/A'}
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Footer con información adicional */}
           <div className="text-center">
             <div className="inline-block p-8 bg-gradient-to-br from-prodispro-gray/90 to-prodispro-light-gray/90 backdrop-blur-sm rounded-3xl border border-prodispro-blue/30 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-prodispro-blue/5 via-green-500/5 to-yellow-500/5 animate-pulse"></div>
               
               <div className="relative z-10">
                 <div className="text-6xl md:text-8xl mb-6 animate-bounce">🎊</div>
                 <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-prodispro-blue to-green-400 mb-4">
                   ¡Gracias por participar!
                 </h3>
                 <p className="text-gray-300 mb-8 text-base md:text-lg px-4">
                   El sorteo PRODISPRO 2025 ha concluido exitosamente<br/>
                   {uniqueWinners.length} ganador{uniqueWinners.length > 1 ? 'es han' : ' ha'} sido seleccionado{uniqueWinners.length > 1 ? 's' : ''} de manera transparente y aleatoria
                 </p>
                 
                 <div className="flex flex-col md:flex-row justify-center gap-4">
                   <button
                     onClick={generatePDF}
                     disabled={isGeneratingPDF}
                     className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 transform flex items-center justify-center space-x-2 disabled:opacity-50"
                   >
                     <span>📋</span>
                     <span className="text-sm md:text-base">{isGeneratingPDF ? 'Generando...' : `Certificado PDF (${uniqueWinners.length})`}</span>
                     {isGeneratingPDF && (
                       <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                     )}
                   </button>
                   
                   <button
                     onClick={onReset}
                     className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-prodispro-blue to-cyan-500 hover:from-prodispro-blue/80 hover:to-cyan-500/80 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 transform flex items-center justify-center space-x-2"
                   >
                     <span>🚀</span>
                     <span className="text-sm md:text-base">Iniciar Nuevo Sorteo</span>
                   </button>
                 </div>
                 
                 <div className="mt-8 p-4 bg-prodispro-blue/10 rounded-xl border border-prodispro-blue/30">
                   <p className="text-xs md:text-sm text-gray-400">
                     Sorteo realizado el {new Date().toLocaleDateString('es-ES', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })} • {uniqueWinners.length} ganadores verificados
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </>
       )}
     </div>

     {/* Efectos de partículas flotantes */}
     <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
       {[...Array(20)].map((_, i) => (
         <div
           key={i}
           className={`absolute rounded-full opacity-20 ${
             i % 3 === 0 ? 'bg-prodispro-blue' : 
             i % 3 === 1 ? 'bg-green-400' : 'bg-yellow-400'
           }`}
           style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             width: `${Math.random() * 8 + 4}px`,
             height: `${Math.random() * 8 + 4}px`,
             animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
           }}
         />
       ))}
     </div>

     <style>{`
       @keyframes float {
         0%, 100% { 
           transform: translateY(0) rotate(0deg) scale(1); 
           opacity: 0.2; 
         }
         33% { 
           transform: translateY(-20px) rotate(120deg) scale(1.1); 
           opacity: 0.5; 
         }
         66% { 
           transform: translateY(-10px) rotate(240deg) scale(0.9); 
           opacity: 0.3; 
         }
       }
       
       @keyframes gradientShift {
         0% { background-position: 0% 50%; }
         50% { background-position: 100% 50%; }
         100% { background-position: 0% 50%; }
       }
       
       .animate-gradient {
         background-size: 200% 200%;
         animation: gradientShift 3s ease infinite;
       }
       
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
     `}</style>
   </div>
 );
};

export default WinnersScreen;