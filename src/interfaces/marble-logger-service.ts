export interface MarbleLogAnnotation {
  eventId?: number;
  gameId?: string;
}

export interface MarbleLoggerService {
  log: (message: string, annotation?: MarbleLogAnnotation) => void;
  error: (error: Error, annotation?: MarbleLogAnnotation) => void;
  warning: (message: string, annotation?: MarbleLogAnnotation) => void;
  debug: (message: string, annotation?: MarbleLogAnnotation) => void;
}
