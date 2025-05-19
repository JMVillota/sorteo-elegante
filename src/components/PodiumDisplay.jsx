import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Confetti from 'react-confetti';
import { Howl } from 'howler';
import logoTransparente from '../assets/logo-transparente.png';

const PodiumDisplay = ({ winners, onReset }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const containerRef = useRef(null);
  const podiumsRef = useRef([]);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Efecto para manejar el tamaño de ventana para el confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animación inicial
  useEffect(() => {
    // Sonido de celebración final
    const fanfareSound = new Howl({
      src: ['/assets/sounds/grand-finale.mp3'],
      volume: 0.8,
      preload: true
    });
    
    fanfareSound.play();
    
    // Animar el contenedor con GSAP
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
    
    // Animar cada podio entrando de forma escalonada
    podiumsRef.current.forEach((podium, index) => {
      if (podium) {
        gsap.fromTo(podium,
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            delay: 0.5 + (index * 0.2), 
            ease: "back.out(1.7)" 
          }
        );
      }
    });
    
    // Detener confetti después de un tiempo
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 12000);
    
    return () => {
      clearTimeout(timer);
      fanfareSound.stop();
    };
  }, []);

  // Ordenar ganadores por posición
  const sortedWinners = [...winners].sort((a, b) => {
    // Lógica personalizada para ordenar por ID del premio
    return a.prize.id - b.prize.id;
  });

  // Asignar colores a los podios
  const podiumColors = [
    "from-yellow-300 to-yellow-500", // 1er lugar - oro
    "from-gray-300 to-gray-500",     // 2do lugar - plata
    "from-amber-700 to-amber-900",   // 3er lugar - bronce
    "from-blue-400 to-blue-600"      // 4to lugar - azul
  ];

  // Determinar el orden y alturas de los podios
  // Primero y segundo en el centro, tercero y cuarto a los lados
  const podiumOrder = sortedWinners.length >= 4 
    ? [1, 0, 2, 3]  // Si hay 4+ ganadores, mostramos 4 podios
    : sortedWinners.length === 3 
      ? [1, 0, 2]   // Si hay 3 ganadores
      : sortedWinners.length === 2 
        ? [1, 0]    // Si hay 2 ganadores
        : [0];      // Si solo hay 1 ganador

  // Alturas de los podios según posición
  const podiumHeights = ["h-72", "h-64", "h-56", "h-48"];

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={300}
          gravity={0.15}
          colors={['#ffc857', '#ff3e7f', '#6a26cd', '#2ec5ce', '#ffffff']}
        />
      )}

      {/* Título */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink animate-pulse-slow">
          ¡Grandes Ganadores!
        </h1>
        <p className="text-xl text-accent/80 mt-2">Sorteo completado exitosamente</p>

        {/* Logo Prodispro */}
        <div className="mt-4 w-24 h-24 mx-auto bg-purple-900/60 rounded-full border-2 border-yellow-400 p-2 shadow-lg">
          <img 
            src={logoTransparente} 
            alt="Prodispro" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Podios */}
      <div className="flex flex-wrap justify-center items-end gap-4 sm:gap-6 mb-12">
        {podiumOrder.map((sortPosition, idx) => {
          if (sortPosition >= sortedWinners.length) return null;
          
          const winner = sortedWinners[sortPosition];
          // Determinar posición real (para mostrar el número y medalla)
          const position = sortPosition;
          // Altura según posición en podiumOrder
          const podiumHeight = podiumHeights[idx];
          
          return (
            <div
              key={winner.prize.id}
              ref={el => podiumsRef.current[idx] = el}
              className={`flex flex-col items-center transform ${idx === 1 ? 'order-1' : idx === 0 ? 'order-2' : idx === 2 ? 'order-3' : 'order-4'}`}
            >
              {/* Ganador */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-accent to-pink flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                  {winner.participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center mt-2">
                  <p className="font-bold text-white">{winner.participant.name}</p>
                  <p className="text-accent text-sm">#{winner.participant.ticketNumber}</p>
                </div>
                
                {/* Premio */}
                <div className="mt-2 px-3 py-1 rounded-full bg-primary-dark/70 border border-accent/50 text-sm font-medium shadow-inner text-white">
                  {winner.prize.name}
                </div>
                
                {/* Posición */}
                <div className="mt-2 text-2xl">
                  {position === 0 ? "🥇" : position === 1 ? "🥈" : position === 2 ? "🥉" : "🏅"}
                </div>
              </div>
              
              {/* Podio */}
              <div className={`w-24 sm:w-32 ${podiumHeight} rounded-t-lg bg-gradient-to-b ${podiumColors[position]} relative overflow-hidden flex items-center justify-center shadow-lg`}>
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {position + 1}
                </span>
                
                {/* Efectos decorativos del podio */}
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-r from-white/0 via-white/30 to-white/0"></div>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-black/20"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Listado completo de ganadores */}
      <div className="w-full max-w-md bg-primary-dark/70 rounded-xl p-4 border border-accent/30 shadow-lg">
        <h2 className="text-xl font-bold text-accent mb-3 text-center">Todos los Ganadores</h2>
        
        <div className="max-h-[250px] overflow-y-auto pr-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-accent/30">
                <th className="text-left p-2 text-yellow-300">Premio</th>
                <th className="text-left p-2 text-yellow-300">Ganador</th>
              </tr>
            </thead>
            <tbody>
              {sortedWinners.map((winner, index) => (
                <tr key={index} className="border-b border-accent/10 hover:bg-white/5 transition-colors">
                  <td className="p-2">{winner.prize.name}</td>
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-pink flex items-center justify-center text-sm font-bold mr-2">
                        {winner.participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white">{winner.participant.name}</p>
                        <p className="text-xs text-accent/70">#{winner.participant.ticketNumber}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Botón para reiniciar el sorteo */}
      <button
        onClick={onReset}
        className="mt-8 px-8 py-3 bg-gradient-to-r from-accent to-pink rounded-full text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
      >
        {/* Efecto de brillo en el botón */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Nuevo Sorteo
        </span>
      </button>
    </div>
  );
};

export default PodiumDisplay;