
const { init } = require('../steps/init');
const { we_invoke_search_restaurants } = require('../steps/when');
const { anAuthenticatedUserDelete } = require('../steps/teardown');
const { anAuthenticatedUser } = require('../steps/given');

describe(`When we invoke the GET /restaurants/search endpoint with the keyword 'cartoon'`, () => {
    let user;
    beforeAll(async () => {
        await init();
        user = await anAuthenticatedUser();
    });

    afterAll(async () => {
        await anAuthenticatedUserDelete(user);
    });

    it(`Should return an array of 4 restaurants`, async () => {
        const res = await we_invoke_search_restaurants('cartoon', user);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(4);

        for (let restaurant of res.body) {
        expect(restaurant).toHaveProperty('name');
        expect(restaurant).toHaveProperty('image');
        }
    });
});