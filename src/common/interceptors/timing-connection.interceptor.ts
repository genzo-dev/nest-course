import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable()
export class TimingConnectionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now();
    console.log('TimingConnectionInterceptor ANTES');

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;

        console.log(`TimingConnectionInterceptor: ${elapsed}ms`);
      }),
    );
  }
}
