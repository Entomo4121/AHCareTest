import { test, expect } from '../fixtures/loginFixture';
import { meta } from 'reporting-labs';
import { RegisterNewPatient } from '../pages/RegisterNewPatientPage';
import { EditPatientRegistration } from '../pages/EditPatientRegistrationPage';

// Tests run in order on ONE worker, sharing a single login session.
// Edit depends on the patient ID saved by Register, so serial mode also skips Edit if Register fails.
test.describe.configure({ mode: 'serial' });

test('Test 1: login with invalid user credentials', async ({ page }) => {
  meta({ priority: 'P2', severity: 'High', feature: 'Login', owner: 'Ravi Kumar' , story: 'EMM-751' });
  console.log('Test 1: login with invalid user credentials');
});


test('Test 2: login with valid userid and test the build', async ({ page }) => {
  meta({ priority: 'P3', severity: 'blocker', feature: 'Login', owner: 'Ravi Kumar' , story: 'EMM-751' });
  console.log('Test 2: login with valid userid and build test');
});


test('Test 3: login with valid credentials and navigate to home page', async ({ page }) => {
  meta({ priority: 'P4', severity: 'Major', feature: 'Login', owner: 'Ravi Kumar' , story: 'EMM-751' });
  console.log('Test 3: login with valid credentials and navigate to home page');
});


test('Test 4: register a new patient', async ({ sharedPage }) => {
  test.setTimeout(120_000);
  meta({ priority: 'P1', severity: 'Major Blocker', feature: 'RegisterPatient', owner: 'Ravi Kumar', story: 'EMM-751' });
  const registerNewPatient = new RegisterNewPatient(sharedPage);

  await registerNewPatient.registerNewPatient();
});

test('Test 5: open the latest patient for editing', async ({ sharedPage }) => {
  test.setTimeout(60_000);
  meta({ priority: 'P1', severity: 'Major Blocker', feature: 'EditPatient', owner: 'Ravi Kumar', story: 'EMM-751' });
  const editPatientRegistration = new EditPatientRegistration(sharedPage);

  const patientId = await editPatientRegistration.editLatestPatient();
  console.log(`Edited patient ${patientId}.`);
});
