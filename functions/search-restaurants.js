const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const middy = require('@middy/core');
const ssm = require('@middy/ssm');

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

const tableName = process.env.restaurants_table;
const { serviceName, stage } = process.env;
const findRestaurantsByTheme = async (theme, limit) => {
    console.log(`Querying for ${limit} restaurants with theme ${theme}`);
    const params = {
        TableName: tableName,
        Limit: limit,
        FilterExpression: 'contains(themes, :theme)',
        ExpressionAttributeValues: {
            ':theme': { S: theme }
        }
    };
    const result = await dynamoDb.send(new ScanCommand(params));
    console.log(`found ${result.Count} restaurants`);
    return result.Items.map(item => unmarshall(item));
}

module.exports.handler = middy(async (event, context) => {
    const req = JSON.parse(event.body);
    console.info(context.secretString)
    const theme = req.theme;
    const restaurants = await findRestaurantsByTheme(theme, context.config.defaultResults);
    return {
        statusCode: 200,
        body: JSON.stringify(restaurants),
        isBase64Encoded: false
    };
}).use(ssm({
    cache: true,
    cacheExpiryInMillis: 5 * 60 * 1000,
    setToContext: true,
    fetchData: {
        config: `/${serviceName}/${stage}/search-restaurants/config`,
        secretString: `/${serviceName}/${stage}/search-restaurants/secretString`
    }
}));