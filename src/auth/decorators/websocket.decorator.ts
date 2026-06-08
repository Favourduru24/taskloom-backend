import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt.service';
import { WebSocketGuard } from './websocket.guard';

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  jwtService: JwtService,
  configService: ConfigService,
): SocketIOMiddleware => {
  return (client, next) => {
    try {
      WebSocketGuard.validateToken(client, jwtService, configService);
      next();
    } catch (error) {
      next(error);
    }
  };
};
