import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { io, Socket } from 'socket.io-client';
import { useEffect } from 'react';
import { WEBSOCKET_EVENTS } from './websocket.constants';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
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

export function useAuctionSocket(auctionId: number, onBidUpdate: (data: unknown) => void) {
  useEffect(() => {
    const s = getSocket();
    if (auctionId) {
      s.emit(WEBSOCKET_EVENTS.JOIN_AUCTION, auctionId);
      s.on(WEBSOCKET_EVENTS.BID_UPDATE, onBidUpdate);
    }
    return () => {
      if (auctionId) {
        s.emit(WEBSOCKET_EVENTS.LEAVE_AUCTION, auctionId);
        s.off(WEBSOCKET_EVENTS.BID_UPDATE, onBidUpdate);
      }
    };
  }, [auctionId, onBidUpdate]);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(str: string, maxLength: number) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}
