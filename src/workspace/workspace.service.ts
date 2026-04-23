import { Injectable} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspaceDto } from './dto/workspace.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkspaceService {

     constructor(private readonly prisma: PrismaService, private readonly logger: LoggerService){}

     async create (userId: string, dto: WorkspaceDto) {
      this.logger.log(`create workspace name ${dto.name} by ${userId}`, 'Workspace service' )
     
       return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {

          const workspace = await tx.workspace.create({
               data: {
                    name: dto.name,
                    createdAt: new Date()
               }
          })

          return {workspace: [workspace]}
       })
     }

    async list (userId: string) {
      this.logger.log(`fetching workspace list for ${userId}`)

     //  return await this.prisma.workspace.findMany({where: {member: 
     //      {some: {userId}}
     // }})
    }


     
}
