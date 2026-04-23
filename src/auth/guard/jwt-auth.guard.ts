import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { Request } from "express";
import { Observable } from "rxjs";
import { AppConfiguration } from "src/config/app.config";
import { AuthConfiguration } from "src/config/auth.config";
import { PrismaService } from "src/prisma/prisma.service";
import jwt, { JwtPayload } from 'jsonwebtoken'


 function extractBearerToken(header?: string): string | undefined {
   if(!header) return undefined
    
   const [scheme, token] = header.split(' ')

   if(scheme?.toLowerCase() !== 'bearer' || !token) return undefined
   
   return token
 }

 function getAccessToken(req: Request): string | undefined {
  return (
    extractBearerToken(req.headers['authorization'] as string | undefined) ||
    (req.cookies && typeof req.cookies['access_token'] === 'string'
      ? (req.cookies['access_token'] as string)
      : undefined)
  );
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    
    constructor(
        private readonly prisma: PrismaService,
        @Inject(AuthConfiguration.KEY)
        private readonly authCfg: ConfigType<typeof AuthConfiguration>,
        @Inject(AppConfiguration.KEY)
        private readonly appCfg: ConfigType<typeof AppConfiguration>
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
    
        const req = context.switchToHttp().getRequest<Request>()

        const raw = getAccessToken(req)
     
        if(!raw) {
            throw new UnauthorizedException('Missing bearer token')
        }

        try {
            const payload = jwt.verify(raw, this.authCfg.accessTokenSecret, {
                algorithms: ['HS256'],
                issuer: this.appCfg.apiBaseUrl,
                audience: this.appCfg.clientBaseUrl,
                clockTolerance: 5
            }) as JwtPayload & {sub?: string}

            if(!payload?.sub) {
                throw new UnauthorizedException('Invalid token payload')
            }

            const user = await this.prisma.user.findUnique({where: {id: payload.sub}})

            if(!user) {
                throw new UnauthorizedException('Invalid user')
            }

            (req as any).user = user
            return true

        } catch (error) {
             const msg =
        error instanceof Error && typeof error.message === 'string'
          ? error.message
          : 'Invalid token';
      throw new UnauthorizedException(msg);
    }
        }
}