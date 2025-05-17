import React from 'react';

const PrizeSelection = ({ prizes, selectedPrize, onSelectPrize }) => {
  return (
    <div className="h-full">
      <h2 className="text-center text-xl font-bold text-accent mb-4">
        Selecciona un Premio
      </h2>
      <div className="flex flex-col space-y-4">
        {prizes.map((prize) => (
          <button
            key={prize.id}
            className={`
              relative overflow-hidden bg-secondary-purple/60 p-4 rounded-lg text-center
              transition-all duration-300 ease-in-out border-2
              ${selectedPrize && selectedPrize.id === prize.id ? 
                'border-accent shadow-lg shadow-accent/20 transform -translate-y-1' : 
                'border-transparent hover:-translate-y-1 hover:shadow-md'}
            `}
            onClick={() => onSelectPrize(prize)}
          >
            {/* Efecto de brillo al seleccionar */}
            {selectedPrize && selectedPrize.id === prize.id && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            )}
            
            <div className="text-2xl mb-2">🎁</div>
            <h3 className={`font-bold ${selectedPrize && selectedPrize.id === prize.id ? 'text-accent' : 'text-white'}`}>
              {prize.name}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrizeSelection;