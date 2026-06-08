import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from 'src/auth/decorators/websocket.decorator';
  
  @WebSocketGateway({ namespace: 'events'})
  export class EventGateway {
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    @WebSocketServer()
    server: Server;
  
    afterInit(client: Socket) {
      client.use(
        SocketAuthMiddleware(this.jwtService, this.configService) as any,
      );
    }
  
    @SubscribeMessage('message')
    sendChat(chat: ChatResponse) {
      this.server.emit('newChat', chat);
    }
  }
  