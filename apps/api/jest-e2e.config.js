module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  moduleNameMapper: {
    '^@app/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testEnvironment: 'node',
  // E2E-tests praten met een echte (lokale) database, dus max 1 tegelijk om
  // race conditions tussen tests op dezelfde data te voorkomen.
  maxWorkers: 1,
};
