import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcrypService } from './hashing/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Pessoa]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: HashingService,
      useClass: BcrypService,
    },
    AuthService,
  ],
  exports: [HashingService, JwtModule, ConfigModule, TypeOrmModule],
})
export class AuthModule {}
