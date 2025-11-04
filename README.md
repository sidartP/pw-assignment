# Playwright QA Assessment

End-to-end automation framework built with Playwright and TypeScript for the Demo Web Shop checkout flow.

## Prerequisites
- Node.js 18+
- npm

## Setup
```bash
npm install
```

## Running Tests
- Default run (headless): `npm test`
- Headed mode: `npm run test:headed`
- Show HTML report (after a run): `npm run test:report`

## Custom JSON Reporter
- Test executions produce `artifacts/test-report.json`.
- Override the target file with `PLAYWRIGHT_JSON_REPORT=custom/path.json npm test`.

## Test Flow Covered
1. Login with provided credentials.
2. Add two books to the cart.
3. Verify cart quantity and contents.
4. Complete checkout and assert confirmation.

## Project Structure
```
.
├── playwright.config.ts
├── reporters
│   └── json-reporter.ts
├── src
│   └── pages
│       ├── books-page.ts
│       ├── cart-page.ts
│       ├── checkout-page.ts
│       └── login-page.ts
└── tests
    └── e2e
        └── cart-checkout.spec.ts
```
