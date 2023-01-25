
const { init } = require('../steps/init');
const { we_invoke_search_restaurants } = require('../steps/when');

describe(`When we invoke the GET /restaurants/search endpoint with the keyword 'cartoon'`, () => {
    beforeAll(async () => await init());

    it(`Should return an array of 4 restaurants`, async () => {
        const res = await we_invoke_search_restaurants('cartoon');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(4);

        for (let restaurant of res.body) {
        expect(restaurant).toHaveProperty('name');
        expect(restaurant).toHaveProperty('image');
        }
    });
});