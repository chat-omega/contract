// Playwright Test Configuration
// https://playwright.dev/docs/test-configuration

module.exports = {
    testDir: './tests',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: true,
        timeout: 120000,
    },
};
