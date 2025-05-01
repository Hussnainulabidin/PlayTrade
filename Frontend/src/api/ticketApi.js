import API from './index';

const ticketApi = {
  // Ticket management
  getAllTickets: (filter = 'all') => API.get(`/tickets?filter=${filter}`),
  getSellerTickets: (sellerId, filter = 'all') => API.get(`/tickets/seller/${sellerId}?filter=${filter}`),
  getTicketById: (id) => API.get(`/tickets/${id}`),
  getClientTickets: (clientId) => API.get(`/tickets/client/${clientId}`),
  getClientTicketById: (clientId, ticketId) => API.get(`/tickets/client/${clientId}/${ticketId}`),
  
  // Ticket actions
  createTicket: (ticketData) => API.post('/tickets', ticketData),
  joinTicket: (ticketId) => API.post(`/tickets/${ticketId}/join`),
  updateTicketStatus: (ticketId, status) => API.patch(`/tickets/${ticketId}/status`, { status }),
  
  // Ticket messages
  addMessage: (ticketId, message) => API.patch(`/tickets/${ticketId}/message`, { message }),
  closeTicket: (ticketId) => API.patch(`/tickets/${ticketId}/status`, { status: 'closed' }),
};

export default ticketApi; 