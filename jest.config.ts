export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    verbose: true,

    // Suporte a ES Modules
    extensionsToTreatAsEsm: ['.ts'],

    // Se precisar resolver import de .js ou .ts
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/tests/k6/'
    ],
};