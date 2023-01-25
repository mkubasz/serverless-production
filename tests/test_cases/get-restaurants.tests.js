const { init } = require('../steps/init');
const { we_invoke_get_restaurants } = require('../steps/when');

describe(`When we invoke the GET / restaurants endpoint`, () => {
  beforeAll(async () => await init());

    it(`Should return an array of 8 restaurants`, async () => {
        const res = await we_invoke_get_restaurants();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(8);

        for(let restaurant of res.body) {
            expect(restaurant).toHaveProperty('name');
            expect(restaurant).toHaveProperty('image');
        }
    });
});