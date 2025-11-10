import { createContainer } from "awilix";
import { init, register } from "odds-feed-client/dependency-injection";
import { AwilixDIContainer } from "odds-feed-client/awilix";

import { registerLogServices, initLogServices } from "./container-registry";

const container = createContainer();

const diContainer = new AwilixDIContainer(container);

register(diContainer, {
  eventQueueMaxLength: 2,
});
registerLogServices(diContainer);
init(diContainer);
initLogServices(diContainer);
