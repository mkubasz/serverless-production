const aws4 = require('aws4');
const URL = require('url');
const APP_ROOT = '../../';
const _ = require('lodash');

const mode = process.env.TEST_MODE;

const respondFrom = async (response) => ({
    statusCode: response.status,
    body: response.body,
    headers: response.headers
});

const signHttpRequest = (url) => {
    const urlData = URL.parse(url);

    const opts = {
        host: urlData.hostname,
        path: urlData.pathname
    }

    aws4.sign(opts);
    return opts.headers;
};

const viaHttp = async (path, method, opts) => {
    const url = `${process.env.rest_api_url}/${path}`;
    console.log(`Invoking ${url} via HTTP`);

    try {
        const data = _.get(opts, 'body', {});
        let headers = {};
        if (_.get(opts, 'iam_auth', false)) {
            headers = signHttpRequest(url);
        }

        const authHeader = _.get(opts, 'auth');
        if(authHeader) {
            headers.Authorization = authHeader;
        }

        const httpReg = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(data)
        });
        const res = await httpReg.json();
        return respondFrom(res);
    } catch (err) {
        if(err.status) {
            return {
                statusCode: err.status,
                headers: err.response.headers
            }
        } else {
            throw err;
        }
    }
};

const viaHandler = async (event, functionName) => {
    const handler = require(`${APP_ROOT}functions/${functionName}`).handler;

    const context = {};
    const response = await handler(event, context);
    const contentType = _.get(response, 'headers.Content-Type', 'application/json');
    if (response.body && contentType.includes('application/json')) {
        response.body = JSON.parse(response.body);
    }
    return response;
}

const we_invoke_get_index = async () =>
{
    switch (mode) {
        case 'handler':
            return await viaHandler({}, 'get-index');
        case 'http':
            return await viaHttp('', 'get');
        default:
            throw new Error(`Invalid mode: ${mode}`);
    }
}

const we_invoke_get_restaurants = async () => viaHandler({}, 'get-restaurants');

const we_invoke_search_restaurants = async theme => {
    const event = {
        body: JSON.stringify({ theme }),
    }
    return await viaHandler(event, 'search-restaurants');
};

module.exports = {
    we_invoke_get_index,
    we_invoke_get_restaurants,
    we_invoke_search_restaurants,
}