import { Counter, Histogram, Registry, Summary } from 'prom-client';
import useMeshPrometheus from '@graphql-mesh/plugin-prometheus';
import { type MeshPlugin, type MeshPluginOptions } from '@graphql-mesh/types';
import { createDefaultExecutor } from '@graphql-tools/delegate';
import { type ExecutionResult } from '@graphql-tools/utils';
import { type PrometheusConfig } from './types';

class SilentRegistry extends Registry {
    registerMetric(metric: any) {
        // @ts-expect-error
        this._metrics[metric.name] = metric;
    }
}

export default function usePrometheus(
    options: MeshPluginOptions<PrometheusConfig>,
): MeshPlugin<any> {
    const registry = new SilentRegistry();

    let delegatePhaseHistogram: Histogram | undefined;
    if (options.delegation) {
        delegatePhaseHistogram = new Histogram({
            name:
                typeof options.delegation === 'string'
                    ? options.delegation
                    : 'graphql_mesh_phase_delegate',
            help: 'Time spent on running the GraphQL Mesh "delegation" function',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateCounter: Counter | undefined;
    if (options.delegationCount) {
        delegateCounter = new Counter({
            name:
                typeof options.delegationCount === 'string'
                    ? options.delegationCount
                    : 'graphql_mesh_delegate',
            help: 'Counts the amount of GraphQL Mesh delegation',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateSummary: Summary | undefined;
    if (options.delegationSummary) {
        delegateSummary = new Summary({
            name:
                typeof options.delegationSummary === 'string'
                    ? options.delegationSummary
                    : 'graphql_mesh_delegate_time_summary',
            help: 'Summary to measure the time to complete GraphQL delegation',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateErrorsCounter: Counter | undefined;
    if (options.delegationErrors) {
        delegateErrorsCounter = new Counter({
            name:
                typeof options.delegationErrors === 'string'
                    ? options.delegationErrors
                    : 'graphql_mesh_delegate_error_result',
            help: 'Counts the amount of errors reported from delegate',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateDurationHistogram: Histogram | undefined;
    if (options.delegationTotalDuration) {
        delegateDurationHistogram = new Histogram({
            name:
                typeof options.delegationTotalDuration === 'string'
                    ? options.delegationTotalDuration
                    : 'graphql_mesh_delegate_duration',
            help: 'Time spent on delegate',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateExecutePhaseHistogram: Histogram | undefined;
    if (options.delegationExecute) {
        delegateExecutePhaseHistogram = new Histogram({
            name:
                typeof options.delegationExecute === 'string'
                    ? options.delegationExecute
                    : 'graphql_mesh_phase_delegate_execute',
            help: 'Time spent on running the GraphQL Mesh "delegation execute" function',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateExecuteCounter: Counter | undefined;
    if (options.delegationExecuteCount) {
        delegateExecuteCounter = new Counter({
            name:
                typeof options.delegationExecuteCount === 'string'
                    ? options.delegationExecuteCount
                    : 'graphql_mesh_delegate_execute',
            help: 'Counts the amount of GraphQL Mesh delegation executed',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateExecuteSummary: Summary | undefined;
    if (options.delegationExecuteSummary) {
        delegateExecuteSummary = new Summary({
            name:
                typeof options.delegationExecuteSummary === 'string'
                    ? options.delegationExecuteSummary
                    : 'graphql_mesh_delegate_execute_time_summary',
            help: 'Summary to measure the time to complete GraphQL delegation execute',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateExecuteErrorsCounter: Counter | undefined;
    if (options.delegationExecuteErrors) {
        delegateExecuteErrorsCounter = new Counter({
            name:
                typeof options.delegationExecuteErrors === 'string'
                    ? options.delegationExecuteErrors
                    : 'graphql_mesh_delegate_execute_error_result',
            help: 'Counts the amount of errors reported from delegate execute',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    let delegateExecuteDurationHistogram: Histogram | undefined;
    if (options.delegationExecuteTotalDuration) {
        delegateExecuteDurationHistogram = new Histogram({
            name:
                typeof options.delegationExecuteTotalDuration === 'string'
                    ? options.delegationExecuteTotalDuration
                    : 'graphql_mesh_delegate_execute_duration',
            help: 'Time spent on delegate execution',
            labelNames: ['sourceName', 'typeName', 'fieldName', 'operationType'],
            registers: [registry],
        });
    }

    return {
        onPluginInit: function ({ addPlugin }) {
            addPlugin({
                onContextBuilding({ extendContext }) {
                    extendContext({
                        promRegistry: registry,
                    });
                },
            });
        },
        ...useMeshPrometheus({
            ...options,
            delegation: false,
            parse: false,
            validate: false,
            contextBuilding: false,
            subgraphExecute: false,
            // @ts-expect-error
            registry,
        }),
        onDelegate(payload) {
            const labels = {
                sourceName: payload.sourceName,
                typeName: payload.typeName,
                fieldName: payload.fieldName,
                operationType: payload.typeName.toLowerCase(),
            };

            const startTime = Date.now();

            if (delegateCounter) {
                delegateCounter.labels(labels).inc();
            }

            // @ts-expect-error
            if (!payload.schema?._withoutPrometheusExecutor) {
                // @ts-expect-error
                payload.schema._withoutPrometheusExecutor =
                    // @ts-expect-error
                    payload.schema?.executor || createDefaultExecutor(payload.schema?.schema);
            }

            // @ts-expect-error
            payload.schema.executor = async (request: ExecutionRequest) => {
                const startTime = Date.now();

                if (delegateExecuteCounter) {
                    delegateExecuteCounter.labels(labels).inc();
                }

                // @ts-expect-error
                const result = (await payload.schema._withoutPrometheusExecutor(
                    request,
                )) as ExecutionResult;

                const endTime = (Date.now() - startTime) / 1000;

                if (delegateExecutePhaseHistogram) {
                    delegateExecutePhaseHistogram.observe(labels, endTime);
                }

                if (delegateExecuteDurationHistogram) {
                    delegateExecuteDurationHistogram.observe(labels, endTime);
                }

                if (delegateExecuteSummary) {
                    delegateExecuteSummary.observe(labels, endTime);
                }

                if (delegateExecuteErrorsCounter && result?.errors && result.errors.length > 0) {
                    delegateExecuteErrorsCounter.labels(labels).inc();
                }

                return result;
            };

            return ({ result }) => {
                const endTime = (Date.now() - startTime) / 1000;

                if (delegatePhaseHistogram) {
                    delegatePhaseHistogram.observe(labels, endTime);
                }

                if (delegateDurationHistogram) {
                    delegateDurationHistogram.observe(labels, endTime);
                }

                if (delegateSummary) {
                    delegateSummary.observe(labels, endTime);
                }

                if (delegateErrorsCounter && result instanceof Error) {
                    delegateErrorsCounter.labels(labels).inc();
                }
            };
        },
    };
}
