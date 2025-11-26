# [3.6.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.5.0...v3.6.0) (2025-11-26)


### Features

* pause the odds feed client - Epic GL-6394 ([a550cf1](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/a550cf17e6cfc2c133aeedbb7aec7aaa00f83dc4))

# [3.5.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.4.4...v3.5.0) (2025-11-25)


### Features

* dedup /event request and create api logger to support debugging and export json - Epic GL-5337 - Epic GL-5337 ([2b70081](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/2b70081e8638c8d212a1585435d2dba398dd8121))

## [3.4.4](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.4.3...v3.4.4) (2025-11-14)


### Bug Fixes

* add randomUUID in scheduler service - Epic GL-5982 ([87338cd](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/87338cdf1ba43537066548b6748cd814cc228a3b))

## [3.4.3](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.4.2...v3.4.3) (2025-11-13)


### Bug Fixes

* validate event detail start ensuring playlist and goalinfo is available - Epic GL-5337 ([d2409a9](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/d2409a9b01a0560cd9d2f9f215883dd8c5721f78))

## [3.4.2](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.4.1...v3.4.2) (2025-11-12)


### Bug Fixes

* use option param object to avoid too much argument when it scales - Epic GL-5337 ([fede34e](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/fede34e9eaf5a74b91281e79df0699ddee7f66d0))

## [3.4.1](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.4.0...v3.4.1) (2025-11-12)


### Bug Fixes

* now in the response is STRING, not NUMBER - Epic GL-5337 ([b80ff75](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/b80ff754b0d8867a31af42468b883e160bc154f3))

# [3.4.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.3.1...v3.4.0) (2025-11-12)


### Features

* odds and result validation - Epic GL-5337 ([e599de3](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/e599de3bc3af1274dd61fefb423663377ae41235))
* support and use now from server - Epic GL-5337 ([f77d067](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/f77d067dfc6486e70e30ae558babaea6143d8493))

## [3.3.1](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.3.0...v3.3.1) (2025-11-11)


### Bug Fixes

* move config debug to app config instead ([dddbec7](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/dddbec76af6c8f0a8c6efcebf424153874ab919b))

# [3.3.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.2.0...v3.3.0) (2025-11-10)


### Features

* add optional eventConfig to Event type - Epic GL-5982 ([3ab5ae6](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/3ab5ae67c22dd450042057314e5fa6b36d1c5130))

# [3.2.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.1.0...v3.2.0) (2025-11-10)


### Features

* optional sentry logger (to NOT call sentry when we don't need it) ([60a366f](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/60a366ff6b2c4088f2b21f6243fd8bc7aad418fa))

# [3.1.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v3.0.0...v3.1.0) (2025-11-10)


### Features

* enhance OddsFeedCron to initialize current events when needed - Epic GL-5982 ([8913502](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/891350259965504ebcc308773b7ba53c1171c3fd))

# [3.0.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v2.0.0...v3.0.0) (2025-10-21)

### Features

- expose schedule and scheduleEvent API for odds feed cron - Epic GL-5506 ([06b50f1](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/06b50f13e07951c5e3124e737d386417ead95761))
- refactor structure and API protocols - Epic GL-5506 ([fcbfb29](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/fcbfb292c9174b27d34a2d6e31301a0a627f510b))

# [2.0.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v1.4.0...v2.0.0) (2025-10-09)

### Features

- release completion ([6ade615](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/6ade615f0e42e1eaa2e13d0227e449d60bc70bb9))

### BREAKING CHANGES

- all register**_ in odd feed event source is renamed into _**on, same for off (from unregister), and emit (from on)

# [1.2.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v1.1.0...v1.2.0) (2025-10-02)

### Features

- support awilix INJECTION MODE PROXY ([2cb3624](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/2cb3624a3d500d1d1758ad0baa0122411be95c8f))

# [1.1.0](https://git3.nexdev.net/l1/marble-games/odds-feed-client/compare/v[secure]...v1.1.0) (2025-10-01)

### Features

- completed feature - ODD FEED FILTER ([989cd79](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/989cd79bd614c996b6b45b1bfc18877b9ca0d05e))

# [secure] (2025-10-01)

### Bug Fixes

- unit tests ([cdbd72f](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/cdbd72fb20b397e96edfe5a7a19a7f4657f545db))

### Features

- init project ([2d9c4cf](https://git3.nexdev.net/l1/marble-games/odds-feed-client/commit/2d9c4cff894d702c08489d064b50122305182f35))
