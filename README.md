## Odd Feed Client

Event-based odd feed client for Marble games. Provides a small set of services to pull schedules and event details, emit domain events, and manage an in-memory store. Ships with a simple dependency injection setup and an Awilix adapter.

### Requirements

- Node.js >= 18

### Installation

```bash
npm install odd-feed-client
# or
yarn add odd-feed-client
# or
pnpm add odd-feed-client
```

If you use the Awilix adapter shown below, also install `awilix` (it is already a dependency here, so this is optional for most setups):

```bash
npm install awilix
```

### Quick start (TypeScript)

The `example/` folder contains a runnable sample. Below is the minimal setup using Awilix.

```ts
import { createContainer, asClass, asValue } from "awilix";
import { register, init } from "odd-feed-client/dependency-injection";
import { AwilixDIContainer } from "odd-feed-client/awilix";
import type { AppConfigs, Logger, OddFeedEventSource, OddFeedEventName } from "odd-feed-client";

// 1) App configuration
const appConfigs: AppConfigs = {
    oddsFeedAPI: {
        url: "https://your-odds-feed-host",
        operatorId: "<operator-id>",
        password: "<operator-password>",
    },
};

// 2) Logger implementation (only logError is required)
class ConsoleLogger implements Logger {
    public logError(message: string) { console.error(message); }
}

// 3) Create Awilix container and register your own bindings
const container = createContainer();
container.register({
    appConfigs: asValue(appConfigs),
    logger: asClass(ConsoleLogger),
});

// 4) Wrap as a DI container and register odd-feed services
const di = new AwilixDIContainer(container);
register(di);
init(di); // starts cron and internal listeners

// 5) (Optional) Listen to feed events
const eventSource = di.resolve<OddFeedEventSource>("oddFeedEventSource");
eventSource.registerEventListener(
    OddFeedEventName.EventUpcoming,
    ({ event }) => {
        console.log("Upcoming event:", event.eventID);
    }
);
```

This will:
- authenticate to the odds feed and pull the schedule
- periodically (every ~30s) reschedule and fetch event details
- emit domain events via the internal event source
- store events in an in-memory store keyed by gameId and eventId

### Reading from the store

```ts
import type { OddFeedStore } from "odd-feed-client";

const store = di.resolve<OddFeedStore>("oddFeedStore");
const event = store.getEventByGameId("<game-id>", /* eventId */ 123456);
```

### Odd feed filter (container value)

`OddFeedPullService` can take an optional predicate to decide which events to keep. Register a value named `oddFeedFilter` in your container. It receives an event and returns `true` to include it. If you don't register it, all events are included by default.

```ts
// Keep all events (default behavior example)
container.register({
    oddFeedFilter: asValue((event) => true),
});

// Example: only include events for specific IDs
container.register({
    oddFeedFilter: asValue((event) => [111, 222, 333].includes(event.eventID)),
});
```


### Without Awilix

You can bring your own DI by implementing `DiContainer` and passing it to `register` and `init`. See `odd-feed-client/container` for the minimal required interface.

### Example app

Check `example/` for a complete, runnable setup that mirrors the snippets above.

### Exports

- `odd-feed-client`: re-exports interfaces and domain types
- `odd-feed-client/dependency-injection`: `register(diContainer)`, `init(diContainer)`
- `odd-feed-client/awilix`: `AwilixDIContainer` adapter
