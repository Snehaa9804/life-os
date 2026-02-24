// Logger utility with environment-aware logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private isDevelopment = import.meta.env.DEV;

    private shouldLog(level: LogLevel): boolean {
        if (this.isDevelopment) {
            return true; // Log everything in development
        }
        // In production, only log warnings and errors
        return level === 'warn' || level === 'error';
    }

    debug(...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            console.debug('[DEBUG]', ...args);
        }
    }

    info(...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.info('[INFO]', ...args);
        }
    }

    warn(...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args: unknown[]): void {
        if (this.shouldLog('error')) {
            console.error('[ERROR]', ...args);
        }
    }
}

export const logger = new Logger();
