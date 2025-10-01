import { Logger } from "odd-feed-client";

export class CustomLogger implements Logger {
    public logError (message: string) {
        console.error(message);
    }
} 