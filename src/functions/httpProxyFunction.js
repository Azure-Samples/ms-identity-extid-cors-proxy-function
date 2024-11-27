const { app } = require("@azure/functions");
const  axios = require('axios');

const tenantSubdomain = process.env.TENANT_SUBDOMAIN || '';

async function MyProxyFunction(request, context) {
    try {
        const hostName = `${tenantSubdomain}.ciamlogin.com`;
        const baseURL = `https://${hostName}/${tenantSubdomain}.onmicrosoft.com`;
        const incomingPath = request.params.path || '';

        const options = {
            url: `${baseURL}/${incomingPath}`,
            method: request.method,
            headers: {
                ...request.headers,
                host: hostName,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout:0,
            decompress:false,
            maxContentLength: 100000,
            maxBodyLength: 100000,
            responseType: 'text',
            validateStatus: function (status) {
                return 1; // Never an error
            }              
        };

        const requestData = await request.text();
        options.body = requestData;


        context.log("HTTP Call");
        //context.log("  BaseURL: " + options.baseURL);
        context.log("  Path: " + options.url);
        context.log("  Method: " + options.method);
        context.log("  Headers: " + JSON.stringify(options.headers));
        context.log("  Body: " + options.body);
        
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

app.http('authProxy', config);