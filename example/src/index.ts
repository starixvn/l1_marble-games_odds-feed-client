import { createContainer } from "awilix";
import { init, register } from "odds-feed-client/dependency-injection";
import { AwilixDIContainer } from "odds-feed-client/awilix";

import { registerLogServices, initLogServices } from "./container-registry";

export function oddsFeedFilter(event: any) {
  return event.operatorGameId === "158"
}


const container = createContainer();

const diContainer = new AwilixDIContainer(container);

register(diContainer, {
  eventQueueMaxLength: 2,
  oddsFeedFilter,
  logApiToFile: true,
});
registerLogServices(diContainer);
init(diContainer);
initLogServices(diContainer);
