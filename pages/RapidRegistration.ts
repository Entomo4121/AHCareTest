import { expect, Locator, Page } from '@playwright/test';
import data from '../TestData/rapidRegistrationData.json';

/**
 * Register New Patient with the "Rapid Registration" toggle ON (demo-ahcare).
 * Rapid mode has three steps: Patient's details -> Next of Kin -> Payer Group.
 * Locators were taken from the live DOM / accessibility tree.
 */
export class RapidRegistration {
  readonly page: Page;

  // Home / navigation
  readonly selectFacilityHeading: Locator;
  readonly facilityContinueButton: Locator;
  readonly currentLocationButton: Locator;
  readonly registerNewPatientLink: Locator;
  readonly rapidRegistrationLabel: Locator;
  readonly rapidRegistrationSwitch: Locator;

  // Patient's details
  readonly titleInput: Locator;
  readonly firstNameInput: Locator;
  readonly secondNameInput: Locator;
  readonly thirdNameInput: Locator;
  readonly familyNameInput: Locator;
  readonly localFirstNameInput: Locator;
  readonly localLastNameInput: Locator;
  readonly seriesInput: Locator;
  readonly nationalIdInput: Locator;
  readonly genderGroup: Locator;
  readonly ageYearsInput: Locator;
  readonly ageMonthsInput: Locator;
  readonly ageDaysInput: Locator;
  readonly nationalityInput: Locator;
  readonly iqamaInput: Locator;
  readonly passportInput: Locator;
  readonly countryCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly addressLine1Input: Locator;
  readonly addressCountryInput: Locator;
  readonly addressTownInput: Locator;
  readonly religionInput: Locator;
  readonly continueButton: Locator;
  readonly continueToPayerGroupButton: Locator;
  readonly resetButton: Locator;

  // Modals
  readonly modalOkButton: Locator;
  readonly modalCancelButton: Locator;

  // Next of Kin
  readonly nextOfKinNameInput: Locator;

  /** Unique per run so the app's ID checks don't collide on re-runs. */
  private readonly suffix = Date.now().toString().slice(-9);
  readonly nationalId = '1' + this.suffix; // app rule: "National ID must start with "1"."
  readonly iqamaId = 'IQ' + this.suffix.slice(-8); // app rule: alpha + numeric combination
  readonly passport = this.suffix.slice(-8); // app rule: alphabets not allowed

  constructor(page: Page) {
    this.page = page;
    const textbox = (name: string) => page.getByRole('textbox', { name, exact: true });

    this.selectFacilityHeading = page.getByText('Select a facility');
    this.facilityContinueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.currentLocationButton = page.getByText('Current location');
    this.registerNewPatientLink = page.getByText('Register New Patient');
    this.rapidRegistrationLabel = page.getByText('Rapid Registration', { exact: true });
    this.rapidRegistrationSwitch = page.getByRole('switch', { name: 'Rapid Registration' });

    this.titleInput = textbox('Title').first();
    this.firstNameInput = textbox('First Name');
    this.secondNameInput = textbox('Second Name');
    this.thirdNameInput = textbox('Third Name');
    this.familyNameInput = textbox('Family Name');
    this.localFirstNameInput = textbox('First name');
    this.localLastNameInput = textbox('Last name');
    this.seriesInput = textbox('Select Series');
    this.nationalIdInput = textbox('National ID Number').first();
    this.genderGroup = page.getByRole('radiogroup', { name: 'Gender' });
    this.ageYearsInput = textbox('Age years');
    this.ageMonthsInput = textbox('Age months');
    this.ageDaysInput = textbox('Age days');
    this.nationalityInput = textbox('Nationality');
    this.iqamaInput = textbox('IQAMA / ID');
    this.passportInput = textbox('Passport');
    this.countryCodeInput = textbox('Select code').first();
    this.phoneInput = textbox('Phone number').first();
    this.emailInput = textbox('Email address').first();
    this.addressLine1Input = textbox('Address Line 1').first();
    this.addressCountryInput = textbox('Country').first();
    this.addressTownInput = textbox('Town').first();
    this.religionInput = textbox('Religion');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.continueToPayerGroupButton = page.getByRole('button', { name: 'Continue to Payer Group' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    this.modalOkButton = page.getByRole('button', { name: 'OK', exact: true });
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel', exact: true });

    this.nextOfKinNameInput = page.locator('#nok-name');
  }

  /** Searchable dropdowns render options as plain text nodes (no listbox role). */
  private async pick(field: Locator, typed: string, optionText: string) {
    await field.click();
    await field.fill('');
    await field.pressSequentially(typed || ' ', { delay: 60 });
    if (!typed) await field.press('Backspace');
    const option = this.page.getByText(optionText, { exact: true }).first();
    await option.waitFor({ state: 'visible' });
    // A previous popup can still be closing and intercept the pointer; the option itself is resolved.
    await option.click({ force: true });
    await expect(field).toHaveValue(new RegExp(optionText.replace(/[()+]/g, '\\$&')));
  }

  //------------------ Navigation ------------------//

  /**
   * "Select a facility" appears only for accounts with access to more than one facility.
   * Wait for either that dialog or the home page, then keep the pre-selected facility if asked.
   */
  async confirmDefaultFacility() {
    await expect(this.selectFacilityHeading.or(this.currentLocationButton)).toBeVisible({ timeout: 15_000 });
    if (await this.selectFacilityHeading.isVisible()) {
      await this.facilityContinueButton.click();
      await expect(this.selectFacilityHeading).toBeHidden();
    }
  }

  async selectCurrentLocation(location = data.location) {
    await this.currentLocationButton.click();
    await this.page.getByText(location, { exact: true }).click();
  }

  async openRegisterNewPatient() {
    await this.registerNewPatientLink.click();
    await expect(this.page.getByRole('heading', { name: 'Register a New Patient' })).toBeVisible();
  }

  /** The switch input is visually hidden behind a wrapper, so click its visible label. */
  async enableRapidRegistration() {
    await this.rapidRegistrationLabel.click();
    await expect(this.rapidRegistrationSwitch).toBeChecked();
  }

  //------------------ Patient's details ------------------//

  async enterPatientName() {
    await this.pick(this.titleInput, data.title, data.title);
    await this.firstNameInput.fill(data.firstName);
    await this.secondNameInput.fill(data.secondName);
    await this.thirdNameInput.fill(data.thirdName);
    await this.familyNameInput.fill(data.familyName);
  }

  async enterLocalLanguageName() {
    await this.localFirstNameInput.fill(data.firstNameLocal);
    await this.localLastNameInput.fill(data.lastNameLocal);
  }

  /** Patient Series is pre-filled by the app; verify it rather than overwrite it. */
  async verifyPatientSeries() {
    await expect(this.seriesInput).toHaveValue(data.series);
  }

  /** A valid National ID triggers "change the Patient Series to National ID Series?" — keep the current series. */
  async enterNationalId() {
    await this.nationalIdInput.fill(this.nationalId);
    await this.nationalIdInput.press('Tab');
    await this.modalCancelButton.click();
    await expect(this.nationalIdInput).toHaveValue(this.nationalId);
    await expect(this.seriesInput).toHaveValue(data.series);
  }

  async selectGender() {
    await this.genderGroup.getByRole('button', { name: data.gender, exact: true }).click();
  }

  async enterAgeYMD() {
    await this.ageYearsInput.fill(data.ageYears);
    await this.ageMonthsInput.fill(data.ageMonths);
    await this.ageDaysInput.fill(data.ageDays);
  }

  /** Citizen residency defaults Nationality to SAUDI. */
  async verifyNationality() {
    await expect(this.nationalityInput).toHaveValue(data.nationality);
  }

  async enterIqamaId() {
    await this.iqamaInput.fill(this.iqamaId);
    await this.iqamaInput.press('Tab');
    await expect(this.iqamaInput).toHaveValue(this.iqamaId);
  }

  async enterPassport() {
    await this.passportInput.fill(this.passport);
    await this.passportInput.press('Tab');
    await expect(this.passportInput).toHaveValue(this.passport);
  }

  /** Contact details are mandatory (*) on the form. */
  async enterContactDetails() {
    await this.pick(this.countryCodeInput, data.contactCountryCode, `SA (${data.contactCountryCode})`);
    await this.phoneInput.fill(data.contactPhoneNumber);
    await this.emailInput.fill(data.email);
  }

  /** Address is mandatory (*); selecting Town auto-fills Area, Governorate and Postal code. */
  async enterAddress() {
    await this.addressLine1Input.fill(data.addressLine1);
    await this.pick(this.addressCountryInput, data.country, data.country);
    await this.pick(this.addressTownInput, '', data.town);
  }

  /** Religion is mandatory (*). */
  async selectReligion() {
    await this.pick(this.religionInput, data.religion, data.religion);
  }

  async fillPatientDetails() {
    await this.enterPatientName();
    await this.enterLocalLanguageName();
    await this.verifyPatientSeries();
    await this.enterNationalId();
    await this.selectGender();
    await this.enterAgeYMD();
    await this.verifyNationality();
    await this.enterIqamaId();
    await this.enterPassport();
    await this.enterContactDetails();
    await this.enterAddress();
    await this.selectReligion();
  }

  /**
   * Known defect (demo-ahcare, facility MEDINOVA): Rapid Registration hides the Occupation field,
   * but validation still requires it ({ personOccupation: "Occupation is required." }), so Continue
   * shows "Please fix the highlighted errors before saving." with nothing highlighted.
   * Toggling Rapid Registration resets the form, so there is no UI workaround.
   */
  async continueToNextOfKin() {
    await this.continueButton.click();
    await expect(
      this.nextOfKinNameInput,
      'Next of Kin should open after Continue (known defect: hidden Occupation field is still validated as required in Rapid Registration)',
    ).toBeVisible();
  }

  //------------------ Next of Kin ------------------//

  async enterNextOfKinName() {
    await this.nextOfKinNameInput.fill(data.nextOfKinName);
  }
}
