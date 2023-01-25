const {CognitoIdentityProvider} = require('@aws-sdk/client-cognito-identity-provider');

const anAuthenticatedUserDelete = async (user) => {
    const cognito = new CognitoIdentityProvider({region: 'us-east-1'});

    let req = {
        UserPoolId: process.env.cognito_user_pool_id,
        Username: user.username
    };

    await cognito.adminDeleteUser(req);

    console.log(`Deleted user ${user.username}`);
}

module.exports = {
    anAuthenticatedUserDelete
}