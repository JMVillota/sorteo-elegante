// src/services/api.js
export const getParticipants = async () => {
  try {
    const response = await fetch('81.112.37.94:8090/api/sorteo/participantes?mes=05', {
      headers: {
        'x-api-key': 'Prodis$24.'
      }
    });
    const data = await response.json();
    
    return data.map((participant, index) => ({
      id: index + 1,
      name: participant.NCliente,
      ticketNumber: participant.Documento.replace('FC', ''),
      invoiceNumber: participant.Documento,
      vendedor: participant.Vendedor,
      ciudad: participant.Ciudad,
      fechaFormateada: participant.FechaFormateada || participant.FechaFactura?.split('T')[0] || 'N/A'
    }));
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};

// src/services/api.js
export const getPrizes = async () => {
  const prizes = [
    { id: 1, name: "Cafetera E-CHEF", description: "Cafetera premium E-CHEF", cantidad: 4 },
    { id: 2, name: "Aspiradora Electrolux", description: "Aspiradora de alta potencia", cantidad: 1 },
    { id: 3, name: "Moto Eléctrica E-FORCE", description: "Moto eléctrica de última generación", cantidad: 1 },
    { id: 4, name: "Refrigeradora Panorámica", description: "Refrigeradora con vista panorámica", cantidad: 1 }
  ];
  
  return prizes;
};