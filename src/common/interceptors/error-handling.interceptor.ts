import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      catchError(error => {
        return throwError(() => {
          if (error instanceof NotFoundException) {
            return new BadRequestException(error.message);
          }
        });
      }),
    );
  }
}
