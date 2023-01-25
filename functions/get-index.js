const fs = require("fs");
const Mustache = require("mustache");
const aws4 = require('aws4');
const URL = require('url');

const restaurantsApiRoot = process.env.restaurants_api;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;
const awsRegion = process.env.AWS_REGION;

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let html;

function loadHtml() {
  if (!html) {
    html = fs.readFileSync("static/index.html", "utf8");
  }
  return html;
}

async function getRestaurants() {
  const url = URL.parse(restaurantsApiRoot);
  const opts = {
      host: url.hostname,
      path: url.pathname
  };
  aws4.sign(opts);
  const httpReq = await fetch(restaurantsApiRoot, {
        headers: opts.headers
  });
  return await httpReq.json();
}
module.exports.handler = async (event, context) => {
  const restaurants = await getRestaurants();
  console.log(restaurants);
  const dayOfWeek = days[new Date().getDay()];
  const template = loadHtml();
  const html = Mustache.render(template, {
    awsRegion, cognitoUserPoolId, cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`,
    restaurants, dayOfWeek });
  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=UTF-8'
    },
    body: html
  }

  return response
}