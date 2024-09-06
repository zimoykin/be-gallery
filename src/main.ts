import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from './service-config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const conf = app.get(ConfigService<ConfigVariables>);
  const port = conf.get<number>('PORT') ?? 3000;

  // swagger config
  const pkg = require('../package.json');
  const config = new DocumentBuilder()
    .setTitle(pkg.name ?? 'Service Api')
    .setDescription(pkg.description ?? 'This service based on nestjs-template-9')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { swaggerOptions: { persistAuthorization: true } });

  await app.listen(port);
}
bootstrap();
