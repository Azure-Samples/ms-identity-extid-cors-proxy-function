const { app } = require("@azure/functions");
const  axios = require('axios');

const tenantSubdomain = process.env.TENANT_SUBDOMAIN || '';

async function MyProxyFunction(request, context) {
    try {
        const hostName = `${tenantSubdomain}.ciamlogin.com`;
        const baseURL = `https://${hostName}/${tenantSubdomain}.onmicrosoft.com`;
        const incomingPath = request.params.path || '';
        const forwardedHeaders = Object.fromEntries(request.headers.entries());

        const normalizedPath = `/${incomingPath}`
            .replace(/\/+/g, '/')
            .replace(/\/$/, '')
            .toLowerCase();
        if (normalizedPath.endsWith('/oauth2/v2.0/token')) {
            delete forwardedHeaders.origin;
        }

        const options = {
            url: `${baseURL}/${incomingPath}`,
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
        return {
            status: response.status,
            body: response.data,
            headers: {
                ...response.headers
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