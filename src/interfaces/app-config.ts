interface AppConfigs {
  oddsFeedAPI: {
    url: string;
    operatorId: string;
    password: string;
  };
  sentry: {
    sentryUrl: string;
    logIdentifier: string;
    env: string;
    debug?: boolean;
  };
}

export { AppConfigs };
