import { Validator, ValidatorResult } from 'jsonschema';
import assert from 'assert';

const v = new Validator();

export function validateSchema(response: any, schema: any): boolean {
    const result: ValidatorResult = v.validate(response, schema);

    if (result.valid) {
        console.log('Response is valid according to the schema.');
    } else {
        console.error('Response is NOT valid according to the schema');
        console.log(JSON.stringify(result, null, 2));

        result.errors.forEach(error => {
            console.error(`Error: ${error.stack}`);
        });

        assert.fail('Schema validation failed');
    }

    return result.valid;
}