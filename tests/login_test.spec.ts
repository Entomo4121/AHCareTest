import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { password, username } from '../utils/loginDetails';
import { RegisterNewPatient } from '../pages/RegisterNewPatient';
import { EditPatientRegistration } from '../pages/EditPatientRegistration';
import { meta } from 'reporting-labs';



test('Test 1: login with invalid user credentials', async ({ page }) => {
  meta({ priority: 'P2', severity: 'High', feature: 'Login', owner: 'Ravi Kumar' , story: 'EMM-751' });
  console.log('Test 1: login with invalid user credentials');
});


test('Test 2: login with invalid userid', async ({ page }) => {
  meta({ priority: 'P3', severity: 'blocker', feature: 'Login', owner: 'Ravi Kumar' , story: 'EMM-751' });

  console.log('Test 2: login with invalid userid');
});


test('Test 3: login with invalid password', async ({ page }) => {
  meta({ priority: 'P4', severity: 'Major', feature: 'Login', owner: 'Ravi Kumar' , story: 'EMM-751' });
  console.log('Test 3: login with invalid password');
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

test('Test 4: login and open the latest patientID for editing', async ({ page }) => {
  meta({ priority: 'P1', severity: 'Major Blocker', feature: 'EditPatient', owner: 'Ravi Kumar', story: 'EMM-751' });
  const loginPage = new LoginPage(page);
  const editPatientRegistration = new EditPatientRegistration(page);

  await loginPage.gotoLoginPage();
  await loginPage.login(username, password);
  await loginPage.verifyLoginSuccess();
  const patientId = await editPatientRegistration.openLatestPatientForEdit();
  console.log(`Opened patient ${patientId} for editing.`);
});





