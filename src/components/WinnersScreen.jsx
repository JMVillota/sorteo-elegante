// src/components/RouletteWheel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Howl } from 'howler';

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

  // NUEVA DURACIÓN: 12.5 segundos
  const SPIN_DURATION = 12.5; // segundos

  // Función para inicializar audio
  const initializeAudio = () => {
    if (!audioRef.current && !audioInitialized) {
      console.log('Inicializando audio...');
      
      audioRef.current = {
        slotSpin: new Howl({
          src: ['/assets/sounds/wheel-spinning.mp3'],
          volume: 0.3,
          loop: false, // Cambiado a false para que reproduzca una sola vez
          preload: true,
          html5: false,
          onload: () => {
            console.log('Sonido de ruleta cargado correctamente');
          },
          onloaderror: (id, error) => {
            console.error('Error cargando sonido de ruleta:', error);
          },
          onplay: () => {
            console.log('🎰 Sonido de ruleta INICIADO (12.5 segundos)');
          },
          onend: () => {
            console.log('🎵 Sonido de ruleta TERMINADO naturalmente');
          },
          onstop: () => {
            console.log('🛑 Sonido de ruleta DETENIDO manualmente');
          }
        }),
        winner: new Howl({
          src: ['/assets/sounds/winner.mp3'],
          volume: 0.6,
          preload: true,
          html5: false,
          loop: false,
          onload: () => {
            console.log('Sonido de ganador cargado correctamente');
          },
          onloaderror: (id, error) => {
            console.error('Error cargando sonido de ganador:', error);
          },
          onplay: () => {
            console.log('🎉 Sonido de ganador INICIADO');
          },
          onend: () => {
            console.log('✅ Sonido de ganador TERMINADO naturalmente');
          },
          onstop: () => {
            console.log('🛑 Sonido de ganador DETENIDO manualmente');
          }
        })
      };

      setAudioInitialized(true);
    }
  };

  // Función para reproducir sonido de forma segura
  const playSound = (soundKey) => {
    if (audioRef.current && audioRef.current[soundKey]) {
      try {
        const sound = audioRef.current[soundKey];
        
        if (soundKey === 'slotSpin') {
          // Detener si ya está reproduciendo
          if (sound.playing()) {
            sound.stop();
          }
          // Reproducir desde el inicio
          sound.seek(0);
          sound.play();
          console.log('▶️ REPRODUCIENDO sonido de ruleta (12.5s completos)');
        } else if (soundKey === 'winner') {
          // Para el sonido de ganador, siempre reproducir desde el inicio
          if (sound.playing()) {
            sound.stop();
          }
          sound.seek(0);
          sound.play();
          console.log('🎊 REPRODUCIENDO sonido de ganador');
        }
      } catch (error) {
        console.error(`Error reproduciendo sonido ${soundKey}:`, error);
      }
    } else {
      console.warn(`Sonido ${soundKey} no está disponible`);
    }
  };

  // Función para detener sonido
  const stopSound = (soundKey) => {
    if (audioRef.current && audioRef.current[soundKey]) {
      try {
        const sound = audioRef.current[soundKey];
        if (sound.playing()) {
          sound.stop();
          console.log(`⏹️ Sonido ${soundKey} detenido`);
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
    
    // Limpiar timeouts pendientes
    if (winnerSoundTimeoutRef.current) {
      clearTimeout(winnerSoundTimeoutRef.current);
      winnerSoundTimeoutRef.current = null;
    }
  }, [isWinnerRound]);

  // Generar facturas aleatorias para el efecto visual
  const generateRandomInvoices = () => {
    const invoices = [];
    for (let i = 0; i < 50; i++) {
      const randomNum = Math.floor(1000000000 + Math.random() * 900000000);
      invoices.push(`FC${randomNum}`);
    }
    return invoices;
  };

  // Generar nombres aleatorios para el efecto visual
  const generateRandomNames = () => {
    const nombres = [
      "MARÍA GONZÁLEZ LÓPEZ", "CARLOS RODRÍGUEZ PÉREZ", "ANA MARTÍN GARCÍA",
      "JOSÉ FERNÁNDEZ RUIZ", "LAURA JIMÉNEZ MORENO", "DAVID ÁLVAREZ CASTRO",
      "ELENA ROMERO ORTIZ", "MIGUEL TORRES HERRERA", "SOFIA RAMOS DELGADO",
      "ANTONIO VARGAS MEDINA", "PATRICIA GUERRERO SANTOS", "FRANCISCO MENDOZA SILVA",
      "CARMEN AGUILAR RIVAS", "RAFAEL MORALES CORTÉS", "ISABEL CRUZ NAVARRO",
      "MANUEL IGLESIAS VEGA", "BEATRIZ SERRANO CAMPOS", "PABLO RUBIO PRIETO",
      "CRISTINA MOLINA IBÁÑEZ", "FERNANDO PASTOR CANO", "ROCÍO GALLEGO MÁRQUEZ",
      "SERGIO LEON CALVO", "MÓNICA HERRERO PASCUAL", "EDUARDO HIDALGO DOMÍNGUEZ",
      "SILVIA CABALLERO BLANCO", "JORGE SANTIAGO PEÑA", "NURIA BENÍTEZ CARMONA",
      "ÁLVARO MONTERO ESPINOZA", "GLORIA FUENTES VALDÉS", "RAÚL CONTRERAS ROJAS"
    ];
    return nombres;
  };

  // Generar símbolos para los rodillos con facturas reales
  const generateSlotSymbols = () => {
    const randomInvoices = generateRandomInvoices();
    const symbols = {
      reel1: [],
      reel2: [],
      reel3: []
    };

    for (let i = 0; i < 15; i++) {
      const invoice = randomInvoices[i % randomInvoices.length];

      symbols.reel1.push({
        id: `reel1-${i}-${Date.now() + i}`,
        value: invoice.substring(0, 2)
      });

      symbols.reel2.push({
        id: `reel2-${i}-${Date.now() + i}`,
        value: invoice.substring(2, 6)
      });

      symbols.reel3.push({
        id: `reel3-${i}-${Date.now() + i}`,
        value: invoice.substring(6)
      });
    }

    return symbols;
  };

  const [reelSymbols, setReelSymbols] = useState(generateSlotSymbols());

  // Efecto para inicializar audio en el primer clic del usuario
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

    const applyInitialEffects = () => {
      [reel1Ref, reel2Ref, reel3Ref].forEach(reelRef => {
        if (reelRef.current) {
          gsap.set(reelRef.current, { y: 0 });

          const items = reelRef.current.querySelectorAll('.reel-item');
          items.forEach((item, i) => {
            const distanceFromCenter = Math.abs(i - 2);
            const scale = 1 - (distanceFromCenter * 0.05);
            const opacity = 1 - (distanceFromCenter * 0.2);

            gsap.set(item, {
              scale,
              opacity: Math.max(0.3, opacity),
              rotateX: -distanceFromCenter * 10
            });
          });
        }
      });
    };

    applyInitialEffects();

    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
      if (winnerSoundTimeoutRef.current) {
        clearTimeout(winnerSoundTimeoutRef.current);
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

  // Lógica de giro CON DURACIÓN DE 12.5 SEGUNDOS
  const spinReels = () => {
    if (isSpinning || participants.length === 0) return;

    console.log('🎯 INICIANDO NUEVO GIRO (12.5 segundos)');
    console.log('🎯 Es ronda ganadora:', isWinnerRound);

    // Inicializar audio si no está inicializado
    if (!audioInitialized) {
      initializeAudio();
    }

    // Resetear estados
    setWinner(null);
    setResultShown(false);

    // Animar palanca
    animateLever();

    setTimeout(() => {
      setIsSpinning(true);
      onStart();

      // Seleccionar ganador REAL aleatorio
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];

      console.log('🎰 EMPEZANDO SONIDO DE RULETA (12.5 segundos completos)');
      
      // Reproducir sonido de giro completo
      playSound('slotSpin');

      // Generar nuevos símbolos visuales aleatorios
      setReelSymbols(generateSlotSymbols());

      // Mostrar nombres aleatorios mientras gira (durante más tiempo)
      const randomNames = generateRandomNames();
      const nameInterval = setInterval(() => {
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        setDisplayParticipant({ name: randomName });

        if (nameDisplayRef.current) {
          gsap.fromTo(nameDisplayRef.current,
            { opacity: 0.7, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.1 }
          );
        }
      }, 150); // Cambiado a 150ms para que sea más lento y dramático

      const winPosition = 2;

      // Configurar resultado final
      const invoiceNumber = selectedWinner.invoiceNumber;
      const fcPart = invoiceNumber.substring(0, 2);
      const part2 = invoiceNumber.substring(2, 6);
      const part3 = invoiceNumber.substring(6);

      const newSymbols = {
        reel1: [...reelSymbols.reel1],
        reel2: [...reelSymbols.reel2],
        reel3: [...reelSymbols.reel3]
      };

      newSymbols.reel1[winPosition] = { id: `reel1-win-${Date.now()}`, value: fcPart };
      newSymbols.reel2[winPosition] = { id: `reel2-win-${Date.now()}`, value: part2 };
      newSymbols.reel3[winPosition] = { id: `reel3-win-${Date.now()}`, value: part3 };

      setReelSymbols(newSymbols);

      // Función para girar cada rodillo con nueva duración
      const spinReel = (reelRef, delay, duration) => {
        if (!reelRef.current) return;

        // Más vueltas para que dure más tiempo
        const numSpins = 80 + Math.floor(Math.random() * 20); // Aumentado para más vueltas
        const itemHeight = reelRef.current.querySelector('.reel-item')?.offsetHeight || 80;

        return gsap.to(reelRef.current, {
          y: -(numSpins * 5 * itemHeight),
          duration,
          delay,
          ease: "power2.inOut",
          onComplete: () => {
            const centerOffset = -((winPosition - 1.5) * itemHeight);
            gsap.set(reelRef.current, { y: centerOffset });

            const items = reelRef.current.querySelectorAll('.reel-item');
            items.forEach((item, i) => {
              const distanceFromCenter = Math.abs(i - winPosition);
              const scale = 1 - (distanceFromCenter * 0.05);
              const opacity = 1 - (distanceFromCenter * 0.2);

              gsap.to(item, {
                scale,
                opacity: Math.max(0.3, opacity),
                rotateX: -distanceFromCenter * 10,
                duration: 0.3
              });

              if (i === winPosition) {
                gsap.to(item, {
                  backgroundColor: isWinnerRound ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
                  boxShadow: `0 0 10px ${isWinnerRound ? 'rgba(34, 197, 94, 0.5)' : 'rgba(234, 179, 8, 0.5)'} inset`,
                  duration: 0.3
                });
              }
            });
          }
        });
      };

      const tl = gsap.timeline();

      // Girar los rodillos con nueva duración (12.5 segundos total)
      // Cada rodillo termina en momentos ligeramente diferentes para mayor suspense
      tl.add(spinReel(reel1Ref, 0, 10.5), 0);        // Primer rodillo para a los 10.5s
      tl.add(spinReel(reel2Ref, 0.5, 11.5), 0);      // Segundo rodillo para a los 12s
      tl.add(spinReel(reel3Ref, 1, 12.5), 0);        // Tercer rodillo para a los 12.5s

      // DESPUÉS de que terminen los rodillos (12.5 segundos)
      tl.call(() => {
        console.log('🛑 SONIDO DE RULETA TERMINADO (12.5s completos)');
        
        // 1. Detener nombres aleatorios y mostrar ganador real
        clearInterval(nameInterval);
        setDisplayParticipant(selectedWinner);

        // 2. El sonido de ruleta debería terminar naturalmente aquí
        // Pero por si acaso, nos aseguramos de que esté detenido
        setTimeout(() => {
          if (audioRef.current?.slotSpin && audioRef.current.slotSpin.playing()) {
            stopSound('slotSpin');
          }
        }, 100);

        // 3. Pequeña pausa antes de mostrar resultado
        setTimeout(() => {
          console.log('📋 MOSTRANDO RESULTADO');
          setWinner(selectedWinner);
          setResultShown(true);

          // 4. Animaciones del resultado
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
              boxShadow: isWinnerRound ? '0 0 20px rgba(34, 197, 94, 0.8)' : '0 0 20px rgba(234, 179, 8, 0.8)',
              backgroundColor: isWinnerRound ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              borderColor: isWinnerRound ? 'rgba(34, 197, 94, 0.8)' : 'rgba(234, 179, 8, 0.8)',
              repeat: 3,
              yoyo: true,
              duration: 0.3
            }
          );

          // 5. SOLO AHORA reproducir sonido de ganador SI es ronda ganadora
          if (isWinnerRound && audioInitialized) {
            console.log('🎊 ES GANADOR! Reproduciendo sonido de victoria en 800ms...');
            winnerSoundTimeoutRef.current = setTimeout(() => {
              playSound('winner');
            }, 800); // Delay para sincronizar con animaciones
          } else {
            console.log('❌ Es perdedor, NO se reproduce sonido de ganador');
          }

          // 6. Finalizar después de 2 segundos más
          spinTimerRef.current = setTimeout(() => {
            setIsSpinning(false);
            onWinnerSelected(selectedWinner);
          }, 2000);
        }, 500);
      }, null, 12.5); // Exactamente a los 12.5 segundos

    }, 200);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Panel de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-800 rounded text-xs">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={() => playSound('slotSpin')} 
              className="px-2 py-1 bg-blue-500 rounded"
            >
              Test Spin (12.5s)
            </button>
            <button 
              onClick={() => stopSound('slotSpin')} 
              className="px-2 py-1 bg-red-500 rounded"
            >
              Stop Spin
            </button>
            <button 
              onClick={() => playSound('winner')} 
              className="px-2 py-1 bg-green-500 rounded"
            >
              Test Winner
            </button>
            <button 
              onClick={() => stopSound('winner')} 
              className="px-2 py-1 bg-red-500 rounded"
            >
              Stop Winner
            </button>
          </div>
          <div className="text-white">
            Audio: {audioInitialized ? '✅' : '❌'} | 
            Winner Round: {isWinnerRound ? '🏆' : '❌'} | 
            Spinning: {isSpinning ? '🎰' : '⏸️'} |
            Result Shown: {resultShown ? '📋' : '⏳'} |
            Duration: {SPIN_DURATION}s
          </div>
        </div>
      )}

      {/* Mostrar participante actual */}
      <div className="text-center mb-6 w-full">
        <div
          ref={nameDisplayRef}
          className={`relative bg-prodispro-light-gray px-4 py-3 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm w-full ${
            resultShown
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
            </div>
          )}

          {winner && resultShown && (
            <div className={`absolute -inset-1 rounded-xl -z-10 animate-pulse ${isWinnerRound
              ? 'bg-gradient-to-r from-green-300/0 via-green-300/30 to-green-300/0'
              : 'bg-gradient-to-r from-yellow-300/0 via-yellow-300/30 to-yellow-300/0'
              }`}></div>
          )}
        </div>
      </div>

      {/* Máquina tragamonedas */}
      <div className="relative w-full border-8 border-prodispro-blue rounded-xl bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray mb-6 overflow-visible shadow-[0_0_30px_rgba(1,155,220,0.4)]" style={{ height: '400px' }}>
        {/* Parte superior de la máquina */}
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

        {/* Contenedor principal de los 3 rodillos */}
        <div className="absolute top-20 inset-x-4 bottom-16 bg-black rounded-lg border-4 border-prodispro-blue overflow-hidden flex shadow-inner">
          {/* Línea de gane */}
          <div className={`win-line absolute left-0 right-0 h-[80px] top-1/2 -translate-y-1/2 border-y-2 z-10 pointer-events-none opacity-0 ${isWinnerRound ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'
            }`}></div>

          {/* Rodillo 1 - FC */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-prodispro-blue">
            <div
              ref={reel1Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel1.map((symbol) => (
                <div
                  key={symbol.id}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray border-b border-prodispro-blue/50"
                >
                  <div className="text-3xl font-bold text-prodispro-blue">
                    {symbol.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodillo 2 */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-prodispro-blue">
            <div
              ref={reel2Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel2.map((symbol) => (
                <div
                  key={symbol.id}
                  className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray border-b border-prodispro-blue/50"
                >
                  <div className="text-3xl font-bold text-prodispro-blue">
                    {symbol.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodillo 3 */}
          <div className="flex-1 h-full relative overflow-hidden">
            <div
              ref={reel3Ref}
              className="absolute inset-x-0 w-full transition-transform will-change-transform"
            >
              {reelSymbols.reel3.map((symbol) => (
                <div
                  key={symbol.id}
                 className="reel-item h-[80px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray border-b border-prodispro-blue/50"
               >
                 <div className="text-2xl font-bold text-prodispro-blue leading-tight text-center">
                   {symbol.value}
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Parte inferior de la máquina */}
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

       {/* Palanca lateral vertical con botón para girar */}
       <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 z-10">
         <div
           ref={leverRef}
           className="flex flex-col items-center transition-transform"
         >
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
               <div
                 ref={leverParticlesRef}
                 className="absolute inset-0 pointer-events-none"
               >
                 {!isSpinning && !isActive && generateParticles()}
               </div>
             </button>
           </div>
           <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-lg"></div>
         </div>
       </div>

       {/* Reflejo y brillo en la superficie */}
       <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,155,220,0.1)_0%,transparent_70%)] pointer-events-none"></div>
     </div>

     {/* Botón de girar alternativo para móviles */}
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
             <span>Girando... ({SPIN_DURATION}s)</span>
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
         <div className={`text-lg font-bold ${isWinnerRound ? 'text-green-400' : 'text-yellow-400'
           }`}>
           {isWinnerRound ? '🎉 ¡Felicitaciones! 🎉' : '💪 ¡Sigue participando!'}
         </div>
         <div className="text-sm text-gray-400 mt-2">
           Continuando en 3 segundos...
         </div>
       </div>
     )}

     {/* Instrucciones con tiempo actualizado */}
     <div className="text-center text-sm text-gray-400 mt-4">
       {!isActive && !resultShown ? (
         isSpinning ? (
           <p className="animate-pulse">🎰 Girando la máquina por {SPIN_DURATION} segundos... ¡Espera el resultado!</p>
         ) : (
           <p>Presiona el botón azul de la palanca para girar la máquina tragamonedas</p>
         )
       ) : resultShown ? (
         <p>Resultado mostrado. Continuando automáticamente...</p>
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