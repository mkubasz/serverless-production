const {
    AdminCreateUserCommand,
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
    AdminRespondToAuthChallengeCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const chance = require('chance').Chance();

const randomPassword = () => `${chance.string({length: 8})}B!gM0uth`;

const anAuthenticatedUser = async () => {
    const client = new CognitoIdentityProviderClient({region: 'us-east-1'});
    const userpoolId = process.env.cognito_user_pool_id;
    const clientId = process.env.cognito_server_client_id;

    const firstName = chance.first({nationality: 'en'});
    const lastName = chance.last({nationality: 'en'});
    const suffix = chance.string({length: 4, pool: 'abcdefghijklmnopqrstuvwxyz'});
    const username = `test-${firstName}-${lastName}-${suffix}`;
    const password = randomPassword();
    const email = `${firstName}-${lastName}@big-mouth.com`;

    const createReq = {
        UserPoolId: userpoolId,
        Username: username,
        MessageAction: 'SUPPRESS',
        TemporaryPassword: password,
        UserAttributes: [
            {Name: 'email', Value: email},
            {Name: 'given_name', Value: firstName},
            {Name: 'family_name', Value: lastName}
        ]
    };
    await client.send(new AdminCreateUserCommand(createReq));
    //await cognito.adminCreateUser(createReq);

    const authReq = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        ClientId: clientId,
        UserPoolId: userpoolId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password
        }
    };

    const authRes = await client.send(new AdminInitiateAuthCommand(authReq));
    console.log(`Created user ${username} with password ${password}`);

    const challengeReq = {
        UserPoolId: userpoolId,
        ClientId: clientId,
        ChallengeName: authRes.ChallengeName,
        Session: authRes.Session,
        ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: randomPassword()
        }
    };

    const challengeRes = await client.send(new AdminRespondToAuthChallengeCommand(challengeReq));
    console.log(`User ${username} authenticated`);

    return {
        username,
        password,
        firstName,
        lastName,
        idToken: challengeRes.AuthenticationResult.IdToken,
    }
}

module.exports = {
    anAuthenticatedUser
}