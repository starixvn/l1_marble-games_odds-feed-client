import { Logger } from "odds-feed-client";

export class CustomLogger implements Logger {
  log(message: string, level: string) { return; }
  public logError(message: string) { return; }
}
