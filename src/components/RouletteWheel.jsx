// src/components/RouletteWheel.jsx - COMPLETO CON RESPONSIVIDAD MEJORADA
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import logoProdispro from '../assets/logo-prodispro.svg';
import iconProdispro from '../assets/images/icon.png';

const RouletteWheel = ({
  participants,
  onWinnerSelected,
  isActive,
  onStart,
  showResult,
  currentWinner,
  isWinnerRound,
  compact = false,
  onParticipantChange = null
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
  const isWinnerRoundRef = useRef(isWinnerRound);

  const SPIN_DURATION = 9.5;
  const WINNER_SOUND_DURATION = 5;
  const CENTER_INDEX = 0;

  const initializeAudio = () => {
    if (!audioRef.current && !audioInitialized) {
      audioRef.current = {
        slotSpin: new Howl({
          src: ['/assets/sounds/wheel-spinning.mp3'],
          volume: 0.3,
          loop: false,
          preload: true,
          html5: false,
        }),
        winner: new Howl({
          src: ['/assets/sounds/winner.mp3'],
          volume: 0.6,
          preload: true,
          html5: false,
          loop: false,
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
            if (sound.playing()) sound.stop();
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
        if (sound.playing()) sound.stop();
      } catch (error) {
        console.error(`Error deteniendo sonido ${soundKey}:`, error);
      }
    }
  };

  useEffect(() => {
    setWinner(null);
    setResultShown(false);
    setDisplayParticipant(null);
    setShowConfetti(false);
    if (onParticipantChange) onParticipantChange(null);

    if (winnerSoundTimeoutRef.current) {
      clearTimeout(winnerSoundTimeoutRef.current);
      winnerSoundTimeoutRef.current = null;
    }
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    isWinnerRoundRef.current = isWinnerRound;
  }, [isWinnerRound]);

  const generateSlotSymbols = () => ({
    reel1: [{ id: 'reel1-0', value: 'FC' }],
    reel2: [{ id: 'reel2-0', value: '0000' }],
    reel3: [{ id: 'reel3-0', value: '000000' }]
  });

  const [reelSymbols, setReelSymbols] = useState(generateSlotSymbols());

  const applyReelEffects = (reelRef) => {
    if (!reelRef.current) return;
    const items = reelRef.current.querySelectorAll('.reel-item');
    items.forEach((item) => {
      gsap.set(item, { scale: 1, opacity: 1, zIndex: 10 });
    });
  };

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

    [reel1Ref, reel2Ref, reel3Ref].forEach(reelRef => {
      if (reelRef.current) {
        gsap.set(reelRef.current, { y: 0 });
        applyReelEffects(reelRef);
      }
    });

    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      if (winnerSoundTimeoutRef.current) clearTimeout(winnerSoundTimeoutRef.current);
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
      gsap.killTweensOf([leverKnobRef.current, leverParticlesRef.current]);
    };
  }, [isSpinning, isActive]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        Object.values(audioRef.current).forEach(sound => {
          if (sound.playing()) sound.stop();
          sound.unload();
        });
      }
    };
  }, []);

  const animateLever = () => {
    gsap.killTweensOf([leverKnobRef.current, leverRef.current]);

    gsap.timeline()
      .to(leverRef.current, { y: 30, duration: 0.4, ease: 'power1.out' })
      .to(leverRef.current, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', delay: 0.2 });

    gsap.timeline()
      .to(leverKnobRef.current, { scale: 0.8, duration: 0.4, ease: 'power1.out' })
      .to(leverKnobRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.3)', delay: 0.2 });

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
          .set(particle, { x: 0, y: 0, opacity: 1 });
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

  // Función para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const spinReels = () => {
    if (isSpinning || participants.length === 0) return;

    if (!audioInitialized) initializeAudio();

    setWinner(null);
    setResultShown(false);
    setShowConfetti(false);

    animateLever();

    setTimeout(() => {
      setIsSpinning(true);
      onStart();

      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];

      playSound('slotSpin');

      const participantInterval = setInterval(() => {
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
        setDisplayParticipant(randomParticipant);
        if (onParticipantChange) onParticipantChange(randomParticipant);

        if (nameDisplayRef.current) {
          gsap.fromTo(nameDisplayRef.current,
            { opacity: 0.7, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.1 }
          );
        }
      }, 120);

      const invoiceNumber = selectedWinner.invoiceNumber;
      const fcPart = invoiceNumber.substring(0, 2);
      const part2 = invoiceNumber.substring(2, 6);
      const part3 = invoiceNumber.substring(6);

      const spinReel = (reelRef, finalValue, delay, duration) => {
        if (!reelRef.current) return;

        const timeline = gsap.timeline();
        
        timeline.to(reelRef.current, {
          rotationY: 360 * 3,
          duration,
          delay,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(reelRef.current, { rotationY: 0 });
            applyReelEffects(reelRef);

            const centerItem = reelRef.current.querySelector('.reel-item');
            if (!centerItem) return;
            const circle     = centerItem.querySelector('.symbol-circle');
            const iconEl     = centerItem.querySelector('.symbol-icon');
            const valueEl    = centerItem.querySelector('.symbol-value');
            if (!circle || !iconEl || !valueEl) return;

            // Volteo: primera mitad oculta (rotY 0→90), swap, segunda mitad revela (rotY -90→0)
            gsap.to(circle, {
              rotationY: 90,
              duration: 0.22,
              ease: 'power2.in',
              onComplete: () => {
                // swap: ocultar icono, mostrar número
                iconEl.classList.add('hidden');
                valueEl.textContent = finalValue;
                valueEl.classList.remove('hidden');

                // color del círculo según resultado — leer ref para valor siempre actual
                const winner = isWinnerRoundRef.current;
                circle.style.background = winner
                  ? 'linear-gradient(135deg,#d1fae5,#6ee7b7)'
                  : 'linear-gradient(135deg,#fee2e2,#fca5a5)';
                circle.style.boxShadow = winner
                  ? '0 4px 20px rgba(16,185,129,0.5), 0 0 0 3px rgba(16,185,129,0.3)'
                  : '0 4px 20px rgba(239,68,68,0.5), 0 0 0 3px rgba(239,68,68,0.3)';

                // segunda mitad: revelar
                gsap.fromTo(circle,
                  { rotationY: -90 },
                  { rotationY: 0, duration: 0.28, ease: 'power2.out' }
                );
              }
            });
          }
        });

        return timeline;
      };

      const tl = gsap.timeline();

      tl.add(spinReel(reel1Ref, fcPart, 0, 6.5), 0);
      tl.add(spinReel(reel2Ref, part2, 0.5, 7.5), 0);
      tl.add(spinReel(reel3Ref, part3, 1, 8.5), 0);

      tl.call(() => {
        clearInterval(participantInterval);
        setDisplayParticipant(selectedWinner);
        if (onParticipantChange) onParticipantChange(selectedWinner);

        setTimeout(() => {
          if (audioRef.current?.slotSpin && audioRef.current.slotSpin.playing()) {
            stopSound('slotSpin');
          }
        }, 100);

        setTimeout(() => {
          setWinner(selectedWinner);
          setResultShown(true);

          gsap.fromTo(".win-line",
            { opacity: 0, scaleY: 0 },
            { opacity: 1, scaleY: 1, duration: 0.5, repeat: 3, yoyo: true }
          );

          if (isWinnerRound && audioInitialized) {
            winnerSoundTimeoutRef.current = setTimeout(() => {
              setShowConfetti(true);
              playSound('winner');

              confettiTimeoutRef.current = setTimeout(() => {
                setShowConfetti(false);
              }, WINNER_SOUND_DURATION * 1000);
            }, 800);
          }

          spinTimerRef.current = setTimeout(() => {
            setIsSpinning(false);
            onWinnerSelected(selectedWinner);
          }, 2000);
        }, 500);
      }, null, 10);

    }, 200);
  };

  return (
    <div className={`relative ${compact ? 'w-full h-full flex flex-col' : 'w-full flex flex-col items-center justify-center'}`}>
      {showConfetti && isWinnerRound && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={true}
          colors={['#019BDC', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#F97316']}
        />
      )}

      {/* Información del participante */}
      <div className={`text-center mb-3 w-full px-2 ${compact ? 'hidden' : ''}`}>
        <div
          ref={nameDisplayRef}
          className={`relative bg-slate-800/90 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 transition-all duration-200 backdrop-blur-sm w-full ${
            resultShown
              ? isWinnerRound
                ? 'border-green-500 bg-green-500/10'
                : 'border-red-500 bg-red-500/10'
              : 'border-prodispro-blue bg-prodispro-blue/10'
          }`}
          style={{ 
            minHeight: '100px', // Móvil
            '@media (min-width: 640px)': { minHeight: '120px' }, // SM
            '@media (min-width: 768px)': { minHeight: '140px' }, // MD
            '@media (min-width: 1024px)': { minHeight: '160px' }  // LG
          }}
        >
          <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 uppercase tracking-wider">
            {resultShown
              ? isWinnerRound ? '🏆 GANADOR' : '❌ ELIMINADO'
              : isSpinning ? 'SELECCIONANDO...' : 'PARTICIPANTE'
            }
          </div>
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 truncate">
            {displayParticipant ? truncateText(displayParticipant.name, 25) : 'Presiona para girar'}
          </div>
          {displayParticipant && (
            <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
              <div className="text-gray-400 min-w-0">
                <span className="block">📄 Factura:</span>
                <span className="font-mono text-prodispro-blue truncate block text-xs sm:text-sm">{displayParticipant.invoiceNumber}</span>
              </div>
              <div className="text-gray-400 min-w-0">
                <span className="block">📍 Ciudad:</span>
                <span className="text-white truncate block text-xs sm:text-sm">{truncateText(displayParticipant.ciudad, 12)}</span>
              </div>
              <div className="text-gray-400 min-w-0 col-span-2 sm:col-span-1">
                <span className="block">👤 Vendedor:</span>
                <span className="text-white truncate block text-xs sm:text-sm">{truncateText(displayParticipant.vendedor || 'N/A', 12)}</span>
              </div>
              <div className="text-gray-400 min-w-0 col-span-2 sm:col-span-1">
                <span className="block">📅 Fecha:</span>
                <span className="text-white truncate block text-xs sm:text-sm">{displayParticipant.fechaFormateada}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Máquina tragamonedas - RESPONSIVA COMPLETA */}
      <div
        onClick={() => { if (!isSpinning && !isActive) spinReels(); }}
        className={`relative border-2 border-prodispro-blue rounded-xl bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray shadow-[0_0_30px_rgba(1,155,220,0.4)] ${compact ? 'w-full h-full flex flex-col' : 'w-full max-w-2xl mx-auto mb-2'} ${!isSpinning && !isActive ? 'cursor-pointer' : 'cursor-default'}`}
      >
        
        {/* Header */}
        <div className="w-full h-8 sm:h-10 md:h-12 lg:h-16 bg-gradient-to-b from-prodispro-blue to-prodispro-blue/80 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-1 md:top-2 left-0 right-0 flex justify-between px-2 md:px-3 z-10">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={`top-light-${i}`}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-white"
                style={{
                  animation: `blink 1s infinite ${i * 0.2}s`,
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                }}
              ></div>
            ))}
          </div>
          <div className="marquee-container w-full overflow-hidden">
            <div className="marquee-track whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-xl font-bold text-white tracking-wider drop-shadow-lg">
              {Array(6).fill('Prodispro Cia. Ltda. · No ser los más grandes pero sí los mejores · ').join('')}
            </div>
          </div>
        </div>

        {/* Área principal de rodillos */}
        <div
          className={`w-full bg-black flex relative ${compact ? 'flex-1 min-h-0' : ''}`}
          style={compact ? {} : { height: 'clamp(180px, 32vw, 420px)' }}
        >
          {/* Logo SVG — fondo estático tenue, siempre */}
          <img
            src={logoProdispro}
            alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 0, padding: '8%', opacity: 0.12 }}
          />


          <div
            className={`win-line absolute left-0 right-0 z-10 pointer-events-none opacity-0 ${
              isWinnerRound ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
            }`}
            style={{
              top: '8px',
              bottom: '8px',
              borderTop: '2px solid',
              borderBottom: '2px solid'
            }}
          ></div>

          {/* Rodillo 1 */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-prodispro-blue" style={{zIndex:1}}>
            <div ref={reel1Ref} className="absolute inset-0 w-full">
              <div className="reel-item w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray">
                <div className="symbol-circle">
                  <img src={iconProdispro} alt="" className={`symbol-icon${showResult ? ' hidden' : ''}`} />
                  <span className={`symbol-value${showResult ? '' : ' hidden'}`}>FC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodillo 2 */}
          <div className="flex-1 h-full relative overflow-hidden border-r-2 border-prodispro-blue" style={{zIndex:1}}>
            <div ref={reel2Ref} className="absolute inset-0 w-full">
              <div className="reel-item w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray">
                <div className="symbol-circle">
                  <img src={iconProdispro} alt="" className={`symbol-icon${showResult ? ' hidden' : ''}`} />
                  <span className={`symbol-value${showResult ? '' : ' hidden'}`}>0000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodillo 3 */}
          <div className="flex-1 h-full relative overflow-hidden" style={{zIndex:1}}>
            <div ref={reel3Ref} className="absolute inset-0 w-full">
              <div className="reel-item w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-prodispro-gray to-prodispro-light-gray">
                <div className="symbol-circle">
                  <img src={iconProdispro} alt="" className={`symbol-icon${showResult ? ' hidden' : ''}`} />
                  <span className={`symbol-value${showResult ? '' : ' hidden'}`}>000000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full h-6 sm:h-8 md:h-10 lg:h-12 bg-gradient-to-b from-prodispro-blue/80 to-prodispro-blue flex items-center justify-center relative overflow-hidden">
          <div className="absolute bottom-1 md:bottom-2 left-0 right-0 flex justify-between px-2 md:px-3 z-10">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={`bottom-light-${i}`}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-white"
                style={{
                  animation: `blink 1s infinite ${i * 0.15}s`,
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                }}
              ></div>
            ))}
          </div>
          <div className="marquee-container w-full overflow-hidden">
            <div className="marquee-track marquee-reverse whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white tracking-wider drop-shadow-lg">
              {Array(6).fill('PRODISPRO 2025 · Sistema de Sorteos · ').join('')}
            </div>
          </div>
        </div>

        {/* Palanca - Solo visible en desktop (lg+) */}
        <div className="hidden lg:block absolute -right-12 xl:-right-16 top-1/2 -translate-y-1/2 z-10">
          <div ref={leverRef} className="flex flex-col items-center transition-transform">
            <div className="w-6 xl:w-8 h-32 xl:h-40 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full relative">
              <button
                ref={leverKnobRef}
                onClick={spinReels}
                disabled={isSpinning || isActive}
                className={`absolute bottom-3 xl:bottom-4 left-1/2 -translate-x-1/2 w-10 xl:w-12 h-10 xl:h-12 rounded-full shadow-lg transition-all duration-300 transform
                 ${!isSpinning && !isActive ?
                    'bg-gradient-to-b from-prodispro-blue to-prodispro-blue/80 hover:scale-110 active:scale-95 cursor-pointer' :
                    'bg-gradient-to-b from-gray-400 to-gray-600 cursor-not-allowed opacity-70'}`}
              >
                <div ref={leverParticlesRef} className="absolute inset-0 pointer-events-none">
                  {!isSpinning && !isActive && generateParticles()}
                </div>
              </button>
            </div>
            <div className="w-8 xl:w-10 h-8 xl:h-10 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-lg"></div>
          </div>
        </div>

        {/* Efectos de superficie */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,155,220,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      </div>

      {/* Botón móvil */}
      <div className={`w-full px-2 ${compact ? 'hidden' : 'block lg:hidden'}`}>
        <button
          onClick={spinReels}
          disabled={isSpinning || isActive}
          className={`w-full max-w-md mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 ${isSpinning || isActive
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-prodispro-blue hover:bg-prodispro-blue/80 hover:scale-105'
            }`}
        >
          {isSpinning ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Girando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🎰</span>
              <span>Girar Máquina</span>
            </div>
          )}
        </button>
      </div>

      {/* Resultado mostrado */}
      {resultShown && !compact && (
        <div className="text-center mt-3">
          <div className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold ${isWinnerRound ? 'text-green-400' : 'text-red-400'}`}>
            {isWinnerRound ? '🎉 ¡Felicitaciones! 🎉' : '❌ ¡Eliminado!'}
          </div>
          <div className="text-xs sm:text-sm md:text-base text-gray-400 mt-1 md:mt-2">
            Continuando en 3 segundos...
          </div>
        </div>
      )}

      {/* Texto informativo */}
      <div className={`text-center text-xs text-gray-400 mt-1 px-4 ${compact ? 'hidden' : ''}`}>
        {!isActive && !resultShown ? (
          isSpinning ? (
            <p className="animate-pulse">🎰 Girando la máquina... ¡Espera el resultado!</p>
          ) : (
            <p>
              <span className="hidden lg:inline">Presiona la palanca</span>
              <span className="lg:hidden">Presiona el botón</span>
              {' '}para girar la máquina tragamonedas
            </p>
          )
        ) : resultShown ? (
          <p>Resultado mostrado. Continuando automáticamente...</p>
        ) : null}
      </div>

      <style>{`
        /* Perspectiva 3D para el volteo del círculo */
        .reel-item { perspective: 400px; }

        /* Círculo blanco en cada rodillo */
        .symbol-circle {
          width: clamp(64px, 14vw, 130px);
          height: clamp(64px, 14vw, 130px);
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(1,155,220,0.35), 0 0 0 3px rgba(1,155,220,0.25);
          flex-shrink: 0;
          overflow: hidden;
        }
        .symbol-icon {
          width: 80%;
          height: 80%;
          object-fit: contain;
        }
        .symbol-value {
          font-weight: 800;
          color: #019BDC;
          font-size: clamp(0.75rem, 2.8vw, 1.5rem);
          text-align: center;
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .hidden { display: none; }


        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .marquee-container {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .marquee-track {
          display: inline-block;
          animation: marquee 18s linear infinite;
        }

        .marquee-reverse {
          animation: marquee-reverse 22s linear infinite;
        }

        .shadow-glow {
          filter: drop-shadow(0 0 2px rgba(1, 155, 220, 0.7));
        }

        /* Mejora para la altura dinámica del display */
        @media (max-width: 640px) {
          .participant-display {
            min-height: 100px;
          }
        }
        
        @media (min-width: 640px) and (max-width: 768px) {
          .participant-display {
            min-height: 120px;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .participant-display {
            min-height: 140px;
          }
        }
        
        @media (min-width: 1024px) {
          .participant-display {
            min-height: 160px;
          }
        }

      `}</style>
    </div>
  );
};

export default RouletteWheel;