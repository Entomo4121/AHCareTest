import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { password, username, demoUrl, demoUsername, demoPassword, loginUrl } from '../utils/loginDetails';
import { RapidRegistration } from '../pages/RapidRegistration';
import { RegisterNewPatient } from '../pages/RegisterNewPatientPage';
import { EditPatientRegistration } from '../pages/EditPatientRegistrationPage';
import { meta } from 'reporting-labs';
import { Appointment } from '../pages/AppointmentPage';



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

// test('Test 4: login with valid user credentials and RegisterPatient', async ({ page }) => {
//   meta({ priority: 'P1', severity: 'Major Blocker', feature: 'RegisterPatient', owner: 'Ravi Kumar' , story: 'EMM-751' });
//   const loginPage = new LoginPage(page);
//   const registerNewPatient = new RegisterNewPatient(page);
//   await loginPage.gotoLoginPage();
//   await loginPage.login(username, password);
//   await loginPage.verifyLoginSuccess();
//   await registerNewPatient.selectCurrentLocation();
//   await registerNewPatient.selectLocalLocationName();
//   await registerNewPatient.clickPatientRegistrationButton();
//   await registerNewPatient.selectTitle();

//   // Tab 1: Patient's details
//   await registerNewPatient.enterPatientDetails();
//   await registerNewPatient.continueToNextTab();

//   // Tab 2: Next of Kin
//   await registerNewPatient.fillNextOfKinDetails();
//   await registerNewPatient.continueToNextTab();

//   // Tab 3: Documents (no mandatory fields beyond defaults)
//   await registerNewPatient.continueToNextTab();

//   // Tab 4: Payer Group
//   await registerNewPatient.selectBillingGroup();
//   await registerNewPatient.continueToNextTab();

//   // Tab 5: Review & Confirm
//   await registerNewPatient.createPatientAccount();
//   await registerNewPatient.captureAndSavePatientId();
//   console.log('Patient Registration Completed Successfully.');
//   console.log('Patient ID Captured and Saved Successfully.');
// });

// test('Test 5: login and open the latest patientID for editing', async ({ page }) => {
//   test.setTimeout(60_000);
//   meta({ priority: 'P1', severity: 'Major Blocker', feature: 'EditPatient', owner: 'Ravi Kumar', story: 'EMM-751' });
//   const loginPage = new LoginPage(page);
//   const editPatientRegistration = new EditPatientRegistration(page);

//   await loginPage.gotoLoginPage();
//   await loginPage.login(username, password);
//   await loginPage.verifyLoginSuccess();
//   const patientId = await editPatientRegistration.openLatestPatientForEdit();
//   await expect(editPatientRegistration.firstNameInput).toBeVisible();
//   console.log(`Opened patient ${patientId} for editing.`);
// });

// test('Test 6: login and open the latest patientID for appointment booking', async ({ page }) => {
//   test.setTimeout(60_000);
//   meta({ priority: 'P1', severity: 'Major Blocker', feature: 'BookAppointment', owner: 'Ravi Kumar', story: 'EMM-751' });
//   const loginPage = new LoginPage(page);
//   const bookLatestPatientAppointment = new Appointment(page);

//   await loginPage.gotoLoginPage();
//   await loginPage.login(username, password);
//   await loginPage.verifyLoginSuccess();
//   const patientId = await bookLatestPatientAppointment.openLatestPatientForAppointment();
//   console.log(`Opened patient ${patientId} for appointment booking.`);


// });

test('Test 7: rapid registration of a new patient (Citizen)', async ({ page }) => {
  test.setTimeout(120_000);
  meta({ priority: 'P1', severity: 'Major Blocker', feature: 'RapidRegistration', owner: 'Ravi Kumar', story: 'EMM-751' });
  test.info().annotations.push({
    type: 'defect',
    description: 'Rapid Registration validates hidden Occupation field as required; Continue is blocked on Patient\'s details.',
  });
  const loginPage = new LoginPage(page);
  const rapid = new RapidRegistration(page);

  await page.goto(loginUrl);
  await loginPage.login(username, password);
  await rapid.confirmDefaultFacility();
  await rapid.selectCurrentLocation();
  await rapid.openRegisterNewPatient();
  await rapid.enableRapidRegistration();

  await rapid.fillPatientDetails();
  await rapid.continueToNextOfKin();
  await rapid.enterNextOfKinName();
  // Payer Group (Cash Patient(Cash)) -> Submit -> OK: pending, Patient's details does not advance yet.
});
