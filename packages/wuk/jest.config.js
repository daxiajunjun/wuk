module.exports = {
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  transform: {
    '\\.ts$': 'ts-jest',
    '\\.tsx$': 'ts-jest'
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  }
};
