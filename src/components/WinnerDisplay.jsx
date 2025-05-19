import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import Confetti from 'react-confetti';

const WinnerDisplay = ({ winner }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const containerRef = useRef(null);
  const prizeCardRef = useRef(null);
  const winnerNameRef = useRef(null);
  const detailsRef = useRef(null);
  
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
  
  // Efectos de sonido y animación al montar el componente
  useEffect(() => {
    // Reproducir sonido de victoria
    const victorySound = new Howl({
      src: ['/assets/sounds/grand-win.mp3'],
      volume: 0.8,
      preload: true
    });
    
    victorySound.play();
    
    // Iniciar confetti
    setShowConfetti(true);
    
    // Animaciones GSAP
    const timeline = gsap.timeline();
    
    // Animación del contenedor principal
    timeline.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );
    
    // Animación de la tarjeta del premio
    timeline.fromTo(prizeCardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.8)" },
      "-=0.2"
    );
    
    // Animación del nombre del ganador
    timeline.fromTo(winnerNameRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" },
      "-=0.4"
    );
    
    // Animación de los detalles
    timeline.fromTo(detailsRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );
    
    // Animación del brillo
    timeline.fromTo(".winner-shine",
      { x: "-100%" },
      { 
        x: "100%", 
        duration: 1.5, 
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 2.5
      }
    );
    
    // Detener el confetti después de un tiempo
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => {
      victorySound.stop();
      clearTimeout(timer);
      timeline.kill();
    };
  }, []);
  
  // Esta es solo una visualización temporal mientras se muestra el ganador
  // No tiene botón porque la transición es automática
  
  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto relative z-10">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.15}
          colors={['#ffc857', '#ff3e7f', '#6a26cd', '#2ec5ce', '#ffffff']}
        />
      )}
      
      <div ref={prizeCardRef} className="relative bg-gradient-to-br from-secondary-purple/80 to-primary-purple/80 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,200,87,0.3)] p-6 backdrop-blur-md border border-accent/30">
        {/* Encabezado con efectos de casino */}
        <div className="text-center mb-8">
          <div className="inline-block bg-black/30 rounded-lg px-8 py-2 transform -rotate-2 shadow-inner">
            <div className="text-accent text-lg uppercase tracking-widest font-semibold mb-1 animate-pulse">
              ¡Felicitaciones!
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500">
            Tenemos un Ganador
          </h2>
          
          {/* Luces de casino */}
          <div className="flex justify-center mt-3 space-x-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={`light-${i}`}
                className="w-3 h-3 rounded-full bg-yellow-400"
                style={{ 
                  animation: `pulse 1s infinite ${i * 0.1}s`,
                  boxShadow: '0 0 10px rgba(255, 200, 0, 0.8)'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Nombre del ganador con estilo elegante de casino */}
        <div ref={winnerNameRef} className="mb-8">
          <div className="relative bg-black/40 rounded-xl p-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-500/40 to-yellow-500/20 rounded-xl"></div>
            
            {/* Efecto de brillo desplazándose */}
            <div className="winner-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="bg-primary-purple/90 rounded-lg px-4 py-5 text-center relative z-10">
              <div className="flex items-center justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-pink flex items-center justify-center text-2xl font-bold mr-3">
                  {winner.participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    {winner.participant.name}
                  </h3>
                  <p className="text-accent text-lg">#{winner.participant.ticketNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del premio con estilo de ticket de casino y cinta dorada */}
        <div ref={detailsRef} className="mb-8 relative">
          {/* Cinta dorada de premio ganado */}
          <div className="absolute -right-8 top-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-1 px-8 transform rotate-45 shadow-md z-10">
            GANADO
          </div>
          
          <div className="bg-black/50 rounded-xl p-5 border border-dashed border-yellow-500/50 relative overflow-hidden">
            {/* Adornos de ticket */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-primary-purple rounded-full"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-primary-purple rounded-full"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-accent/80 uppercase tracking-wider mb-1">Premio Ganado</div>
                <div className="text-2xl font-bold text-white">{winner.prize.name}</div>
              </div>
              <div className="text-6xl">🏆</div>
            </div>
            
            {/* Código de barras decorativo */}
            <div className="mt-4 h-6 bg-white" style={{ 
              maskImage: 'repeating-linear-gradient(to right, #000, #000 3px, transparent 3px, transparent 5px)'
             }}></div>
            
            <div className="mt-1 text-center text-xs text-yellow-500/80">
              #{new Date().getTime().toString().substring(0, 10)}
            </div>
          </div>
        </div>
        
        {/* Efectos de luz y resplandor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full bg-gradient-radial from-accent/10 to-transparent -z-10 animate-pulse-slow"></div>
      </div>
      
      {/* CSS para los efectos */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to));
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
    </div>
  );
};

export default WinnerDisplay;