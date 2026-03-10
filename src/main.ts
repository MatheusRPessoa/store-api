import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Minha API NestJS')
    .setDescription('Documentação detalhada da API')
    .setVersion('1.0')
    .addTag('users') // Opcional: organiza por categorias
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
   // 'api' é o caminho da URL
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
