import { Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspaceDto } from './dto/workspace.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Prisma, WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspaceService {

     constructor(private readonly prisma: PrismaService, private readonly logger: LoggerService){}

     async create (userId: string, dto: WorkspaceDto) {
      this.logger.log(`create workspace name ${dto.name} by ${userId}`, 'Workspace service' )
     
       return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {

          const workspace = await tx.workspace.create({
               data: {
                    name: dto.name
               }
          })

          await tx.workspaceMember.create({
               data: {
                    userId,
                    workspaceId: workspace.id,
                    role: WorkspaceRole.ADMIN
               }
          })

          return {workspace: [workspace]}
       })
     }

     async list(userId: string) {
          this.logger.log(`fetching workspace list for ${userId}`);
        
          return await this.prisma.workspace.findMany({
            where: {
              members: {
                some: { userId },
              },
            },
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          });
        }


      async getWorkspaceMember (workspaceId: string, userId: string) {
        this.logger.log(`fetching workspace team list for ${workspaceId}`);

        const member = await this.prisma.workspaceMember.findMany({
          where: {
            userId,
            workspaceId,
          },
          include: {user: true}
        });
         
        if (!member) {
          throw new NotFoundException('User is not a member of this workspace');
        }

        return member
      }
}
