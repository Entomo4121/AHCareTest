import { rmSync } from 'fs';

// Clears stale allure-results from previous runs so the report only reflects the current run.
export default function globalSetup() {
  rmSync('allure-results', { recursive: true, force: true });
}
