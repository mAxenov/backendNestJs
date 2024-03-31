import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';

@Catch(MongoError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Здесь вы можете определить специфическую логику для обработки различных ошибок MongoDB
    // Например, проверьте код ошибки и отправьте соответствующий HTTP-статус и сообщение

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message;
    switch (exception.code) {
      case 11000: // Код ошибки для дублирования уникального индекса
        status = HttpStatus.BAD_REQUEST;
        message = {
          property: Object.keys(exception['keyValue'])[0],
          message: 'Duplicate key error',
        };
        break;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
