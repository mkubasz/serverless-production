const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

const defaultResults = process.env.defaultResults || 8;
const tableName = process.env.restaurants_table;

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

module.exports.handler = async (event, context) => {
    const req = JSON.parse(event.body);
    const theme = req.theme;
    const restaurants = await findRestaurantsByTheme(theme, defaultResults);
    const response = {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    };
    return response;
}