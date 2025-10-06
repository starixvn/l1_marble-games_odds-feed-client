export interface MarbleLogAnnotation {
    eventId?: number;
    gameId?: string;
}

export interface MarbleLoggerInitConfig {
    debug?: boolean;
    sentryRelease?: string;
    tracesSampleRate?: number;
}

export interface MarbleLoggerService {
    init: (config: MarbleLoggerInitConfig) => void;
    log: (message: string, annotation?: MarbleLogAnnotation) => void;
    error: (error: Error, annotation?: MarbleLogAnnotation) => void;
    warning: (message: string, annotation?: MarbleLogAnnotation) => void;
    debug: (message: string, annotation?: MarbleLogAnnotation) => void;
}