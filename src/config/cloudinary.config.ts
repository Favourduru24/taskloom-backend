import { registerAs } from "@nestjs/config";

export interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    baseFolder: string;
}

export const CloudinaryConfiguration = registerAs(
    'cloudinary',
    (): CloudinaryConfig => ({
      cloudName: process.env.CLOUDINARY_NAME ?? '',
      apiKey: process.env.CLOUDINARY_KEY ?? '',
      apiSecret: process.env.CLOUDINARY_SECRET ?? '',
      baseFolder: process.env.CLOUDINARY_BASE_FOLDER ?? 'taskloom',
    }),
  );
  