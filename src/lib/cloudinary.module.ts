import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CloudinaryConfiguration } from "src/config/cloudinary.config";
import { CloudinaryService } from "./cloudinary.service";
import { LoggerModule } from "src/logger/logger.module";


@Module({
    imports: [ConfigModule.forFeature(CloudinaryConfiguration), LoggerModule],
    providers: [CloudinaryService],
    exports: [CloudinaryService]
})

 export class CloudinaryModule {}