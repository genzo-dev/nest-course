import { forwardRef, Module } from '@nestjs/common';
import { RecadosService } from './recados.service';
import { RecadosController } from './recados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { RecadosUtils } from './recados.utils';
import { RegexFactory } from 'src/common/regex/regex.factory';
import { REMOVE_SPACES_REGEX } from './recados.constant';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { RecadosEntity } from './entities/recados.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RecadosEntity]),
    forwardRef(() => PessoasModule),
    // MyDinamicModule.register({
    //   apiKey: 'APIKey',
    //   apiUrl: 'http://blablabla.bla',
    // }),
    EmailModule,
  ],
  controllers: [RecadosController],
  providers: [
    RecadosService,
    RecadosUtils,
    RegexFactory,
    {
      provide: REMOVE_SPACES_REGEX,
      useFactory: (regexFactory: RegexFactory) => {
        // Meu código
        return regexFactory.create('RemoveSpacesRegex');
      }, //Factory
      inject: [RegexFactory], // Injetando na factory na ordem
    },
  ],
  exports: [RecadosUtils],
})
export class RecadosModule {}
