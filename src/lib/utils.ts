import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { io, Socket } from 'socket.io-client';
import { useEffect } from 'react';

const SOCKET_URL = 'http://localhost:3001';
let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }
  return socket;
}

export function useAuctionSocket(auctionId: number, onBidUpdate: (data: any) => void) {
  useEffect(() => {
    console.log("this has been triggered---------------------------------->>>>>")
    const s = getSocket();
    if (auctionId) {
      s.emit('joinAuction', auctionId);
      s.on('bidUpdate', onBidUpdate);
    }
    return () => {
      if (auctionId) {
        s.emit('leaveAuction', auctionId);
        s.off('bidUpdate', onBidUpdate);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
