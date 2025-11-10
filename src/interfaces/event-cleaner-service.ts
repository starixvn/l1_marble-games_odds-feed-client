import { EventNotification } from "@/interfaces";

export interface EventCleanerService {
  initEvent(): void;
  dispose(): void;
  handleEventStart(notification: EventNotification): void;
}
