// src/components/RouletteWheel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';

const RouletteWheel = ({
  participants,
  onWinnerSelected,
  isActive,
  onStart,
  showResult,
  currentWinner,
  isWinnerRound
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayParticipant, setDisplayParticipant] = useState(null);
  const [winner, setWinner] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [resultShown, setResultShown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { width, height } = useWindowSize();

  const reel1Ref = useRef(null);
  const reel2Ref = useRef(null);
  const reel3Ref = useRef(null);
  const leverRef = useRef(null);
  const leverKnobRef = useRef(null);
  const leverParticlesRef = useRef(null);
  const nameDisplayRef = useRef(null);
  const spinTimerRef = useRef(null);
  const audioRef = useRef(null);
  const winnerSoundTimeoutRef = useRef(null);
  const confettiTimeoutRef = useRef(null);

  const SPIN_DURATION = 9.5;
  const WINNER_SOUND_DURATION = 5;
  const ITEM_HEIGHT = 80;
  const VISIBLE_ITEMS = 3;
  
  // IMPORTANTE: Usar siempre el índice 1 como centro (0: arriba, 1: centro, 2: abajo)
  const CENTER_INDEX = 1;

  // Función para inicializar audio
  const initializeAudio = () => {
    if (!audioRef.current && !audioInitialized) {
      console.log('Inicializando audio...');

      audioRef.current = {
        slotSpin: new Howl({
          src: ['/assets/sounds/wheel-spinning.mp3'],
          volume: 0.3,
          loop: false,
          preload: true,
          html5: false,
          onload: () => console.log('Sonido de ruleta cargado correctamente'),
          onloaderror: (id, error) => console.error('Error cargando sonido de ruleta:', error),
          onplay: () => console.log('🎰 Sonido de ruleta INICIADO'),
          onend: () => console.log('🎵 Sonido de ruleta TERMINADO naturalmente'),
          onstop: () => console.log('🛑 Sonido de ruleta DETENIDO manualmente')
        }),
        winner: new Howl({
          src: ['/assets/sounds/winner.mp3'],
          volume: 0.6,
          preload: true,
          html5: false,
          loop: false,
          onload: () => console.log('Sonido de ganador cargado correctamente'),
          onloaderror: (id, error) => console.error('Error cargando sonido de ganador:', error),
          onplay: () => console.log('🎉 Sonido de ganador INICIADO'),
          onend: () => console.log('✅ Sonido de ganador TERMINADO naturalmente'),
          onstop: () => console.log('🛑 Sonido de ganador DETENIDO manualmente')
        })
      };

      setAudioInitialized(true);
    }
  };

  const playSound = (soundKey) => {
    if (audioRef.current && audioRef.current[soundKey]) {
      try {
        const sound = audioRef.current[soundKey];

        if (soundKey === 'slotSpin') {
          if (sound.playing()) sound.stop();
          sound.seek(0);
          sound.play();
        } else if (soundKey === 'winner') {
          if (sound.playing()) sound.stop();
          sound.seek(0);
          sound.play();

          setTimeout(() => {
            if (sound.playing()) {
              sound.stop();
            }
          }, WINNER_SOUND_DURATION * 1000);
        }
      } catch (error) {
        console.error(`Error reproduciendo sonido ${soundKey}:`, error);
      }
    }
  };

  const stopSound = (soundKey) => {
    if (audioRef.current && audioRef.current[soundKey]) {
      try {
        const sound = audioRef.current[soundKey];
        if (sound.playing()) {
          sound.stop();
        }
      } catch (error) {
        console.error(`Error deteniendo sonido ${soundKey}:`, error);
      }
    }
  };

  // Resetear estados cuando cambia la ronda
  useEffect(() => {
    setWinner(null);
    setResultShown(false);
    setDisplayParticipant(null);
    setShowConfetti(false);

    if (winnerSoundTimeoutRef.current) {
      clearTimeout(winnerSoundTimeoutRef.current);
      winnerSoundTimeoutRef.current = null;
    }
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
  }, [isWinnerRound]);

  // Generar símbolos estáticos para los rodillos
  const generateSlotSymbols = () => {
    const symbols = {
      reel1: [],
      reel2: [],
      reel3: []
    };

    // Solo necesitamos 3 elementos fijos siempre visibles
    for (let i = 0; i < 3; i++) {
      symbols.reel1.push({
        id: `reel1-${i}`,
        value: 'FC'
      });

      symbols.reel2.push({
        id: `reel2-${i}`,
        value: '0000'
      });

      symbols.reel3.push({
        id: `reel3-${i}`,
        value: '000000'
      });
    }

    return symbols;
  };

  const [reelSymbols, setReelSymbols] = useState(generateSlotSymbols());

  // Función para aplicar efectos visuales
  const applyReelEffects = (reelRef) => {
    if (!reelRef.current) return;

    const items = reelRef.current.querySelectorAll('.reel-item');
    items.forEach((item, i) => {
      const isCenter = i === CENTER_INDEX;
      const scale = isCenter ? 1 : 0.85;
      const opacity = isCenter ? 1 : 0.6;
      const zIndex = isCenter ? 10 : 1;

      gsap.set(item, {
        scale,
        opacity,
        zIndex
      });
    });
  };

  // Efecto para inicializar audio
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Efecto para animaciones iniciales
  useEffect(() => {
    if (leverKnobRef.current && !isSpinning && !isActive) {
      gsap.to(leverKnobRef.current, {
        y: -3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      if (leverParticlesRef.current) {
        gsap.to(leverParticlesRef.current, {
          opacity: 0.4,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }

    // Aplicar efectos iniciales
    [reel1Ref, reel2Ref, reel3Ref].forEach(reelRef => {
      if (reelRef.current) {
        // IMPORTANTE: Centrar en posición 0 (sin offset inicial)
        gsap.set(reelRef.current, { y: 0 });
        applyReelEffects(reelRef);
      }
    });

    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
      if (winnerSoundTimeoutRef.current) {
        clearTimeout(winnerSoundTimeoutRef.current);
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
      gsap.killTweensOf([leverKnobRef.current, leverParticlesRef.current]);
    };
  }, [isSpinning, isActive]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        Object.values(audioRef.current).forEach(sound => {
          if (sound.playing()) {
            sound.stop();
          }
          sound.unload();
        });
      }
    };
  }, []);

  // Animar la palanca
  const animateLever = () => {
    gsap.killTweensOf([leverKnobRef.current, leverRef.current]);

    gsap.timeline()
      .to(leverRef.current, {
        y: 30,
        duration: 0.4,
        ease: 'power1.out'
      })
      .to(leverRef.current, {
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.2
      });

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

    if (leverParticlesRef.current) {
      const particles = leverParticlesRef.current.querySelectorAll('div');
      particles.forEach((particle, i) => {
        const angle = (i / particles.length) * 2 * Math.PI;
        const distance = 40 + Math.random() * 20;

        gsap.timeline()
          .to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
          })
          .set(particle, {
            x: 0,
            y: 0,
            opacity: 1
          });
      });
    }
  };

  const generateParticles = () => {
    return [...Array(10)].map((_, i) => {
      const angle = (i / 10) * 2 * Math.PI;
      const radius = 22;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return (
        <div
          key={`particle-${i}-${Date.now()}`}
          className="absolute w-2 h-2 rounded-full bg-prodispro-blue/70 shadow-glow"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            animation: `pulse 1.5s infinite ${i * 0.2}s`,
            boxShadow: '0 0 5px 2px rgba(1, 155, 220, 0.3)'
          }}
        />
      );
    });
  };

  // Lógica de giro SIMPLIFICADA Y CORREGIDA
  const spinReels = () => {
    if (isSpinning || participants.length === 0) return;

    console.log('🎯 INICIANDO NUEVO GIRO');

    if (!audioInitialized) {
      initializeAudio();
    }

    // Resetear estados
    setWinner(null);
    setResultShown(false);
    setShowConfetti(false);

    // Animar palanca
    animateLever();

    setTimeout(() => {
      setIsSpinning(true);
      onStart();

      // Seleccionar ganador REAL aleatorio
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];

      console.log('🎰 Ganador seleccionado:', selectedWinner.name);

      // Reproducir sonido
      playSound('slotSpin');

      // Mostrar nombres aleatorios mientras gira
      const randomNames = [
        "MARÍA GONZÁLEZ", "CARLOS RODRÍGUEZ", "ANA MARTÍN", "JOSÉ FERNÁNDEZ", 
        "LAURA JIMÉNEZ", "DAVID ÁLVAREZ", "ELENA ROMERO", "MIGUEL TORRES"
      ];
      
      const nameInterval = setInterval(() => {
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        setDisplayParticipant({ name: randomName });

        if (nameDisplayRef.current) {
          gsap.fromTo(nameDisplayRef.current,
            { opacity: 0.7, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.1 }
          );
        }
      }, 150);

      // Configurar resultado final DIRECTAMENTE en el centro
      const invoiceNumber = selectedWinner.invoiceNumber;
      const fcPart = invoiceNumber.substring(0, 2);
      const part2 = invoiceNumber.substring(2, 6);
      const part3 = invoiceNumber.substring(6);

      // Función para animar giro SIN CAMBIAR LA POSICIÓN FINAL
      const spinReel = (reelRef, finalValue, delay, duration) => {
        if (!reelRef.current) return;

        // Crear animación de giro visual
        const timeline = gsap.timeline();
        
        // Girar visualmente pero SIN MOVER la posición
        timeline.to(reelRef.current, {
          rotationY: 360 * 3, // 3 vueltas completas
          duration,
          delay,
          ease: "power2.inOut",
          onComplete: () => {
            // Al terminar, actualizar SOLO el contenido del centro
            const centerItem = reelRef.current.querySelector(`.reel-item:nth-child(${CENTER_INDEX + 1})`);
            if (centerItem) {
              const valueElement = centerItem.querySelector('.symbol-value');
              if (valueElement) {
                valueElement.textContent = finalValue;
                
                // Resaltar el elemento ganador
                gsap.to(centerItem, {
                  backgroundColor: isWinnerRound ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
                  boxShadow: `0 0 10px ${isWinnerRound ? 'rgba(34, 197, 94, 0.5)' : 'rgba(234, 179, 8, 0.5)'} inset`,
                  duration: 0.3
                });
              }
            }
            
            // Resetear rotación
            gsap.set(reelRef.current, { rotationY: 0 });
            applyReelEffects(reelRef);
          }
        });

        return timeline;
      };

      const tl = gsap.timeline();

      // Girar los rodillos
      tl.add(spinReel(reel1Ref, fcPart, 0, 6.5), 0);
      tl.add(spinReel(reel2Ref, part2, 0.5, 7.5), 0);
      tl.add(spinReel(reel3Ref, part3, 1, 8.5), 0);

      // Después de que terminen los rodillos
      tl.call(() => {
        console.log('🛑 SONIDO DE RULETA TERMINADO');

        // Detener nombres aleatorios
        clearInterval(nameInterval);
        setDisplayParticipant(selectedWinner);

        // Detener sonido de ruleta
        setTimeout(() => {
          if (audioRef.current?.slotSpin && audioRef.current.slotSpin.playing()) {
            stopSound('slotSpin');
          }
        }, 100);

        // Mostrar resultado
        setTimeout(() => {
          setWinner(selectedWinner);
          setResultShown(true);

          // Animaciones del resultado
          gsap.fromTo(".win-line",
            { opacity: 0, scaleY: 0 },
            { opacity: 1, scaleY: 1, duration: 0.3, repeat: 3, yoyo: true }
          );

          // Si es ganador: confeti y sonido
          if (isWinnerRound && audioInitialized) {
            winnerSoundTimeoutRef.current = setTimeout(() => {
              setShowConfetti(true);
              playSound('winner');

              confettiTimeoutRef.current = setTimeout(() => {
                setShowConfetti(false);
              }, WINNER_SOUND_DURATION * 1000);
            }, 800);
          }

          // Finalizar
          spinTimerRef.current = setTimeout(() => {
            setIsSpinning(false);
            onWinnerSelected(selectedWinner);
          }, 2000);
        }, 500);
      }, null, 10);

    }, 200);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* CONFETI */}
      {showConfetti && isWinnerRound && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={true}
          colors={['#019BDC', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#F97316']}
        />
      )}

      {/* Mostrar participante actual */}
      <div className="text-center mb-6 w-full">
        <div
          ref={nameDisplayRef}
          className={`relative bg-prodispro-light-gray px-4 py-3 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm w-full ${resultShown
              ? isWinnerRound
                ? 'border-green-500 bg-green-500/10'
                : 'border-yellow-500 bg-yellow-500/10'
              : 'border-prodispro-blue bg-prodispro-blue/10'
            }`}
        >
          <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
            {resultShown
              ? isWinnerRound ? '🏆 GANADOR' : '❌ PERDEDOR'
              : isSpinning ? 'SELECCIONANDO...' : 'PARTICIPANTE'
            }
          </div>
          <div className="text-lg font-bold text-white">
            {displayParticipant ? displayParticipant.name : 'Presiona el botón para girar'}
          </div>
          {displayParticipant && displayParticipant.invoiceNumber && (
            <div className="flex flex-wrap justify-between mt-1 text-xs">
              <span className="text-gray-400">
                Factura: {displayParticipant.invoiceNumber}
              </span>
              <span className="text-gray-400">
                Ciudad: {displayParticipant.ciudad || 'N/A'}
              </span>
              {displayParticipant.vendedor && (
                <span className="text-gray-400">
                  Vendedor: {displayParticipant.vendedor}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Máquina tragamonedas SIMPLIFICADA */}
      <div className="relative w-full border-8 border-prodispro-blue rounded-xl bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray mb-6 overflow-visible shadow-[0_0_30px_rgba(1,155,220,0.4)]" style={{ height: '400px' }}>
        
        {/* Parte superior */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-prodispro-blue to-prodispro-blue/80 flex items-center justify-center">
          <div className="text-xl font-bold text-white text-center tracking-wider drop-shadow-lg">
            PRODISPRO SORTEO
          </div>
          <div className="absolute top-0 left-0 right-0 flex justify-between px-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={`top-light-${i}`}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white"
                style={{
                  animation: `blink 1s infinite ${i * 0.2}s`,
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Contenedor principal FIJO CON 3 ELEMENTOS */}
        <div 
          className="absolute top-20 inset-x-4 bottom-16 bg-black rounded-lg border-4 border-prodispro-blue overflow-hidden flex shadow-inner"
          style={{ height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px` }}
        >
          
          {/* Línea de gane EXACTAMENTE EN EL CENTRO */}
          <div 
            className={`win-line absolute left-0 right-0 z-10 pointer-events-none opacity-0 ${
              isWinnerRound ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'
            }`}
            style={{
              top: `${ITEM_HEIGHT}px`, // Exactamente en el segundo elemento
              height: `${ITEM_HEIGHT}px`,
              borderTop: '2px solid',
              borderBottom: '2px solid'
            }}
          ></div>

          {/* Rodillo 1 */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-prodispro-blue">
            <div
              ref={reel1Ref}
              className="absolute inset-x-0 w-full"
              style={{ top: '0px' }}
            >
              {[0, 1, 2].map((index) => (
                <div
                  key={`reel1-${index}`}
                  className="reel-item w-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray border-b border-prodispro-blue/50"
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <div className="symbol-value text-3xl font-bold text-prodispro-blue">
                    FC
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodillo 2 */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-prodispro-blue">
            <div
              ref={reel2Ref}
              className="absolute inset-x-0 w-full"
              style={{ top: '0px' }}
            >
              {[0, 1, 2].map((index) => (
                <div
                  key={`reel2-${index}`}
                  className="reel-item w-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray border-b border-prodispro-blue/50"
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <div className="symbol-value text-3xl font-bold text-prodispro-blue">
                    0000
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodillo 3 */}
          <div className="flex-1 h-full relative overflow-hidden">
            <div
              ref={reel3Ref}
              className="absolute inset-x-0 w-full"
              style={{ top: '0px' }}
            >
              {[0, 1, 2].map((index) => (
                <div
                  key={`reel3-${index}`}
                  className="reel-item w-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray border-b border-prodispro-blue/50"
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <div className="symbol-value text-2xl font-bold text-prodispro-blue leading-tight text-center">
                    000000
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-prodispro-blue/80 to-prodispro-blue flex items-center justify-center">
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={`bottom-light-${i}`}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white"
                style={{
                  animation: `blink 1s infinite ${i * 0.15}s`,
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
                }}
              ></div>
            ))}
          </div>
          <div className="text-sm md:text-lg font-bold text-white text-center mx-8">
            PRODISPRO 2025
          </div>
        </div>

        {/* Palanca */}
        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 z-10">
          <div ref={leverRef} className="flex flex-col items-center transition-transform">
            <div className="w-8 h-40 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full relative">
              <button
                ref={leverKnobRef}
                onClick={spinReels}
                disabled={isSpinning || isActive}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform
                 ${!isSpinning && !isActive ?
                    'bg-gradient-to-b from-prodispro-blue to-prodispro-blue/80 hover:scale-110 active:scale-95 cursor-pointer' :
                    'bg-gradient-to-b from-gray-400 to-gray-600 cursor-not-allowed opacity-70'}`}
              >
                <div ref={leverParticlesRef} className="absolute inset-0 pointer-events-none">
                  {!isSpinning && !isActive && generateParticles()}
                </div>
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-lg"></div>
          </div>
        </div>

        {/* Efectos de superficie */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,155,220,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      </div>

      {/* Botón móvil */}
      {!isActive && !resultShown && (
        <button
          onClick={spinReels}
          disabled={isSpinning}
          className={`lg:hidden w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isSpinning
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-prodispro-blue hover:bg-prodispro-blue/80 hover:scale-105'
            }`}
        >
          {isSpinning ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Girando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🎰</span>
              <span>Girar Máquina</span>
            </div>
          )}
        </button>
      )}

      {resultShown && (
        <div className="text-center mt-4">
          <div className={`text-lg font-bold ${isWinnerRound ? 'text-green-400' : 'text-yellow-400'}`}>
            {isWinnerRound ? '🎉 ¡Felicitaciones! 🎉' : '💪 ¡Sigue participando!'}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Continuando en 3 segundos...
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-400 mt-4">
        {!isActive && !resultShown ? (
          isSpinning ? (
            <p className="animate-pulse">🎰 Girando la máquina... ¡Espera el resultado!</p>
          ) : (
            <p>Presiona el botón azul de la palanca para girar la máquina tragamonedas</p>
          )
        ) : resultShown ? (<p>Resultado mostrado. Continuando automáticamente...</p>
       ) : null}
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
      
      .shadow-glow {
        filter: drop-shadow(0 0 2px rgba(1, 155, 220, 0.7));
      }
    `}</style>
   </div>
 );
};

export default RouletteWheel;