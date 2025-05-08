const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  // Sets the working socket to timeout after timeout milliseconds of inactivity on the working socket.
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    // sets maximum time to wait for the first byte to arrive from the server, but it does not limit how long the
    // entire download can take.
    response: number
    // sets a deadline for the entire request (including all uploads, redirects, server processing time) to complete.
    // If the response isn't fully downloaded within that time, the request will be aborted.
    deadline: number
  }
  agent: AgentConfig
}

const auditConfig = () => {
  const auditEnabled = get('AUDIT_ENABLED', 'false') === 'true'
  return {
    enabled: auditEnabled,
    queueUrl: get(
      'AUDIT_SQS_QUEUE_URL',
      'http://localhost:4566/000000000000/mainQueue',
      auditEnabled && requiredInProduction,
    ),
    serviceName: get('AUDIT_SERVICE_NAME', 'UNASSIGNED', auditEnabled && requiredInProduction),
    region: get('AUDIT_SQS_REGION', 'eu-west-2'),
  }
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: get('HTTPS', `${production}`) === 'true',
  staticResourceCacheDuration: '1h',
  redis: {
    enabled: get('REDIS_ENABLED', 'false', requiredInProduction) === 'true',
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 60)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      healthPath: '/health/ping',
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    arnsHandover: {
      url: get('HMPPS_ARNS_HANDOVER_URL', 'http://localhost:8080/oauth2/authorize', requiredInProduction),
      healthPath: '/health/ping',
      externalUrl: get(
        'HMPPS_ARNS_HANDOVER_EXTERNAL_URL',
        get('HMPPS_ARNS_HANDOVER_URL', 'http://localhost:9090/auth'),
      ),
      timeout: {
        response: Number(get('HMPPS_ARNS_HANDOVER_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_ARNS_HANDOVER_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_ARNS_HANDOVER_TIMEOUT_RESPONSE', 10000))),
      clientId: get('HMPPS_ARNS_HANDOVER_CLIENT_ID', 'clientid', requiredInProduction),
      clientSecret: get('HMPPS_ARNS_HANDOVER_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    sentencePlanApi: {
      url: get('SENTENCE_PLAN_API_URL', 'https://sentence-plan-api-dev.hmpps.service.justice.gov.uk'),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('SENTENCE_PLAN_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('SENTENCE_PLAN_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('SENTENCE_PLAN_API_TIMEOUT_RESPONSE', 10000))),
    },
    coordinatorApi: {
      url: get('COORDINATOR_API_URL', 'https://arns-coordinator-api-dev.hmpps.service.justice.gov.uk'),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('COORDINATOR_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('COORDINATOR_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('COORDINATOR_API_TIMEOUT_RESPONSE', 10000))),
    },
  },
  sqs: {
    audit: auditConfig(),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  environmentName: get('ENVIRONMENT_NAME', ''),
  deploymentName: get('DEPLOYMENT_NAME', ''),
}
