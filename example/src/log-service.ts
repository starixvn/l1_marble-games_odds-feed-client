import { Logger } from "odds-feed-client";

export class LogService implements Logger {
  log(message: string, level: string) { return; }
  public logError(message: string) { 
    console.error(message)
  }
}
