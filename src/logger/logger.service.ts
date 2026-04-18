import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
 
    log(message: string, context?: string, meta?: Record<string, any>) {
       super.log(this.appendMeta(message, meta), context)
    }

    error(message: string, trace?: string, context?: string, meta?: Record<string, any>) {
        super.error(this.appendMeta(message, meta), trace, context)
    }

    warn(message: string, context?: string, meta?: Record<string,any>) {
        super.warn(this.appendMeta(message, meta), context)
    }
    
    debug(message: string, context?: string, meta?: Record<string, any>) {
        super.debug?.(this.appendMeta(message, meta), context)
    }

     verbose(message: string, context?: string, meta?: Record<string, any>) {
    super.verbose?.(this.appendMeta(message, meta), context);
  }

    private appendMeta(message: string, meta?: Record<string, any>) {
        if(!meta) return message

        return `${message} ${this.safeStringify(meta)}`
    }

    private safeStringify(meta: Record<string, any> ){
        try{
         return JSON.stringify(meta)
        }catch {
            return '[unserializable meta]'
        }
    }
}
