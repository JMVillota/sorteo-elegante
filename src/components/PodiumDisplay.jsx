// src/components/PodiumDisplay.jsx
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

  useEffect(() => {
    const fanfareSound = new Howl({
      src: ['/assets/sounds/grand-finale.mp3'],
      volume: 0.8,
      preload: true
    });
    
    fanfareSound.play();
    
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
    
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
    
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 12000);
    
    return () => {
      clearTimeout(timer);
      fanfareSound.stop();
    };
  }, []);

  const getSortedWinners = () => {
    return [...winners].sort((a, b) => {
      const getPrizeImportance = (prize) => {
        if (prize.name.includes("Refrigeradora")) return 0;
        if (prize.name.includes("Moto")) return 1;
        if (prize.name.includes("Aspiradora")) return 2;
        if (prize.name.includes("Cafetera")) {
          const match = prize.name.match(/\((\d+)\)/);
          return match ? 3 + parseInt(match[1]) : 3;
        }
        return 99;
      };
      
      return getPrizeImportance(a.prize) - getPrizeImportance(b.prize);
    });
  };

  const sortedWinners = getSortedWinners();

  const calculatePodiumPositions = () => {
    if (winners.length === 7) {
      return [1, 0, 2, 3, 4, 5, 6];
    }
    
    return winners.length <= 3 
      ? [1, 0, 2]
      : Array.from({ length: winners.length }, (_, i) => i);
  };

  const podiumOrder = calculatePodiumPositions();

  const getPodiumColor = (prize) => {
    if (prize.name.includes("Refrigeradora")) return "from-yellow-300 to-yellow-500";
    if (prize.name.includes("Moto")) return "from-yellow-400 to-red-500";
    if (prize.name.includes("Aspiradora")) return "from-red-400 to-red-600";
    return "from-red-500 to-red-700";
  };

  const getHeightClass = (index) => {
    const heights = ["h-72", "h-64", "h-56", "h-48", "h-40", "h-40", "h-40"];
    return heights[index] || "h-40";
  };

  const getPrizeEmoji = (prize) => {
    if (prize.name.includes("Refrigeradora")) return "🧊";
    if (prize.name.includes("Moto")) return "🛵";
    if (prize.name.includes("Aspiradora")) return "🧹";
    return "☕";
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center p-4 relative">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={300}
          gravity={0.15}
          colors={['#ffc0cb', '#ff0000', '#ffb6c1', '#e91e63', '#ffffff']}
        />
      )}

      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">
          ¡Grandes Ganadores!
        </h1>
        <p className="text-xl text-white mt-2">Sorteo Día de la Madre completado exitosamente</p>

        <div className="mt-4 mx-auto bg-red-900/60 rounded-full border-2 border-yellow-300 p-2 shadow-lg flex items-center justify-center">
          <img src={logoTransparente} alt="Prodispro" className="h-20 object-contain" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-end gap-5 mb-8 relative z-10">
        {podiumOrder.map((sortPosition, idx) => {
          if (sortPosition >= sortedWinners.length) return null;
          
          const winner = sortedWinners[sortPosition];
          const position = sortPosition;
          const podiumHeight = getHeightClass(idx);
          const podiumColor = getPodiumColor(winner.prize);
          const prizeEmoji = getPrizeEmoji(winner.prize);
          
          return (
            <div
              key={winner.prize.id}
              ref={el => podiumsRef.current[idx] = el}
              className={`flex flex-col items-center transform ${
                winners.length <= 3 
                  ? idx === 1 ? 'order-1' : idx === 0 ? 'order-2' : 'order-3' 
                  : `order-${idx+1}`
              } ${winners.length > 6 ? 'scale-90' : ''}`}
            >
              <div className="flex flex-col items-center mb-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center text-lg font-bold border-2 border-white shadow-lg">
                  {winner.participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center mt-2">
                  <p className="font-bold text-white text-sm">{winner.participant.name}</p>
                  <p className="text-xs text-yellow-200 truncate">{winner.participant.invoiceNumber}</p>
                  <p className="text-xs text-yellow-200/80 truncate">{winner.participant.fechaFormateada}</p>
                  <p className="text-xs text-yellow-200/80 truncate">{winner.participant.ciudad}</p>
                </div>
                
                <div className="mt-1 px-3 py-1 rounded-full bg-red-900 border border-yellow-300 text-sm font-medium shadow-inner text-white">
                  {winner.prize.name}
                </div>
                
                <div className="mt-2 text-2xl">
                  {prizeEmoji}
                </div>
              </div>
              
              <div className={`w-24 sm:w-28 ${podiumHeight} rounded-t-lg bg-gradient-to-b ${podiumColor} relative overflow-hidden flex items-center justify-center shadow-lg`}>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {position + 1}
                </span>
                
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-r from-white/0 via-white/30 to-white/0"></div>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-black/20"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="w-full max-w-4xl overflow-x-auto">
        <h2 className="text-xl font-bold text-yellow-300 mb-3 text-center">
          🏆 Todos los Ganadores 🏆
        </h2>
        
        <div className="flex space-x-4 pb-4 min-w-max">
          {sortedWinners.map((winner, index) => (
            <div
              key={index}
              className="bg-red-800 rounded-lg p-4 border border-yellow-300/60 shadow-lg w-56"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-sm font-bold border border-yellow-300/40">
                  {winner.participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white truncate">{winner.participant.name}</p>
                  <p className="text-xs text-yellow-200/80 truncate">{winner.participant.ciudad}</p>
                </div>
              </div>
              <div className="py-1 px-2 bg-red-900 rounded border border-yellow-300/40 text-center">
                <p className="text-sm font-bold text-yellow-200">
                  {getPrizeEmoji(winner.prize)} {winner.prize.name}
                </p>
              </div>
              <div className="mt-2 text-xs text-white/80">
                <p>Factura: {winner.participant.invoiceNumber}</p>
                <p>Fecha: {winner.participant.fechaFormateada}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={onReset}
        className="mt-8 px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-red-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
      >
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