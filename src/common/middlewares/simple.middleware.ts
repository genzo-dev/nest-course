import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers?.authorization;

    if (authorization) {
      req['user'] = { nome: 'Genzo', sobrenome: 'Genzo', role: 'admin' };
    }

    res.setHeader('CABECALHO2', 'Do SimpleMiddleware');

    next();
  }
}
