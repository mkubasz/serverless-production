const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const middy = require('@middy/core');
const ssm = require('@middy/ssm');

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

const tableName = process.env.restaurants_table;
const { serviceName, stage } = process.env;

const getRestaurants = async (limit) => {
    console.log(`Querying for ${limit} restaurants`);
    const params = {
        TableName: tableName,
        Limit: limit
    };
    const result = await dynamoDb.send(new ScanCommand(params));
    console.log(`found ${result.Count} restaurants`);
    return result.Items.map(item => unmarshall(item));
}

module.exports.handler = middy(async (event, context) => {
    const restaurants = await getRestaurants(context.config.defaultResults);
    const response = {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    };
    return response;
}).use(ssm({
    cache: true,
    cacheExpiryInMillis: 5 * 60 * 1000,
    setToContext: true,
    fetchData: {
        config: `/${serviceName}/${stage}/get-restaurants/config`
    }
}));