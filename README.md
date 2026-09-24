# Playwright Test Demo Framework

This project is a Playwright-based UI automation framework designed for validating a AHCare healthcare application workflow. It follows a Page Object Model (POM) structure and includes browser automation, data-driven patient registration, and Allure/HTML reporting.

## 1. Overview

The framework is built to:

- automate login flows then followed by all modules of AHCare
- validate page navigation and UI actions
- register new patient records using page objects
- reuse test data from JSON files
- generate test reports using Playwright HTML and Allure
- run tests across multiple browsers

The test suite is organized to keep the automation readable, maintainable, and scalable.

---

## 2. Tech Stack

- Playwright Test
- TypeScript
- Data Driven
- Page Object Model
- Allure reporting
- JSON-based test data
- Node.js

Core dependency versions are defined in the project package configuration:

- `@playwright/test`
- `allure-playwright`
- `allure-commandline`
- `@types/node`

---

## 3. Project Structure

```text
PWTestDemo/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── .vscode/
│   ├── mcp.json
│   └── settings.json
├── allure-report/
│   └── generated HTML reports
├── allure-results/
│   └── raw Allure test result files
├── pages/
│   ├── LoginPage.ts
│   └── RegisterNewPatient.ts
├── scripts/
│   ├── debug-allure-report.js
│   ├── debug-allure-route.js
│   └── generate-allure-pdf.js
├── TestData/
│   └── patientRegistrationData.json
├── tests/
│   ├── demo.spec.ts
│   └── login_test.spec.ts
├── utils/
│   └── loginDetails.ts
├── screenshots/
│   └── captured UI screenshots
├── node_modules/
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
├── playwright-report/
├── test-results/
└── README.md
```

### Folder responsibilities

| Folder / File | Purpose |
| --- | --- |
| `pages/` | Contains reusable page object classes for login and patient registration flows. |
| `tests/` | Contains Playwright test specs for execution. |
| `utils/` | Stores shared constants like login URL, username, and password. |
| `TestData/` | Stores JSON test input used for patient registration scenarios. |
| `scripts/` | Contains helper scripts for report debugging and PDF generation. |
| `allure-results/` | Stores raw Allure results generated during test execution. |
| `allure-report/` | Holds generated HTML Allure report output. |
| `playwright-report/` | Stores Playwright HTML report output. |
| `screenshots/` | Keeps screenshots captured during tests. |
| `.github/workflows/` | CI workflow configuration for automated execution in GitHub Actions. |

---

## 4. Key Framework Files

### `playwright.config.ts`

This file is the main Playwright configuration file. It defines:

- test directory: `./tests`
- parallel execution enabled
- browser projects for Chromium, Firefox, and WebKit
- report generation:
  - HTML report in `playwright-report`
  - Allure report in `allure-results`
- trace collection for retries

Important configuration details:

| Setting | Value |
| --- | --- |
| `testDir` | `./tests` |
| `fullyParallel` | `true` |
| `retries` | `0` on local, `2` on CI |
| `workers` | undefined locally, 1 on CI |
| `reporters` | `list`, `html`, `allure-playwright` |
| `trace` | `on-first-retry` |

### `package.json`

The project uses NPM scripts for test execution and reporting.

#### Scripts table

| Command | Description |
| --- | --- |
| `npm test` | Runs the default Playwright suite. |
| `npm run test:headed` | Runs tests in headed mode for visual execution. |
| `npm run test:allure` | Runs tests with Allure integration. |
| `npm run allure:generate` | Generates the Allure HTML report from `allure-results`. |
| `npm run allure:open` | Opens the generated Allure report in the browser. |
| `npm run allure:pdf` | Converts the Allure HTML report to PDF using Playwright. |
| `npm run allure:generate:pdf` | Generates the report and exports it to PDF in one flow. |

### `pages/LoginPage.ts`

This page object encapsulates the login workflow:

- opens login URL
- fills username and password
- clicks the login button
- verifies that the application redirects successfully after login

### `pages/RegisterNewPatient.ts`

This page object covers the patient registration flow.

It includes actions such as:

- opening the current location facility flow
- switching to the relevant workspace/facility
- clicking the `Register New Patient` option
- filling patient personal details and metadata
- capturing a screenshot after entering key data
- continuing the registration flow

### `utils/loginDetails.ts`

Stores shared login credentials and app endpoint details.

Example values used in this project:

- login URL: application base URL
- username: test user
- password: test password

### `TestData/patientRegistrationData.json`

Contains patient profile input used by the registration automation. This allows the framework to separate test data from test code and makes the suite easier to update.

---

## 5. Test Execution Workflow

The automation flow is structured around tests that create page object instances and call reusable methods.

### Example test flow

`tests/login_test.spec.ts` performs the following:

1. open login page
2. login using valid credentials
3. confirm a successful redirect
4. access the current location area
5. navigate to the patient registration dashboard
6. fill in registration details
7. continue the patient registration process

This demonstrates a realistic end-to-end flow for the healthcare application used in this project.

---

## 6. Running Tests

### Install dependencies

```bash
npm install
```

### Run the full suite

```bash
npx playwright test
```

### Run in headed mode

```bash
npm run test:headed
```

### Run a single test file

```bash
npx playwright test tests/login_test.spec.ts
```

### Run a specific browser project

```bash
npx playwright test --project=chromium
```

### Open the Playwright HTML report

```bash
npx playwright show-report
```

---

## 7. Playwright Command Reference

| Purpose | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Run all tests | `npx playwright test` |
| Run tests in headed mode | `npx playwright test --headed` |
| Run a single spec file | `npx playwright test tests/login_test.spec.ts` |
| Run a specific project | `npx playwright test --project=chromium` |
| Run only in Firefox | `npx playwright test --project=firefox` |
| Run only in WebKit | `npx playwright test --project=webkit` |
| Run tests matching a title | `npx playwright test -g "login with valid user credentials"` |
| Show HTML report | `npx playwright show-report` |
| Open report with custom output | `npx playwright test --reporter=html` |

---

## 8. Reporting Setup

This framework includes both Playwright and Allure reporting.

### HTML report

Configuration included in `playwright.config.ts`:

- output folder: `playwright-report`
- report opens only when explicitly requested

### Allure report

Allure is configured in the Playwright config using `allure-playwright`.

| Command | Purpose |
| --- | --- |
| `npm run allure:generate` | Generates a static HTML report from raw result files. |
| `npm run allure:open` | Opens the generated Allure report locally. |
| `npm run allure:pdf` | Exports the report into a PDF file. |
| `npm run allure:generate:pdf` | Generates the HTML report and creates a PDF in a single workflow. |

Generated result folders:

- `allure-results/` — raw structured result data
- `allure-report/` — visual HTML report
- `playwright-report/` — Playwright HTML output

---

## 9. CI/CD Integration

The repository includes GitHub Actions workflow configuration under `.github/workflows/playwright.yml`.

The workflow performs the following steps:

1. checks out the repository
2. sets up Node.js
3. installs dependencies with `npm ci`
4. installs Playwright browser dependencies
5. runs the Playwright test suite
6. uploads the Playwright report as an artifact

This ensures the framework can run in an automated CI environment.

---

## 10. Best Practices Built into the Framework

This project follows a few common automation practices:

- page objects are separated from test logic
- test data is stored outside test specs
- reusable selectors and actions are centralized in page classes
- screenshots are captured at important flow stages
- reporting is configured for both debugging and presentation
- cross-browser execution is supported by default

---

## 11. Example Flow Summary

A typical execution looks like this:

```ts
const loginPage = new LoginPage(page);
const registerNewPatient = new RegisterNewPatient(page);

await loginPage.gotoLoginPage();
await loginPage.login(username, password);
await loginPage.verifyLoginSuccess();

await registerNewPatient.clickCurrentLocationButton();
await registerNewPatient.clickFacilitySwitcher();
await registerNewPatient.clickPatientRegistrationButton();
await registerNewPatient.selectTitle();
await registerNewPatient.enterPatientName();
```

This pattern is easy to expand for additional patient workflows, validations, or e2e regression scenarios.

---

## 12. Notes

- The framework currently targets multiple browser engines via Playwright projects.
- Test data and selectors are intentionally centralized for easier updates when the application changes.
- The project is suitable for UI regression testing, smoke testing, and workflow validation for patient management modules.

---

## 13. Suggested Next Enhancements

Potential future improvements include:

- adding environment-based config for dev, test, and prod
- using `dotenv` for secure secrets
- creating reusable helper methods for complex forms
- splitting tests into smoke, regression, and critical-path suites
- adding API validation alongside UI automation

---

## 14. How to add to github

Create a new repository on the command line
echo "# Repo Name" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Entomo4121/AHCareAutomation.git
git push -u origin main

## 15. Summary

This repository is a functional Playwright automation framework with a Page Object Model, JSON-driven data, multi-browser support, and reporting capabilities. It is structured to support continued growth and can be used as a base for broader end-to-end testing across the application.
