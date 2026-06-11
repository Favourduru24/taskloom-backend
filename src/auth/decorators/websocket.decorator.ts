import { Socket } from "socket.io";
import { AuthService } from "../auth.service";

export function WebSocketAuthMiddleware(
  authService: AuthService,
) {
  return async (socket: Socket, next: Function) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) return next(new Error('Unauthorized'));

      const user =
        await authService.validateAccessToken(token);

      socket.data.user = user;

      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  };
}