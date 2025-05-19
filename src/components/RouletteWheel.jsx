import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import logoTransparente from '../assets/logo-transparente.png';

const SlotMachineRoulette = ({ participants, onWinnerSelected, currentWinner }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  
  // Referencias para cada rodillo y efectos
  const reel1Ref = useRef(null);
  const reel2Ref = useRef(null);
  const reel3Ref = useRef(null);
  const nameDisplayRef = useRef(null);
  const spinTimerRef = useRef(null);
  const audioRef = useRef(null);
  
  // Obtener números de factura divididos en 3 partes
  const generateSlotSymbols = () => {
    const symbols = {
      reel1: [], // establecimiento (001)
      reel2: [], // punto emisión (001)
      reel3: []  // secuencial (000000001)
    };
    
    // Generar 15 conjuntos aleatorios para cada rodillo
    for (let i = 0; i < 15; i++) {
      const establecimiento = Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
      const puntoEmision = Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
      const secuencial = Math.floor(1 + Math.random() * 999999999).toString().padStart(9, '0');
      
      symbols.reel1.push(establecimiento);
      symbols.reel2.push(puntoEmision);
      symbols.reel3.push(secuencial);
    }
    
    return symbols;
  };
  
  // Estado para los símbolos en los rodillos
  const [reelSymbols, setReelSymbols] = useState(generateSlotSymbols());
  
  // Reset cuando llega un nuevo ganador desde afuera
  useEffect(() => {
    if (currentWinner && !isSpinning) {
      setWinner(null);
      setCurrentParticipant(null);
    }
  }, [currentWinner, isSpinning]);
  
  // Inicializar sonidos y animaciones
  useEffect(() => {
    // Inicializar sonidos
    if (!audioRef.current) {
      audioRef.current = {
        slotSpin: new Howl({
          src: ['/assets/sounds/wheel-spinning.mp3'], 
          volume: 0.7,
          loop: true,
          preload: true
        }),
        slotStop: new Howl({
          src: ['/assets/sounds/wheel-stop.mp3'],
          volume: 0.8,
          preload: true
        }),
        winnerSound: new Howl({
          src: ['/assets/sounds/winner.mp3'],
          volume: 0.9,
          preload: true
        })
      };
      
      // Precargar sonidos
      audioRef.current.slotSpin.load();
      audioRef.current.slotStop.load();
      audioRef.current.winnerSound.load();
    }
    
    // Efectos iniciales para los rodillos
    const applyInitialEffects = () => {
      // Aplica efecto de degradado a los rodillos para simular curvatura
      [reel1Ref, reel2Ref, reel3Ref].forEach(reelRef => {
        if (reelRef.current) {
          const items = reelRef.current.querySelectorAll('.reel-item');
          
          items.forEach((item, i) => {
            // El item central (índice 2) está a escala completa
            const distanceFromCenter = Math.abs(i - 2);
            const scale = 1 - (distanceFromCenter * 0.05);
            const opacity = 1 - (distanceFromCenter * 0.2);
            
            gsap.set(item, {
              scale,
              opacity,
              rotateX: -distanceFromCenter * 10 // Efecto 3D sutil
            });
          });
        }
      });
    };
    
    applyInitialEffects();
    
    // Limpiar
    return () => {
      if (audioRef.current) {
        Object.values(audioRef.current).forEach(sound => {
          if (sound.playing()) sound.stop();
        });
      }
      
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, []);
  
  // Función para girar los rodillos
  const spinReels = () => {
    if (isSpinning || participants.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Seleccionar ganador aleatorio
    const randomIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[randomIndex];
    
    // Reproducir sonido
    if (audioRef.current) {
      audioRef.current.slotSpin.play();
    }
    
    // Generar nuevos símbolos para los rodillos
    setReelSymbols(generateSlotSymbols());
    
    // Animación de números de factura rápida durante el giro
    let nameIndex = 0;
    const nameInterval = setInterval(() => {
      const randomPartIndex = Math.floor(Math.random() * participants.length);
      setCurrentParticipant(participants[randomPartIndex]);
      
      // Efecto visual en el nombre
      if (nameDisplayRef.current) {
        gsap.fromTo(nameDisplayRef.current, 
          { opacity: 0.7, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.1 }
        );
      }
      
      nameIndex++;
    }, 100);
    
    // Seleccionar posición de gane en cada rodillo
    const winPosition = 2; // El slot central (índice 2) será la posición ganadora
    
    // Dividir la factura del ganador en 3 partes
    let winnerInvoiceParts = ['001', '001', '000000001']; // Valores por defecto
    
    if (selectedWinner.invoiceNumber) {
      const parts = selectedWinner.invoiceNumber.split('-');
      if (parts.length === 3) {
        winnerInvoiceParts = parts;
      }
    }
    
    // Agregar los valores del ganador a cada rodillo en la posición ganadora
    const newSymbols = {
      reel1: [...reelSymbols.reel1],
      reel2: [...reelSymbols.reel2],
      reel3: [...reelSymbols.reel3]
    };
    
    newSymbols.reel1[winPosition] = winnerInvoiceParts[0];
    newSymbols.reel2[winPosition] = winnerInvoiceParts[1];
    newSymbols.reel3[winPosition] = winnerInvoiceParts[2];
    
    setReelSymbols(newSymbols);
    
    // Crear las animaciones de giro para cada rodillo
    const spinReel = (reelRef, delay, duration) => {
      if (!reelRef.current) return;
      
      // Número de "vueltas" que dará el rodillo
      const numSpins = 30 + Math.floor(Math.random() * 10);
      
      // Altura de cada item del rodillo
      const itemHeight = reelRef.current.querySelector('.reel-item')?.offsetHeight || 80;
      
      // Animación de giro
      return gsap.to(reelRef.current, {
        y: -(numSpins * 5 * itemHeight), // Da varias vueltas
        duration,
        delay,
        ease: "power2.inOut",
        onComplete: () => {
          // Resetear posición y actualizar el contenido
          gsap.set(reelRef.current, { y: 0 });
          
          // Aplicar efectos de escala y opacidad a los items
          const items = reelRef.current.querySelectorAll('.reel-item');
          items.forEach((item, i) => {
            const distanceFromCenter = Math.abs(i - winPosition);
            const scale = 1 - (distanceFromCenter * 0.05);
            const opacity = 1 - (distanceFromCenter * 0.2);
            
            gsap.to(item, {
              scale,
              opacity,
              rotateX: -distanceFromCenter * 10,
              duration: 0.3
            });
            
            // Destacar la posición ganadora
            if (i === winPosition) {
              gsap.to(item, {
                backgroundColor: 'rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.5) inset',
                duration: 0.3
              });
            }
          });
        }
      });
    };
    
    // Establece diferentes tiempos para cada rodillo (como en las máquinas reales)
    const tl = gsap.timeline();
    
    tl.add(spinReel(reel1Ref, 0, 2), 0); // El primer rodillo gira inmediatamente
    tl.add(spinReel(reel2Ref, 0.3, 2.3), 0); // El segundo rodillo comienza un poco después
    tl.add(spinReel(reel3Ref, 0.6, 2.6), 0); // El tercer rodillo es el último
    
    // Cuando todos los rodillos se detienen
    tl.call(() => {
      // Detener el cambio de participante y establecer el ganador
      clearInterval(nameInterval);
      setCurrentParticipant(selectedWinner);
      
      // Detener sonido de giro e iniciar sonido de parada
      if (audioRef.current) {
        audioRef.current.slotSpin.stop();
        audioRef.current.slotStop.play();
      }
      
      // Pausa breve
      setTimeout(() => {
        // Mostrar ganador con efectos
        setWinner(selectedWinner);
        
        // Efecto de destello en la línea de gane
        gsap.fromTo(".win-line", 
          { opacity: 0, scaleY: 0 },
          { 
            opacity: 1, 
            scaleY: 1, 
            duration: 0.3,
            repeat: 3,
            yoyo: true
          }
        );
        
        // Animar el display del ganador
        gsap.fromTo(nameDisplayRef.current, 
          { scale: 1 },
          { 
            scale: 1.05, 
            boxShadow: '0 0 20px rgba(255, 200, 50, 0.8)',
            backgroundColor: 'rgba(255, 200, 50, 0.2)',
            borderColor: 'rgba(255, 200, 50, 0.8)',
            repeat: 3,
            yoyo: true,
            duration: 0.3
          }
        );
        
        // Reproducir sonido de ganador
        if (audioRef.current) {
          audioRef.current.winnerSound.play();
        }
        
        // Finalizar todo
        spinTimerRef.current = setTimeout(() => {
          setIsSpinning(false);
          onWinnerSelected(selectedWinner);
        }, 2000);
      }, 500);
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      {/* Mostrar participante actual arriba */}
      <div className="text-center mb-6 h-28 flex flex-col items-center justify-center">
        <div 
          ref={nameDisplayRef}
          className={`relative bg-purple-900/80 px-8 py-4 rounded-xl border border-yellow-400/20 transition-all duration-200 backdrop-blur-sm
                     ${winner ? 'border-yellow-400/80' : ''}`}
          style={{
            minWidth: '300px',
            maxWidth: '90%'
          }}
        >
          <div className="text-sm text-yellow-400/90 mb-1 uppercase tracking-wider">
            PARTICIPANTE
          </div>
          <div className="text-xl font-bold text-white">
            {currentParticipant ? currentParticipant.name : 'Presiona Girar'}
          </div>
          {currentParticipant && (
            <div className="text-sm text-yellow-400/80 mt-1">
              Factura SRI: {currentParticipant.invoiceNumber || 'N/A'}
            </div>
          )}
          
          {/* Efectos decorativos */}
          {winner && (
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0 rounded-xl -z-10 animate-pulse"></div>
          )}
        </div>
      </div>
      
      {/* Máquina tragamonedas con 3 rodillos horizontales */}
      <div className="relative w-full max-w-md h-[400px] border-8 border-yellow-600 rounded-xl bg-gradient-to-b from-purple-800 to-purple-950 mb-8 overflow-hidden shadow-[0_0_30px_rgba(255,150,0,0.4)]">
        {/* Parte superior de la máquina */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-yellow-600 to-yellow-700 flex items-center justify-center">
          <div className="text-2xl font-bold text-white text-center tracking-wider drop-shadow-lg transform -rotate-1">
            SORTEO DE FACTURAS
          </div>
          <div className="absolute top-0 left-0 right-0 flex justify-between px-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={`top-light-${i}`}
                className="w-4 h-4 rounded-full bg-red-500"
                style={{ 
                  animation: `blink 1s infinite ${i * 0.2}s`,
                  boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Contenedor principal de los 3 rodillos */}
        <div className="absolute top-24 inset-x-4 bottom-20 bg-black rounded-lg border-4 border-yellow-700 overflow-hidden flex shadow-inner">
          {/* Línea de gane (horizontal en el centro) */}
          <div className="win-line absolute left-0 right-0 h-[80px] top-1/2 -translate-y-1/2 border-y-2 border-yellow-500 bg-yellow-500/10 z-10 pointer-events-none opacity-0"></div>
          
          {/* Rodillo 1 - Establecimiento (001) */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-yellow-700">
            <div 
              ref={reel1Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel1.map((symbol, idx) => (
                <div 
                  key={`reel1-${idx}`}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-red-700 to-red-900 border-b border-yellow-900/50"
                >
                  <div className="text-3xl font-bold text-white">
                    {symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rodillo 2 - Punto de Emisión (001) */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-yellow-700">
            <div 
              ref={reel2Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel2.map((symbol, idx) => (
                <div 
                  key={`reel2-${idx}`}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900 border-b border-yellow-900/50"
                >
                  <div className="text-3xl font-bold text-white">
                    {symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rodillo 3 - Secuencial (000000001) */}
          <div className="flex-1 h-full relative overflow-hidden">
            <div 
              ref={reel3Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel3.map((symbol, idx) => (
                <div 
                  key={`reel3-${idx}`}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-700 to-green-900 border-b border-yellow-900/50"
                >
                  <div className="text-2xl font-bold text-white leading-tight text-center">
                    {symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Parte inferior de la máquina */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-yellow-700 to-yellow-600 flex items-center justify-center">
          {/* Luces decorativas */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={`bottom-light-${i}`}
                className="w-4 h-4 rounded-full bg-yellow-300"
                style={{ 
                  animation: `blink 1s infinite ${i * 0.15}s`,
                  boxShadow: '0 0 10px rgba(255, 255, 0, 0.6)'
                }}
              ></div>
            ))}
          </div>
          <div className="text-lg font-bold text-white text-center mx-8">
            SORTEO DÍA DE LA MADRE
          </div>
        </div>
        
        {/* Palanca lateral */}
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-6 h-16 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-lg"></div>
          <div className="w-4 h-36 bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-full"></div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-lg"></div>
        </div>
        
        {/* Reflejo y brillo en la superficie */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      </div>
      
      {/* Botón de girar */}
      <button
        onClick={spinReels}
        disabled={isSpinning}
        className={`
          px-10 py-4 rounded-full font-bold uppercase tracking-wider relative overflow-hidden
          ${!isSpinning ? 
            'bg-gradient-to-r from-yellow-500 to-red-600 text-white shadow-lg hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 
            'bg-gray-700 text-gray-400 cursor-not-allowed'}
        `}
      >
        {/* Efecto de brillo en el botón */}
        {!isSpinning && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        )}
        
        {isSpinning ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Girando...
          </span>
        ) : 'Girar Ruleta'}
      </button>
      
      {/* CSS para animaciones */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SlotMachineRoulette;