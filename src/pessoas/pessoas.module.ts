import { forwardRef, Module } from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { PessoasController } from './pessoas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { RecadosModule } from 'src/recados/recados.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pessoa]),
    forwardRef(() => RecadosModule),
    AuthModule,
  ],
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
