import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    // Allow individual tests up to 60s (geodesic integration is expensive).
    testTimeout: 60000,
  },
});
