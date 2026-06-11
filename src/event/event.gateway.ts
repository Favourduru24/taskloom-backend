import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayInit,
    ConnectedSocket,
  } from '@nestjs/websockets';

  import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WebSocketAuthMiddleware } from 'src/auth/decorators/websocket.decorator';


@WebSocketGateway({ namespace: 'events' })
export class EventGateway implements OnGatewayInit {
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(
      WebSocketAuthMiddleware(this.authService),
    );
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = client.data.user;

    this.server.emit('newChat', {
      userId: user.id,
      data,
    });
  }
}
  