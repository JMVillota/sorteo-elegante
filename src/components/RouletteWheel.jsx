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

  const reel1Ref = useRef(null);
  const reel2Ref = useRef(null);
  const reel3Ref = useRef(null);
  const leverRef = useRef(null);
  const leverKnobRef = useRef(null);
  const leverParticlesRef = useRef(null);
  const nameDisplayRef = useRef(null);
  const spinTimerRef = useRef(null);
  const audioRef = useRef(null);

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
        value: invoice.substring(0, 2) // FC
      });

      symbols.reel2.push({
        id: `reel2-${i}-${Date.now() + i}`,
        value: invoice.substring(2, 6) // 4 dígitos
      });

      symbols.reel3.push({
        id: `reel3-${i}-${Date.now() + i}`,
        value: invoice.substring(6) // resto
      });
    }

    return symbols;
  };

  // Inicializar reelSymbols
  const [reelSymbols, setReelSymbols] = useState(generateSlotSymbols());

  // Efecto para inicializar sonidos y animaciones
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = {
        slotSpin: new Howl({
          src: ['/assets/sounds/wheel-spinning.mp3'],
          volume: 0.5,
          loop: true,
          preload: true,
          html5: true
        })
      };

      audioRef.current.slotSpin.load();
    }

    // Animación de la palanca cuando no está girando
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

    // Aplicar efectos iniciales a los rodillos
    const applyInitialEffects = () => {
      [reel1Ref, reel2Ref, reel3Ref].forEach(reelRef => {
        if (reelRef.current) {
          // NO mover inicialmente, dejar en posición 0
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
      if (audioRef.current) {
        Object.values(audioRef.current).forEach(sound => {
          if (sound.playing()) sound.stop();
        });
      }

      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }

      gsap.killTweensOf([leverKnobRef.current, leverParticlesRef.current]);
    };
  }, [isSpinning, isActive]);

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

  // Generar partículas alrededor del botón
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

  // Lógica de giro de la máquina tragamonedas - VERSIÓN ORIGINAL QUE FUNCIONABA
  const spinReels = () => {
    if (isSpinning || participants.length === 0) return;

    // Animar palanca PRIMERO
    animateLever();

    setTimeout(() => {
      setIsSpinning(true);
      setWinner(null);
      onStart();

      // Seleccionar ganador REAL aleatorio de todos los participantes
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];

      // Iniciar sonido cuando comienza a girar
      if (audioRef.current?.slotSpin) {
        audioRef.current.slotSpin.play();
      }

      // Generar nuevos símbolos visuales aleatorios para el efecto
      setReelSymbols(generateSlotSymbols());

      // Mostrar nombres aleatorios mientras gira
      const randomNames = generateRandomNames();
      let nameIndex = 0;
      const nameInterval = setInterval(() => {
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        setDisplayParticipant({ name: randomName });

        if (nameDisplayRef.current) {
          gsap.fromTo(nameDisplayRef.current,
            { opacity: 0.7, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.1 }
          );
        }

        nameIndex++;
      }, 100);

      const winPosition = 2; // Posición central (índice 2)

      // Usar el número de factura real para el resultado final
      const invoiceNumber = selectedWinner.invoiceNumber;
      const fcPart = invoiceNumber.substring(0, 2);
      const part2 = invoiceNumber.substring(2, 6);
      const part3 = invoiceNumber.substring(6);

      // Actualizar los símbolos con el resultado del ganador
      const newSymbols = {
        reel1: [...reelSymbols.reel1],
        reel2: [...reelSymbols.reel2],
        reel3: [...reelSymbols.reel3]
      };

      newSymbols.reel1[winPosition] = { id: `reel1-win-${Date.now()}`, value: fcPart };
      newSymbols.reel2[winPosition] = { id: `reel2-win-${Date.now()}`, value: part2 };
      newSymbols.reel3[winPosition] = { id: `reel3-win-${Date.now()}`, value: part3 };

      setReelSymbols(newSymbols);

      // Función para girar cada rodillo - VERSIÓN ORIGINAL
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
            // Para centrar el elemento en la posición 2 (índice 2):
            // Necesitamos calcular cuánto mover para que el elemento 2 esté en el centro
            // El centro de la ventana está aproximadamente en la mitad de la altura total
            // Si cada elemento tiene 80px de altura, necesitamos mover hacia arriba 1.5 elementos
            // para que el elemento 2 quede centrado
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

      // Girar los rodillos con la duración correcta de 4 segundos total
      tl.add(spinReel(reel1Ref, 0, 3), 0);
      tl.add(spinReel(reel2Ref, 0.3, 3.5), 0);
      tl.add(spinReel(reel3Ref, 0.6, 4), 0);

      tl.call(() => {
        // Detener el ciclo de nombres y mostrar el ganador real
        clearInterval(nameInterval);
        setDisplayParticipant(selectedWinner);

        // Detener sonido
        if (audioRef.current?.slotSpin) {
          audioRef.current.slotSpin.stop();
        }

        setTimeout(() => {
          setWinner(selectedWinner);

          // Animación de la línea ganadora
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

          // Animación del display del participante
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

          spinTimerRef.current = setTimeout(() => {
            setIsSpinning(false);
            onWinnerSelected(selectedWinner);
          }, 2000);
        }, 500);
      });
    }, 200);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Mostrar participante actual arriba */}
      <div className="text-center mb-6 w-full">
        <div
          ref={nameDisplayRef}
          className={`relative bg-prodispro-light-gray px-4 py-3 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm w-full ${showResult
            ? isWinnerRound
              ? 'border-green-500 bg-green-500/10'
              : 'border-yellow-500 bg-yellow-500/10'
            : 'border-prodispro-blue bg-prodispro-blue/10'
            }`}
        >
          <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">
            {showResult
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

          {winner && (
            <div className={`absolute -inset-1 rounded-xl -z-10 animate-pulse ${isWinnerRound
              ? 'bg-gradient-to-r from-green-300/0 via-green-300/30 to-green-300/0'
              : 'bg-gradient-to-r from-yellow-300/0 via-yellow-300/30 to-yellow-300/0'
              }`}></div>
          )}
        </div>
      </div>

      {/* Máquina tragamonedas con 3 rodillos horizontales */}
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
          {/* Línea de gane (horizontal en el centro) */}
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

          {/* Rodillo 2 - Primera parte del número */}
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

          {/* Rodillo 3 - Segunda parte del número */}
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
      {!isActive && !showResult && (
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

      {showResult && (
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

      {/* Instrucciones */}
      <div className="text-center text-sm text-gray-400 mt-4">
        {!isActive && !showResult ? (
          isSpinning ? (
            <p className="animate-pulse">🎰 Girando la máquina... ¡Espera el resultado!</p>
          ) : (
            <p>Presiona el botón azul de la palanca para girar la máquina tragamonedas</p>
          )
        ) : showResult ? (
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