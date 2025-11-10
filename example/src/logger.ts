import { Logger } from "odds-feed-client";

export class CustomLogger implements Logger {
  public logError(message: string) {
    console.error(message);
  }
}
