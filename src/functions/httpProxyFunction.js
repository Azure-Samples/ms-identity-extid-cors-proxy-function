const { app } = require("@azure/functions");
const  axios = require('axios');

const tenantSubdomain = process.env.TENANT_SUBDOMAIN || '';
const tenantPathPattern = /^\/(?:[^/]+\.onmicrosoft\.com|[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})(?:\/|$)/i;

async function MyProxyFunction(request, context) {
    try {
        const hostName = `${tenantSubdomain}.ciamlogin.com`;
        const incomingUrl = new URL(request.url);
        const incomingPath = incomingUrl.pathname;
        const forwardedPath = tenantPathPattern.test(incomingPath)
            ? incomingPath
            : `/${tenantSubdomain}.onmicrosoft.com${incomingPath}`;
        const forwardedHeaders = Object.fromEntries(request.headers.entries());

        const options = {
            url: `https://${hostName}${forwardedPath}${incomingUrl.search}`,
            method: request.method,
            headers: {
                ...forwardedHeaders,
                host: hostName
            },
            maxRedirects: 0,
            decompress: false,
            responseType: 'text',
            validateStatus: function (status) {
                return 1; // No HTTP Code trigger error-handling, we want to proxy all through
            }
        };

        const requestData = await request.text();
        options.data = requestData;

        const response = await axios.request(options);
        const corsResponseHeaders = {};
        if (request.method === 'OPTIONS') {
            const requestedHeaders = request.headers.get('access-control-request-headers');
            if (requestedHeaders) {
                corsResponseHeaders['Access-Control-Allow-Headers'] = requestedHeaders;
            }
        }
        return {
            status: response.status,
            body: response.data,
            headers: {
                ...response.headers,
                ...corsResponseHeaders
                   }
        };
    } catch (error) {
        return {
            status: 500,
            body: `Error: ${error.message || error}`
        };
    }
};

config = {
    methods: ['POST', 'PUT', 'OPTIONS'],
    route: "{*path}",
    authLevel: 'anonymous'
}

if (tenantSubdomain) {
    config.handler = MyProxyFunction
} else {
    config.handler = async (req, context) => {
        return {
            status: 400,
            body: "Tenant subdomain is not set"
        }
    }
}

app.http('httpProxyFunction', config);