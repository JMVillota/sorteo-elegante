// src/components/RouletteWheel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import logoTransparente from '../assets/logo-transparente.png';

const SlotMachineRoulette = ({ participants, onWinnerSelected, currentWinner, allPrizesAwarded, selectedPrize }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  
  const reel1Ref = useRef(null);
  const reel2Ref = useRef(null);
  const reel3Ref = useRef(null);
  const leverRef = useRef(null);
  const leverKnobRef = useRef(null);
  const nameDisplayRef = useRef(null);
  const spinTimerRef = useRef(null);
  const audioRef = useRef(null);
  
  const generateSlotSymbols = () => {
    const symbols = {
      reel1: [], // "FC" part
      reel2: [], // First half of numbers
      reel3: []  // Second half of numbers
    };
    
    for (let i = 0; i < 15; i++) {
      symbols.reel1.push("FC");
      
      const randomNum1 = Math.floor(10000 + Math.random() * 90000).toString();
      const randomNum2 = Math.floor(10000 + Math.random() * 90000).toString();
      
      symbols.reel2.push(randomNum1);
      symbols.reel3.push(randomNum2);
    }
    
    return symbols;
  };
  
  const [reelSymbols, setReelSymbols] = useState(generateSlotSymbols());
  
  useEffect(() => {
    if (currentWinner && !isSpinning) {
      setWinner(null);
      setCurrentParticipant(null);
    }
  }, [currentWinner, isSpinning]);
  
  useEffect(() => {
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
        }),
        leverPull: new Howl({
          src: ['/assets/sounds/lever-pull.mp3'],
          volume: 0.8,
          preload: true
        })
      };
      
      audioRef.current.slotSpin.load();
      audioRef.current.slotStop.load();
      audioRef.current.winnerSound.load();
      audioRef.current.leverPull.load();
    }
    
    const applyInitialEffects = () => {
      [reel1Ref, reel2Ref, reel3Ref].forEach(reelRef => {
        if (reelRef.current) {
          const items = reelRef.current.querySelectorAll('.reel-item');
          
          items.forEach((item, i) => {
            const distanceFromCenter = Math.abs(i - 2);
            const scale = 1 - (distanceFromCenter * 0.05);
            const opacity = 1 - (distanceFromCenter * 0.2);
            
            gsap.set(item, {
              scale,
              opacity,
              rotateX: -distanceFromCenter * 10
            });
          });
        }
      });
    };
    
    applyInitialEffects();
    
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
  
  // Animar la palanca (arriba-abajo)
  const animateLever = () => {
    if (audioRef.current) {
      audioRef.current.leverPull.play();
    }
    
    // Animación de la palanca hacia abajo
    gsap.timeline()
      .to(leverRef.current, {
        y: 30, // Movimiento vertical hacia abajo
        duration: 0.4,
        ease: 'power1.out'
      })
      .to(leverRef.current, {
        y: 0, // Regresa a la posición original
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.2
      });
      
    // Animar el botón (knob) de la palanca
    gsap.timeline()
      .to(leverKnobRef.current, {
        scale: 0.8,
        duration: 0.4,
        ease: 'power1.out'
      })
      .to(leverKnobRef.current, {
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.2
      });
  };
  
  const spinReels = () => {
    if (isSpinning || participants.length === 0 || allPrizesAwarded) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    animateLever();
    
    const randomIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[randomIndex];
    
    if (audioRef.current) {
      audioRef.current.slotSpin.play();
    }
    
    setReelSymbols(generateSlotSymbols());
    
    let nameIndex = 0;
    const nameInterval = setInterval(() => {
      const randomPartIndex = Math.floor(Math.random() * participants.length);
      setCurrentParticipant(participants[randomPartIndex]);
      
      if (nameDisplayRef.current) {
        gsap.fromTo(nameDisplayRef.current, 
          { opacity: 0.7, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.1 }
        );
      }
      
      nameIndex++;
    }, 100);
    
    const winPosition = 2;
    
    const invoiceNumber = selectedWinner.invoiceNumber;
    const fcPart = invoiceNumber.substring(0, 2);
    const part2 = invoiceNumber.substring(2, 6);
    const part3 = invoiceNumber.substring(6);
    
    const newSymbols = {
      reel1: [...reelSymbols.reel1],
      reel2: [...reelSymbols.reel2],
      reel3: [...reelSymbols.reel3]
    };
    
    newSymbols.reel1[winPosition] = fcPart;
    newSymbols.reel2[winPosition] = part2;
    newSymbols.reel3[winPosition] = part3;
    
    setReelSymbols(newSymbols);
    
    const spinReel = (reelRef, delay, duration) => {
      if (!reelRef.current) return;
      
      const numSpins = 30 + Math.floor(Math.random() * 10);
      const itemHeight = reelRef.current.querySelector('.reel-item')?.offsetHeight || 80;
      
      return gsap.to(reelRef.current, {
        y: -(numSpins * 5 * itemHeight),
        duration,
        delay,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(reelRef.current, { y: 0 });
          
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
    
    const tl = gsap.timeline();
    
    tl.add(spinReel(reel1Ref, 0, 2), 0);
    tl.add(spinReel(reel2Ref, 0.3, 2.3), 0);
    tl.add(spinReel(reel3Ref, 0.6, 2.6), 0);
    
    tl.call(() => {
      clearInterval(nameInterval);
      setCurrentParticipant(selectedWinner);
      
      if (audioRef.current) {
        audioRef.current.slotSpin.stop();
        audioRef.current.slotStop.play();
      }
      
      setTimeout(() => {
        setWinner(selectedWinner);
        
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
        
        gsap.fromTo(nameDisplayRef.current, 
          { scale: 1 },
          { 
            scale: 1.05, 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            borderColor: 'rgba(255, 215, 0, 0.8)',
            repeat: 3,
            yoyo: true,
            duration: 0.3
          }
        );
        
        if (audioRef.current) {
          audioRef.current.winnerSound.play();
        }
        
        spinTimerRef.current = setTimeout(() => {
          setIsSpinning(false);
          onWinnerSelected(selectedWinner);
        }, 2000);
      }, 500);
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 py-6 relative">
      {/* Panel informativo del premio actual */}
      <div className="mb-6 bg-red-700 p-4 rounded-xl border border-yellow-300 flex items-center gap-4 w-full max-w-2xl">
        <div className="text-4xl">
          {selectedPrize?.name?.includes("Refrigeradora") ? "🧊" : 
           selectedPrize?.name?.includes("Moto") ? "🛵" : 
           selectedPrize?.name?.includes("Aspiradora") ? "🧹" : "☕"}
        </div>
        <div>
          <h3 className="text-lg font-bold text-yellow-200">Premio actual</h3>
          <p className="text-white text-xl">{selectedPrize?.name || "Selecciona un premio"}</p>
        </div>
      </div>
      
      {/* Mostrar participante actual arriba */}
      <div className="text-center mb-6 h-28 flex flex-col items-center justify-center w-full max-w-2xl">
        <div 
          ref={nameDisplayRef}
          className={`relative bg-red-900 px-8 py-4 rounded-xl border-2 ${winner ? 'border-yellow-300' : 'border-pink-300/40'} transition-all duration-200 backdrop-blur-sm w-full`}
        >
          <div className="text-sm text-yellow-200 mb-1 uppercase tracking-wider">
            PARTICIPANTE
          </div>
          <div className="text-xl font-bold text-white">
            {currentParticipant ? currentParticipant.name : 'Presiona el botón para girar'}
          </div>
          {currentParticipant && (
            <div className="flex justify-between mt-1 text-sm">
              <span className="text-yellow-200">
                Factura: {currentParticipant.invoiceNumber || 'N/A'}
              </span>
              <span className="text-yellow-200">
                Fecha: {currentParticipant.fechaFormateada || 'N/A'}
              </span>
            </div>
          )}
          
          {winner && (
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300/0 via-yellow-300/30 to-yellow-300/0 rounded-xl -z-10 animate-pulse"></div>
          )}
        </div>
      </div>
      
      {/* Máquina tragamonedas con 3 rodillos horizontales */}
      <div className="relative w-full max-w-2xl h-[400px] border-8 border-yellow-700 rounded-xl bg-gradient-to-b from-red-700 to-red-900 mb-8 overflow-visible shadow-[0_0_30px_rgba(255,215,0,0.4)]">
        {/* Parte superior de la máquina */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-yellow-600 to-yellow-700 flex items-center justify-center">
          <div className="text-2xl font-bold text-white text-center tracking-wider drop-shadow-lg">
            SORTEO DÍA DE LA MADRE
          </div>
          <div className="absolute top-0 left-0 right-0 flex justify-between px-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={`top-light-${i}`}
                className="w-4 h-4 rounded-full bg-yellow-300"
                style={{ 
                  animation: `blink 1s infinite ${i * 0.2}s`,
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Contenedor principal de los 3 rodillos */}
        <div className="absolute top-24 inset-x-4 bottom-20 bg-black rounded-lg border-4 border-yellow-600 overflow-hidden flex shadow-inner">
          {/* Línea de gane (horizontal en el centro) */}
          <div className="win-line absolute left-0 right-0 h-[80px] top-1/2 -translate-y-1/2 border-y-2 border-yellow-500 bg-yellow-500/10 z-10 pointer-events-none opacity-0"></div>
          
          {/* Rodillo 1 - FC */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-yellow-600">
            <div 
              ref={reel1Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel1.map((symbol, idx) => (
                <div 
                  key={`reel1-${idx}`}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-red-600 to-red-800 border-b border-yellow-900/50"
                >
                  <div className="text-3xl font-bold text-white">
                    {symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rodillo 2 - Primera parte del número */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-yellow-600">
            <div 
              ref={reel2Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel2.map((symbol, idx) => (
                <div 
                  key={`reel2-${idx}`}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-red-500 to-red-700 border-b border-yellow-900/50"
                >
                  <div className="text-3xl font-bold text-white">
                    {symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rodillo 3 - Segunda parte del número */}
          <div className="flex-1 h-full relative overflow-hidden">
            <div 
              ref={reel3Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel3.map((symbol, idx) => (
                <div 
                  key={`reel3-${idx}`}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-red-400 to-red-600 border-b border-yellow-900/50"
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
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                }}
              ></div>
            ))}
          </div>
          <div className="text-lg font-bold text-white text-center mx-8">
            PRODISPRO 2025
          </div>
        </div>
        
        {/* Palanca lateral vertical con botón para girar */}
        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 z-10">
          <div 
            ref={leverRef} 
            className="flex flex-col items-center transition-transform"
          >
            <div className="w-8 h-40 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full relative">
              {/* Botón en la palanca */}
              <button
                ref={leverKnobRef}
                onClick={spinReels}
                disabled={isSpinning || allPrizesAwarded}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform
                  ${!isSpinning && !allPrizesAwarded ? 
                    'bg-gradient-to-b from-red-500 to-red-700 hover:scale-110 active:scale-95' : 
                    'bg-gradient-to-b from-gray-400 to-gray-600 cursor-not-allowed opacity-70'}`}
              ></button>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-lg"></div>
          </div>
        </div>
        
        {/* Corazones decorativos */}
        <div className="absolute top-[-20px] left-[-20px] w-12 h-12 text-2xl animate-float">❤️</div>
        <div className="absolute bottom-[-15px] right-[-30px] w-10 h-10 text-xl animate-float" style={{ animationDelay: '1.5s' }}>❤️</div>
        
        {/* Mensaje de sorteo completo */}
        {allPrizesAwarded && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
            <div className="bg-red-800 p-6 rounded-xl border-2 border-yellow-300 shadow-lg max-w-md text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-yellow-200 mb-2">¡Sorteo Completo!</h3>
              <p className="text-white">Todos los premios han sido sorteados exitosamente</p>
            </div>
          </div>
        )}
        
        {/* Reflejo y brillo en la superficie */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      </div>
      
      {/* Instrucciones */}
      <div className="text-center text-sm text-white mt-2 mb-4">
        {!allPrizesAwarded ? (
          <p>Presiona el botón rojo de la palanca para girar la ruleta</p>
        ) : (
          <p>El sorteo ha finalizado. ¡Todos los premios han sido otorgados!</p>
        )}
      </div>
      
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default SlotMachineRoulette;