// src/services/api.js
export const getParticipants = async () => {
  try {
    const response = await fetch('http://192.168.2.94:8090/api/sorteo/participantes?mes=05', {
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

export const getPrizes = async () => {
  const prizes = [
    { id: 1, name: "Cafetera E-CHEF (1)", description: "Cafetera premium E-CHEF" },
    { id: 2, name: "Cafetera E-CHEF (2)", description: "Cafetera premium E-CHEF" },
    { id: 3, name: "Cafetera E-CHEF (3)", description: "Cafetera premium E-CHEF" },
    { id: 4, name: "Cafetera E-CHEF (4)", description: "Cafetera premium E-CHEF" },
    { id: 5, name: "Aspiradora Electrolux", description: "Aspiradora de alta potencia" },
    { id: 6, name: "Moto Eléctrica E-FORCE", description: "Moto eléctrica de última generación" },
    { id: 7, name: "Refrigeradora Panorámica", description: "Refrigeradora con vista panorámica" }
  ];
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(prizes);
    }, 300);
  });
};