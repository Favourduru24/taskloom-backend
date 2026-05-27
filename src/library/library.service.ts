import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MediaType,  } from '@prisma/client';
import { CloudinaryService, UploadedAsset } from 'src/lib/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LibraryService {
    constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) {}
     
    async isMemberOfWorkspace (userId: string, workspaceId: string) {

       const member = await this.prisma.workspaceMember.findFirst({
                  where: {
                    userId,
                    workspaceId,
                  },
                  include: {user: true}
                });
                 
                if (!member) {
                  throw new NotFoundException('User is not a member of this workspace');
                }
    }

    async uploadAsset(file: Express.Multer.File, workspaceId: string, userId: string) {

        if(!file || !workspaceId) throw new BadRequestException('Media file is required.')
    
         await this.isMemberOfWorkspace(userId, workspaceId)

        const mime = file.mimetype ?? ''

        const mediaType = mime.startsWith('image/') ? MediaType.IMAGE : mime.startsWith('video/') ? MediaType.VIDEO : null

        if(!mediaType) throw new BadRequestException('Unsupported file type. Upload an image or video')

       const uploaded: UploadedAsset = await this.cloudinary.uploadAsset(file.buffer, {
        folder: '',
        resourceType: mediaType === MediaType.VIDEO ? 'video' : 'image'
       })

       return this.prisma.mediaAsset.create({
        data: {
            workspaceId,
            userId,
            type: mediaType,
            publicId: uploaded.publicId,
            url: uploaded.secureUrl,
            format: uploaded.format ?? null,
            width: uploaded.width ?? null,
            height: uploaded.height ?? null,
            bytes: uploaded.bytes ?? null,
            folder: uploaded.folder ?? null,
            originalName: file.originalname ?? null,
        }
       })
    }

    async listAsset (userId: string, workspaceId: string) {
      
       const isMember = await this.prisma.workspace.findFirst({
        where: {id: workspaceId, members: {some: {userId}}}, include: {members: true}})

       if(!isMember){
        throw new ForbiddenException('Access denied not a member of workspace')
       }

       const mediaAsset = await this.prisma.mediaAsset.findMany({
        where: {workspaceId}
       })

       if(!mediaAsset){
        throw new NotFoundException('Media Asset not found.')
       }

       return mediaAsset
    }
}

// library/9af2f2a2-aeb1-4b09-a576-1c386aac571d/list
