import React from 'react';

const PreviousWinners = ({ winners }) => {
  return (
    <div className="h-full">
      <h2 className="text-center text-xl font-bold text-accent mb-4">
        Ganadores Anteriores
      </h2>
      
      <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
        {winners.length > 0 ? (
          winners.map((winner, index) => (
            <div 
              key={index}
              className="bg-secondary-purple/50 rounded-lg p-3 border border-accent/20 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue to-pink flex items-center justify-center text-sm font-bold">
                  {winner.participant.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate">{winner.participant.name}</h3>
                  <p className="text-xs text-accent/90 truncate">#{winner.participant.ticketNumber}</p>
                  <p className="text-xs text-gray-300 truncate">{winner.prize.name}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 italic p-4">
            Aún no hay ganadores
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousWinners;