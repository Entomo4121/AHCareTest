import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { password, username } from '../utils/loginDetails';
import { RegisterNewPatient } from '../pages/RegisterNewPatient';

test('login with valid user credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const registerNewPatient = new RegisterNewPatient(page);
  await loginPage.gotoLoginPage();
  await loginPage.login(username, password);
  await loginPage.verifyLoginSuccess();
  await registerNewPatient.clickPatientRegistrationButton();
  await registerNewPatient.selectTitle();

  // Tab 1: Patient's details
  await registerNewPatient.enterPatientDetails();
  await registerNewPatient.continueToNextTab();

  // Tab 2: Next of Kin
  await registerNewPatient.fillNextOfKinDetails();
  await registerNewPatient.continueToNextTab();

  // Tab 3: Documents (no mandatory fields beyond defaults)
  await registerNewPatient.continueToNextTab();

  // Tab 4: Payer Group
  await registerNewPatient.selectBillingGroup();
  await registerNewPatient.continueToNextTab();

  // Tab 5: Review & Confirm
  await registerNewPatient.createPatientAccount();
  await registerNewPatient.captureAndSavePatientId();
  console.log('Patient Registration Completed Successfully.');
  console.log('Patient ID captured and saved successfully.');
});



