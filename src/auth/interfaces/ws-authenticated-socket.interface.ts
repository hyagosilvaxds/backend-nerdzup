import { Socket } from 'socket.io';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface WsAuthenticatedSocket extends Socket {
  user: AuthenticatedUser;
}