import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  testTimeout: 30000,
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/"],
  projects: [
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/tests/unit/**/*.test.ts",
        "<rootDir>/tests/unit/**/*.test.tsx",
      ],
      setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      globals: {
        "ts-jest": {
          tsconfig: "<rootDir>/tsconfig.jest.json",
          isolatedModules: true,
        },
      },
    },
    {
      displayName: "integration",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/tests/setup/integration.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      globals: {
        "ts-jest": {
          tsconfig: "<rootDir>/tsconfig.jest.json",
        },
      },
    },
  ],
};

export default config;
