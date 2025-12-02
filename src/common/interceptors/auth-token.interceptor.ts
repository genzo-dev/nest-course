import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token || token != '123456') {
      throw new UnauthorizedException('Usuário não logado');
    }

    return next.handle();
  }
}
