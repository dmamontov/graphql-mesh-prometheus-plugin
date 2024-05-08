# Prometheus Plugin for GraphQL Mesh

Prometheus Plugin is a plugin integrates Prometheus metrics collection into your GraphQL Mesh setup. It exposes a new route that Prometheus can scrape to gather metrics about the GraphQL operations.

## Installation

Before you can use the Prometheus Plugin, you need to install it along with GraphQL Mesh if you haven't already done so. You can install these using npm or yarn.

```bash
npm install @dmamontov/graphql-mesh-prometheus-plugin
```

or

```bash
yarn add @dmamontov/graphql-mesh-prometheus-plugin
```

## Configuration

### Modifying tsconfig.json

To make TypeScript recognize the Prometheus Plugin, you need to add an alias in your tsconfig.json.

Add the following paths configuration under the compilerOptions in your tsconfig.json file:

```json
{
  "compilerOptions": {
    "paths": {
       "prometheus": ["node_modules/@dmamontov/graphql-mesh-prometheus-plugin"]
    }
  }
}
```

### Adding the Plugin to GraphQL Mesh

You need to include the Prometheus Plugin in your GraphQL Mesh configuration file (usually .meshrc.yaml). Below is an example configuration that demonstrates how to use this plugin:

```yaml
plugins:
  - prometheus:
      skipIntrospection: true
      execute: true
      requestCount: true
      requestTotalDuration: true
      requestSummary: true
      errors: true
      delegation: true
      delegationCount: true
      delegationSummary: true
      delegationErrors: true
      delegationTotalDuration: true
      delegationExecute: true
      delegationExecuteCount: true
      delegationExecuteSummary: true
      delegationExecuteErrors: true
      delegationExecuteTotalDuration: true
      endpoint: /metrics
```

## Conclusion

Remember, always test your configurations in a development environment before applying them in production to ensure that everything works as expected.