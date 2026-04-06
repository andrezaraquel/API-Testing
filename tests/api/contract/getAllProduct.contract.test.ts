import { getRequest } from "../../helpers/request";
import { validateSchema } from "../../helpers/schemaValidator";

import productsSchema from "../../schema/products.schema.json";

describe('Contract: Get All Products', () => {

    const path = '/products';

    it('should validate contract', async () => {
        const response = await getRequest(path);
        validateSchema(response, productsSchema);
    });

});