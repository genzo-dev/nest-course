import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from 'src/recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import appConfig from './app.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // time to live em ms
        limit: 10, // máximo de requests durante o ttl
        blockDuration: 5000, // tempo de bloqueio
      },
    ]),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_TYPE: Joi.required(),
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.required(),
        DATABASE_DATABASE: Joi.required(),
        DATABASE_PASSWORD: Joi.required(),
        DATABASE_AUTO_LOAD_ENTITIES: Joi.number().min(0).max(1).default(0),
        DATABASE_SYNCHRONIZE: Joi.number().min(0).max(1).default(0),
      }),
    }),
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: async (appConfiguration: ConfigType<typeof appConfig>) => {
        return {
          type: appConfiguration.database.type,
          host: appConfiguration.database.host,
          port: appConfiguration.database.port,
          username: appConfiguration.database.username,
          database: appConfiguration.database.database,
          password: appConfiguration.database.password,
          autoLoadEntities: appConfiguration.database.autoLoadEntities, // carrega entidades sem precisar especifica-las
          synchronize: appConfiguration.database.synchronize, // sincroniza com o BD. Não deve ser usado em produção
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
      serveRoot: '/pictures',
    }),
    RecadosModule,
    PessoasModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
