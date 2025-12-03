import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

import appConfiguration from './app/config/app.configuration';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appConfiguration(app);

  if (process.env.NODE_ENV === 'production') {
    // HELMET -> cabeçalhos de seguraça no protocolo HTTP
    app.use(helmet());
    // CORS -> permitir que outros domínios façam requests na sua aplicação
    app.enableCors({
      origin: 'https://meuapp.com.br',
    });
  }

  const documentBuilderConfig = new DocumentBuilder()
    .setTitle('Recados API')
    .setDescription('Envie recados para seus amigos e familiares')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilderConfig);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.APP_PORT ?? 3001);
}
bootstrap();
