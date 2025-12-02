import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class MyExceptionFilter<
  T extends HttpException,
> implements ExceptionFilter {
  catch(exception: T, host: any) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof response === 'string'
        ? {
            message: exceptionResponse,
          }
        : (exceptionResponse as object);

    response.status(statusCode).json({
      ...error,
      data: new Date().toISOString(),
      path: request.url,
    });
  }
}
