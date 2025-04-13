import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const method = request.method;
      const url = request.url;
      const timestamp = new Date().toISOString();
  
      // Log incoming request
      this.logger.log(
        `Incoming Request: ${method} ${url} at ${timestamp}`,
      );
  
      return next
        .handle()
        .pipe(
          tap((data) => {
            // Log outgoing response
            this.logger.log(`Response Sent: ${method} ${url} at ${timestamp}`);
          }),
        );
    }
  }
  