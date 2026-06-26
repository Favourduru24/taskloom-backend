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
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WebSocketAuthMiddleware } from 'src/auth/decorators/websocket.decorator';
import { WorkspaceService } from 'src/workspace/workspace.service';

type Presence = {
  userId: string;
  socketId: string;
  workspaceId: string;
};

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

  private onlineUsers: Presence[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService
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

  @SubscribeMessage('workspace:join')
  async handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    
    const socketId = client.id
    const userId = client.data.user?.id;
    const workspaceId = data.workspaceId

    await this.workspaceService.getWorkspaceMember(userId, workspaceId);
    
    client.join(`workspace:${workspaceId}`);

    this.onlineUsers = this.onlineUsers.filter(
      u => u.socketId !== socketId,
    );

    this.onlineUsers.push({
      userId,
      socketId,
      workspaceId,
    });

    client.emit('workspace:joined', {
      workspaceId,
    });

    const onlineCollaborators =
  this.onlineUsers
    .filter(
      u => u.workspaceId === workspaceId
    )
    .map(u => u.userId);

    this.server
  .to(`workspace:${workspaceId}`)
  .emit(
    "workspace:online-users",
    onlineCollaborators
  );
    
   console.log(
      `${client.id} joined ${data.workspaceId}`,
    );
  }

@SubscribeMessage("workspace:leave")
handleLeaveWorkspace(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { workspaceId: string },
) {

  const workspaceId = data.workspaceId;

  client.leave(
    `workspace:${workspaceId}`
  );

  this.onlineUsers =
  this.onlineUsers.filter(
    u => u.socketId !== client.id
  );

 const collaborators = [
  ...new Set(
    this.onlineUsers
      .filter(
        u => u.workspaceId === workspaceId
      )
      .map(u => u.userId)
  ),
];
 
this.server
  .to(`workspace:${workspaceId}`)
  .emit(
    "workspace:online-users",
    collaborators
  );

  console.log(
    `${client.id} left ${workspaceId}`,
  );

} 

async emitTasksCreated(senderId: string, workspaceId: string, task: any) {
  const sender = this.onlineUsers.find(
    (u) => u.userId === senderId
  );

  const senderSocketId = sender?.socketId;
  
  if (senderSocketId) {
    this.server
      .to(`workspace:${workspaceId}`)
      .except(senderSocketId)
      .emit("task:new", task);
  } else {
    this.server.to(`workspace:${workspaceId}`).emit("task:new", task);
  } 

}

async emitTaskUpdated(
  senderId: string,
  workspaceId: string,
  task: any,
) {
  const sender = this.onlineUsers.find(
    (u) => u.userId === senderId,
  );

  const senderSocketId = sender?.socketId;

  if (senderSocketId) {
    this.server
      .to(`workspace:${workspaceId}`)
      .except(senderSocketId)
      .emit("task:updated", task);
  } else {
    this.server
      .to(`workspace:${workspaceId}`)
      .emit("task:updated", task);
  }
}

async emitTaskDeleted(
  senderId: string,
  workspaceId: string,
  taskId: string,
) {
  const sender = this.onlineUsers.find(
    (u) => u.userId === senderId,
  );

  const senderSocketId = sender?.socketId;

  if (senderSocketId) {
    this.server
      .to(`workspace:${workspaceId}`)
      .except(senderSocketId)
      .emit("task:deleted", { taskId });
  } else {
    this.server
      .to(`workspace:${workspaceId}`)
      .emit("task:deleted", { taskId });
  }
}

}