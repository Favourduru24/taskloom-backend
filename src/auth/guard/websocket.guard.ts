import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { Observable, config } from 'rxjs';
  import { Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class WebSocketGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { Observable, config } from 'rxjs';
  import { Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class WebSocketGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      if (context.getType() !== 'ws') {
        return true;
      }
  
      const client: Socket = context.switchToWs().getClient();
  
      WebSocketGuard.validateToken(client, this.jwtService, this.configService);
  
      return true;
    }
  
    static validateToken(
      client: Socket,
      jwtService: JwtService,
      configService: ConfigService,
    ) {
      try {
        const { authorization } = client.handshake.headers;
  
        const token: string = authorization.split(' ')[1];
        const payload = jwtService.verify(token) as object;
  
        return payload;
      } catch (error) {
        throw new UnauthorizedException();
      }
    }
  }
      if (context.getType() !== 'ws') {
        return true;
      }
  
      const client: Socket = context.switchToWs().getClient();
  
      WebSocketGuard.validateToken(client, this.jwtService, this.configService);
  
      return true;
    }
  
    static validateToken(
      client: Socket,
      jwtService: JwtService,
      configService: ConfigService,
    ) {
      try {
        const { authorization } = client.handshake.headers;
  
        const token: string = authorization.split(' ')[1];
        const payload = jwtService.verify(token) as object;
  
        return payload;
      } catch (error) {
        throw new UnauthorizedException();
      }
    }
  }