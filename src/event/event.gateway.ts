// import {
//     WebSocketGateway,
//     SubscribeMessage,
//     MessageBody,
//     WebSocketServer,
//     OnGatewayInit,
//     ConnectedSocket,
//   } from '@nestjs/websockets';

//   import { Server, Socket } from 'socket.io';
// import { AuthService } from 'src/auth/auth.service';
// import { WebSocketAuthMiddleware } from 'src/auth/decorators/websocket.decorator';

//   type OnlineUser = {
//     userId: string;
//     socketId: string;
//   };

// @WebSocketGateway({ namespace: 'events' })
// export class EventGateway implements OnGatewayInit {
//   constructor(private readonly authService: AuthService) {}

//   @WebSocketServer()
//   server: Server;

//   // ARRAY-BASED ONLINE USERS
//    onlineUsers: OnlineUser[] = [];

//   afterInit(server: Server) {
//     server.use(
//       WebSocketAuthMiddleware(this.authService),
//     );
//   }

//   @SubscribeMessage('message')
//   handleConnection(client: Socket) {
//     console.log('Connected:', client.id);
//   }

//   handleDisconnect(client: Socket) {
//     console.log('Disconnected:', client.id);
//   }

// }
  

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WebSocketAuthMiddleware } from 'src/auth/decorators/websocket.decorator';

type OnlineUser = {
  userId: string;
  socketId: string;
}

@WebSocketGateway({ namespace: 'events', cors: {
  origin: 'http://localhost:3001',
  credentials: true,
},})
export class EventGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(
      WebSocketAuthMiddleware(this.authService),
    );
    console.log('Socket initialized');
  }

  handleConnection(client: Socket) {
    console.log('Connected:', client.id);
    console.log('User:', client.data.user);
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected:', client.id);
  }
}