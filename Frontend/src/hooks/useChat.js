import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const useChat = (chatData) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Auto-scroll to newest messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch chat messages from API
  const fetchChatMessages = async () => {
    if (!chatData || !chatData.id) {
      console.error("Cannot fetch chat messages: chatData or chatData.id is missing");
      return;
    }
    
    try {
      // Use the chat ID if it exists, otherwise use the order ID
      const chatId = chatData.chat?.id || chatData.id;
      console.log("Fetching chat messages for ID:", chatId, "using:", chatData.chat ? "chat ID" : "order ID");
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Cannot fetch chat messages: token is missing");
        return;
      }
      
      const endpoint = chatData.chat?.id
        ? `http://localhost:3003/chats/${chatId}`
        : `http://localhost:3003/chats/order/${chatId}`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        // Handle both formats: data.messages or data.chat.messages
        const responseMessages = response.data.data.messages || 
                               (response.data.data.chat ? response.data.data.chat.messages : []);
                               
        // If we got messages, set them
        if (responseMessages && Array.isArray(responseMessages)) {
          setMessages(responseMessages);
          // Scroll to bottom
          scrollToBottom();
        } else {
          console.log("No messages found or invalid format");
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    }
  };

  // Handle sending messages
  const sendMessage = async (content) => {
    if (!content.trim() || !chatData) {
      console.log("Message empty or chatData not available");
      return;
    }
    
    const chatId = chatData.chat?.id || chatData.id;
    const isUsingChatId = !!chatData.chat?.id;
    
    try {
      // Check if socket is connected first
      if (socketRef.current && socketRef.current.connected) {
        console.log("Sending message via socket");
        socketRef.current.emit('sendMessage', {
          chatId: chatId,
          content: content
        });
      } else {
        // Fall back to REST API if socket is not connected
        console.log("Socket not connected, sending via REST API");
        const endpoint = isUsingChatId
          ? `http://localhost:3003/chats/${chatId}/messages`
          : `http://localhost:3003/chats/order/${chatId}/messages`;
          
        const response = await axios.post(
          endpoint, 
          { content: content },
          { 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.status === 'success') {
          const newMessage = response.data.data.message;
          const formattedMessage = {
            ...newMessage,
            sender: newMessage.sender
          };
          
          setMessages(prev => [...prev, formattedMessage]);
          scrollToBottom();
        }
      }
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  // Handle typing status
  const handleTyping = (isTypingStatus) => {
    if (socketRef.current && socketRef.current.connected && chatData) {
      const chatId = chatData.chat?.id || chatData.id;
      socketRef.current.emit('typing', {
        chatId: chatId,
        isTyping: isTypingStatus
      });
    }
  };

  // Socket connection setup
  useEffect(() => {
    if (!chatData) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    let socketInstance;
    try {
      socketInstance = io('http://localhost:3003', {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      socketRef.current = socketInstance;
    } catch (err) {
      console.error("Error creating socket instance:", err);
      return;
    }
    
    // Handle connection
    socketInstance.on('connect', () => {
      setIsConnected(true);
      const chatId = chatData.chat?.id || chatData.id;
      socketInstance.emit('joinChat', chatId);
      fetchChatMessages();
    });
    
    // Handle connection error
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
    
    // Handle new messages
    socketInstance.on('newMessage', (data) => {
      if (data.chatId) {
        setMessages(prev => {
          const newMsg = {
            ...data.message,
            sender: data.message.sender || {
              _id: data.message.sender._id,
              username: data.message.sender.username
            }
          };
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
    });
    
    // Handle typing indicator
    socketInstance.on('userTyping', (data) => {
      if (data.chatId) {
        setIsTyping(data.isTyping);
      }
    });
    
    // Handle disconnection
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });
    
    return () => {
      if (socketInstance) {
        try {
          socketInstance.emit('leaveChat', chatData.id);
          socketInstance.disconnect();
        } catch (err) {
          console.error("Error disconnecting socket:", err);
        }
      }
    };
  }, [chatData]);

  return {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    handleTyping,
    messagesEndRef,
  };
};

export default useChat; 