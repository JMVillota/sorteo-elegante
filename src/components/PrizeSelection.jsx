import React from 'react';

const PrizeSelection = ({ prizes, selectedPrize, onSelectPrize, awardedPrizes = [] }) => {
  return (
    <div className="h-full">
      <h2 className="text-center text-xl font-bold text-accent mb-4">
        Selecciona un Premio
      </h2>
      <div className="flex flex-col space-y-4">
        {prizes.map((prize) => {
          const isAwarded = awardedPrizes.includes(prize.id);
          
          return (
            <button
              key={prize.id}
              className={`
                relative overflow-hidden bg-secondary-purple/60 p-4 rounded-lg text-center
                transition-all duration-300 ease-in-out border-2
                ${isAwarded ? 
                  'opacity-75 cursor-not-allowed border-transparent' : 
                  selectedPrize && selectedPrize.id === prize.id ? 
                    'border-accent shadow-lg shadow-accent/20 transform -translate-y-1' : 
                    'border-transparent hover:-translate-y-1 hover:shadow-md'}
              `}
              onClick={() => !isAwarded && onSelectPrize(prize)}
              disabled={isAwarded}
            >
              {selectedPrize && selectedPrize.id === prize.id && !isAwarded && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
              )}
              
              {isAwarded && (
                <div className="absolute -right-8 top-0 bg-green-600 text-white font-bold py-1 px-8 transform rotate-45 shadow-md z-10 text-sm">
                  GANADO
                </div>
              )}
              
              <div className="text-2xl mb-2">{isAwarded ? "✅" : "🎁"}</div>
              <h3 className={`font-bold ${selectedPrize && selectedPrize.id === prize.id && !isAwarded ? 'text-accent' : 'text-white'}`}>
                {prize.name}
              </h3>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default PrizeSelection;