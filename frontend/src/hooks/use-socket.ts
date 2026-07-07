import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // If the URL is our API proxy prefix, we just use an empty string for the WS target
    // so socket.io connects to the root hostname and hits our /socket.io/ rewrite cleanly.
    const socketTargetUrl = url === "/api" ? "" : url;
    const socket = io(socketTargetUrl, {
      // By removing `transports: ['websocket']`, the client is allowed to use HTTP Long-Polling
      // which seamlessly passes through Next.js proxy rewrite rules and Ngrok without dropping the connection.
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [url]);

  return { socket: socketRef.current, isConnected };
};
