const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

const defaultResults = process.env.defaultResults || 8;
const tableName = process.env.restaurants_table;

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

module.exports.handler = async (event, context) => {
    const restaurants = await getRestaurants(defaultResults);
    const response = {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    };
    return response;
}