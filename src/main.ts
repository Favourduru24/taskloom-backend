import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

   app.useLogger(app.get(LoggerService))
   
  const config = new DocumentBuilder()
  .setTitle('Taskloom')
  .setDescription('Taskloom an project management application.')
  .setVersion('1.0')
  // .addBearerAuth()
  .build()

   const documentLibary = () => SwaggerModule.createDocument(app, config)
   SwaggerModule.setup('api', app, documentLibary)

  await app.listen(process.env.PORT ?? 3000); 
  console.log("DATABASE_URL =", process.env.DATABASE_URL);
}
bootstrap();
