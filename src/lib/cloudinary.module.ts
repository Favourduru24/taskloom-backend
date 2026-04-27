import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CloudinaryConfiguration } from "src/config/cloudinary.config";
import { CloudinaryService } from "./cloudinary.service";


@Module({
    imports: [ConfigModule.forFeature(CloudinaryConfiguration)],
    providers: [CloudinaryService],
    exports: [CloudinaryService]
})

 export class CloudinaryModule {}