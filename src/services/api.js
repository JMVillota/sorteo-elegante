// src/services/api.js
export const getParticipants = async () => {
  try {
    const response = await fetch('http://181.112.37.94:8090/api/sorteo/participantes?mes=05', {
      headers: {
        'x-api-key': 'Prodis$24.'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((participant, index) => ({
      id: index + 1,
      name: participant.NCliente,
      ticketNumber: participant.Documento.replace('FC', ''),
      invoiceNumber: participant.Documento,
      vendedor: participant.Vendedor,
      ciudad: participant.Ciudad,
      fechaFormateada: participant.FechaFormateada || participant.FechaFactura?.split('T')[0] || 'N/A',
      cliente: participant.Cliente,
      valorSinIva: participant.ValorSinIva,
      totalFactura: participant.TotalFactura,
      direccion: participant.Direccion,
      telefono: participant.Telefono,
      parroquia: participant.Parroquia,
      zona: participant.Zona
    }));
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};

export const getPrizes = async () => {
  try {
    const response = await fetch('http://181.112.37.94:8090/api/sorteo/premios', {
      headers: {
        'x-api-key': 'Prodis$24.'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((prize) => ({
      id: prize.Id,
      name: prize.NombrePremio,
      cantidad: prize.Cantidad,
      cantidadOriginal: prize.Cantidad, // Guardamos la cantidad original
      codigoGanador: prize.CodigoGanador,
      imagen: prize.Imagen
    }));
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return [];
  }
};