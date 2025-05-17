import React, { useState, useEffect, useRef } from 'react';
import logoTransparente from '../assets/logo-transparente.png';

const RouletteWheel = ({ participants, onWinnerSelected }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);
  const nameDisplayRef = useRef(null);
  
  // Función para hacer girar la ruleta
  const spinWheel = () => {
    if (isSpinning || participants.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Seleccionar ganador aleatorio
    const randomIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[randomIndex];
    
    // Animación de nombres
    let nameIndex = 0;
    const nameInterval = setInterval(() => {
      const randomPartIndex = Math.floor(Math.random() * participants.length);
      setCurrentParticipant(participants[randomPartIndex]);
      nameIndex++;
    }, 100);
    
    // Animar la ruleta - duración exacta de 4 segundos
    if (wheelRef.current) {
      const rotations = 5; // Rotaciones suficientes para 4 segundos
      const degrees = rotations * 360 + Math.floor(Math.random() * 360);
      
      wheelRef.current.style.transition = `transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)`;
      wheelRef.current.style.transform = `rotate(${degrees}deg)`;
    }
    
    // Detener la animación después de 4 segundos exactos
    setTimeout(() => {
      clearInterval(nameInterval);
      setCurrentParticipant(selectedWinner);
      setWinner(selectedWinner);
      
      if (nameDisplayRef.current) {
        nameDisplayRef.current.classList.add('winner-reveal');
      }
      
      setTimeout(() => {
        setIsSpinning(false);
        onWinnerSelected(selectedWinner);
      }, 1000);
    }, 4000);
  };

  // Número reducido de segmentos para la ruleta
  const segmentCount = 12; // Solo 12 segmentos en lugar de 37

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Mostrar participante actual arriba */}
      <div className="text-center mb-10 h-24 flex flex-col items-center justify-center">
        <div 
          ref={nameDisplayRef}
          className={`bg-purple-900/80 px-8 py-4 rounded-xl border border-yellow-400/20 transition-all duration-200 transform backdrop-blur-sm
                     ${winner ? 'winner-reveal bg-gradient-to-r from-yellow-400/70 to-pink-500/70 border-yellow-400 shadow-lg shadow-yellow-400/30 scale-110' : ''}`}
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
              #{currentParticipant.ticketNumber}
            </div>
          )}
        </div>
      </div>
      
      {/* Ruleta simplificada */}
      <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] mb-12">
        {/* Borde exterior dorado */}
        <div className="absolute inset-0 rounded-full overflow-hidden border-[6px] border-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.4)]"></div>
        
        {/* Marcador en la parte superior */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-600 filter drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]"></div>
        </div>
        
        {/* Ruleta giratoria */}
        <div 
          ref={wheelRef}
          className="absolute inset-[15px] rounded-full overflow-hidden border-[3px] border-yellow-600"
        >
          {/* Segmentos de la ruleta alternando rojo y negro */}
          {Array(segmentCount).fill().map((_, index) => {
            const isRed = index % 2 === 0;
            const segmentAngle = 360 / segmentCount;
            const rotation = index * segmentAngle;
            
            return (
              <div 
                key={`segment-${index}`}
                className={`absolute top-0 left-0 w-full h-full ${isRed ? 'bg-red-600' : 'bg-black'} origin-center`}
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0, ${50 + 50 * Math.cos(Math.PI * (index + 1) * 2 / segmentCount)}% ${50 + 50 * Math.sin(Math.PI * (index + 1) * 2 / segmentCount)}%)`,
                }}
              >
                {/* Línea divisoria dorada */}
                <div className="absolute top-0 left-1/2 w-[2px] h-[100%] bg-yellow-600/80"></div>
              </div>
            );
          })}
          
          {/* Anillo interior dorado */}
          <div className="absolute inset-[32%] rounded-full bg-yellow-600/30 border-[3px] border-yellow-600 z-10"></div>
          
          {/* Centro con logo Prodispro */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] rounded-full bg-purple-900 z-20 flex items-center justify-center border-2 border-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
            <div className="w-[80%] h-[80%] flex items-center justify-center">
              <img 
                src={logoTransparente} 
                alt="Prodispro" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón de girar */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`
          px-10 py-4 rounded-full font-bold uppercase tracking-wider
          ${!isSpinning ? 
            'bg-gradient-to-r from-yellow-500 to-red-600 text-white shadow-lg hover:-translate-y-1 transition-all duration-300' : 
            'bg-gray-700 text-gray-400 cursor-not-allowed'}
        `}
      >
        {isSpinning ? 'Girando...' : 'Girar Ruleta'}
      </button>
      
      {/* CSS adicional */}
      <style jsx>{`
        @keyframes winner-pulse {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(250, 204, 21, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(250, 204, 21, 0.7); }
          100% { transform: scale(1); box-shadow: 0 0 10px rgba(250, 204, 21, 0.5); }
        }
        
        .winner-reveal {
          animation: winner-pulse 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default RouletteWheel;