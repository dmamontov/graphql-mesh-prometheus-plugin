export interface PrometheusConfig {
    requestCount?: boolean | string;
    requestTotalDuration?: boolean | string;
    requestSummary?: boolean | string;
    execute?: boolean | string;
    errors?: boolean | string;
    deprecatedFields?: boolean | string;
    skipIntrospection?: boolean;
    delegation?: boolean | string;
    delegationCount?: boolean | string;
    delegationSummary?: boolean | string;
    delegationErrors?: boolean | string;
    delegationTotalDuration?: boolean | string;
    delegationExecute?: boolean | string;
    delegationExecuteCount?: boolean | string;
    delegationExecuteSummary?: boolean | string;
    delegationExecuteErrors?: boolean | string;
    delegationExecuteTotalDuration?: boolean | string;
    endpoint?: boolean | string;
}
