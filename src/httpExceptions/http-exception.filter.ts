import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('from the console');
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    //const status = exception.getStatus()

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 406) {
        let errors = (exception.getResponse() as { message: any[] }).message;
        errors = errors.reduce(
          (accu, message) => ({
            ...accu,
            [message.split('|')[0]]: message.split('|')[1],
          }),
          {},
        );
        return res
          .status(exception.getStatus())
          .json({ msg: errors, type: 'validation' });
      }
      return res.status(exception.getStatus()).json({ msg: exception.message });
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const attr = exception.meta.target[0];
      return res
        .status(406)
        .json({
          msg: { [attr]: 'Ca a été déja existé' },
          type: 'prisma validation error',
        });
    }

    return res.status(500).json({ msg: exception, type: 'server' });
  }
}
