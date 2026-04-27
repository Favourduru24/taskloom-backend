import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { CloudinaryConfiguration } from "src/config/cloudinary.config";
import { LoggerService } from "src/logger/logger.service";
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type UploadImageOptions = {
    folder?: string;
    publicId?: string;
    tags?: string[];
    overwrite?: boolean;
  };
  
  export type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

  export type UploadAssetOptions = UploadImageOptions & {
    resourceType?: CloudinaryResourceType;
  };
  
  export type UploadedImage = {
    publicId: string;
    url: string;
    secureUrl: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    folder?: string;
    createdAt: Date;
  };

  export type UploadedAsset = {
    publicId: string;
    url: string;
    secureUrl: string;
    resourceType: CloudinaryResourceType;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    folder?: string;
    createdAt: Date;
    duration?: number;
  };

@Injectable()
export class CloudinaryService {
    constructor( 
    @Inject(CloudinaryConfiguration.KEY)
    private readonly config: ConfigType<typeof CloudinaryConfiguration>,
    private readonly logger: LoggerService
) {
    if(!config.cloudName || !config.apiKey || !config.apiSecret) {
       this.logger.warn('Cloudinary key is missing')
    }

    cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret
    })
}

async uploadAsset(buffer: Buffer, opts: UploadAssetOptions = {}): Promise<UploadedAsset> {
    if (!buffer || buffer.length === 0) {
      this.logger.error('Invalid upload buffer: empty or null');
      throw new InternalServerErrorException('Invalid file');
    }

    const { folder, publicId, tags, overwrite, resourceType } = opts;
    const options: any = {
      resource_type: resourceType ?? 'auto',
      folder,
      public_id: publicId,
      tags,
      overwrite: overwrite ?? true,
    };

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse | undefined, res: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!res) return reject(new Error('Empty Cloudinary response'));
          resolve(res);
        },
      );
      stream.end(buffer);
    }).catch((err) => {
      this.logger.error(`Cloudinary upload failed: ${err?.message ?? err}`);
      throw new InternalServerErrorException('Failed to upload file');
    });

    return {
      publicId: result.public_id,
      url: result.secure_url || result.url,
      secureUrl: result.secure_url || result.url,
      resourceType: (result as any).resource_type ?? (resourceType ?? 'auto'),
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      folder: result.folder,
      createdAt: new Date(result.created_at),
      duration: (result as any).duration,
    };
  } 

  buildCompanyFolder(companyId: string, subfolder?: string): string {
    const parts = [this.config.baseFolder, 'companies', companyId];
    if (subfolder) parts.push(subfolder);
    return parts.join('/');
  }
   }