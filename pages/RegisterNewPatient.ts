import { Locator, Page } from '@playwright/test';
import patientData from '../TestData/patientRegistrationData.json';
import { savePatientId } from '../utils/provider/patientIdDetails';

export class RegisterNewPatient {
  readonly page: Page;

  // Tab 1: Patient's details
  readonly patientRegistrationButton: Locator;
  readonly titleTextBox: Locator;
  readonly firstnameTextBox: Locator;
  readonly secondnameTextBox: Locator;
  readonly familynameTextBox: Locator;
  readonly localNameTextBox: Locator;
  readonly patientSeriesTextBox: Locator;
  readonly preferredFacilityNameTextBox: Locator;
  readonly RegistrationDateandTimeTextBox: Locator;
  readonly nationalIdTextBox: Locator;
  readonly genderRadioButton: Locator;
  readonly patientDOBYearTextBox: Locator;
  readonly patientDOBYearbutton: Locator;
  readonly patientDOMbutton: Locator;
  readonly patientdobDaybutton: Locator;
  readonly patientMaritalStatusDropdown: Locator;
  readonly patientResidenceTextBox: Locator;
  readonly patientNationalityDropdown: Locator;
  readonly patientOccupationDropdown: Locator;
  readonly patientIQAMAIDTextBox: Locator;
  readonly patientMobileNumberTextBox: Locator;
  readonly patientPassportNumberTextBox: Locator;
  readonly patientContactCountryCodeTextBox: Locator;
  readonly patientContactPhoneTextBox: Locator;
  readonly patientContactEmailTextBox: Locator;
  readonly patientAddressLine1TextBox: Locator;
  readonly patientAddressCountryDropdown: Locator;
  readonly patientAddressTownDropdown: Locator;
  readonly patientAddressAreaDropdown: Locator;
  readonly patientCategoryDropdown: Locator;
  readonly patientRaceDropdown: Locator;
  readonly patientReligionDropdown: Locator;
  readonly patientContinueButton: Locator;

  // Tab 2: Next of Kin
  readonly nextOfKinFullNameTextBox: Locator;

  // Tab 4: Payer Group
  readonly billingGroupSearchTextBox: Locator;

  // Tab 5: Review & Confirm
  readonly createPatientAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.patientRegistrationButton = page.getByText('Register New Patient');
    this.titleTextBox = page.getByRole("textbox", {
        name: /Prefix|Title/i
      }).first();
    this.firstnameTextBox = page.getByRole('textbox', { name: 'First Name', exact: true });
    this.secondnameTextBox = page.getByRole('textbox', { name: 'Second Name', exact: true });
    this.familynameTextBox = page.getByRole('textbox', { name: 'Family Name', exact: true });
    this.localNameTextBox = page.getByRole('textbox', { name: 'First name', exact: true });
    this.patientSeriesTextBox = page.getByPlaceholder('Select Series');
    this.preferredFacilityNameTextBox = page.getByPlaceholder('A FIRST Facility');
    this.RegistrationDateandTimeTextBox = page.locator('#react-aria3777826446-_r_25_');
    this.nationalIdTextBox = page.locator('#passportNumber');
    this.genderRadioButton = page.locator('button:has-text("Female")');
    this.patientDOBYearTextBox = page.locator('#ageYears');
    this.patientDOBYearbutton = page.locator('#react-aria641981490-_r_js_');
    this.patientDOMbutton = page.locator('#ageMonths');
    this.patientdobDaybutton = page.locator('#ageDays');
    this.patientMaritalStatusDropdown = page.getByRole('textbox', { name: 'Marital Status' });
    this.patientResidenceTextBox = page.locator('//*[@id="residencyStatus"]/button[1]');
    this.patientNationalityDropdown = page.getByRole('textbox', { name: 'Nationality' });
    this.patientOccupationDropdown = page.getByRole('textbox', { name: 'Occupation' }).first();
    // Role-based locators (not id, which is briefly duplicated with the Employment ID field
    // right after switching residency status to Non-Citizen).
    this.patientIQAMAIDTextBox = page.getByRole('textbox', { name: 'IQAMA / ID #' });
    this.patientMobileNumberTextBox = page.getByRole('textbox', { name: 'MOBILE #' });
    this.patientPassportNumberTextBox = page.locator('#altId3Number');
    this.patientContactCountryCodeTextBox = page.getByRole('textbox', { name: 'Select code' }).first();
    this.patientContactPhoneTextBox = page.getByRole('textbox', { name: 'Phone number' }).first();
    this.patientContactEmailTextBox = page.getByRole('textbox', { name: 'Email address' });
    this.patientAddressLine1TextBox = page.locator('#resAddr-line1');
    this.patientAddressCountryDropdown = page.getByRole('textbox', { name: 'Country' }).first();
    this.patientAddressTownDropdown = page.getByRole('textbox', { name: 'Town' }).first();
    this.patientAddressAreaDropdown = page.getByRole('textbox', { name: 'Area' }).first();
    this.patientCategoryDropdown = page.getByRole('textbox', { name: 'Patient Category' });
    this.patientRaceDropdown = page.getByPlaceholder('Race');
    this.patientReligionDropdown = page.getByRole('textbox', { name: 'Religion' });
    this.patientContinueButton = page.getByRole("button", {
            name: "Continue", exact: true});

    this.nextOfKinFullNameTextBox = page.locator('#nok-name');

    this.billingGroupSearchTextBox = page.getByRole('textbox', { name: 'Search billing group by code or description' });

    this.createPatientAccountButton = page.getByRole('button', { name: "Create Patient's Account" });
  }

  /** Unique per-run suffix (last 8 digits of the current timestamp) to avoid duplicate-record collisions on re-runs. */
  private readonly uniqueSuffix = Date.now().toString().slice(-8);

  /** Types into a searchable dropdown and selects the matching option from the resulting list. */
  private async selectFromDropdown(field: Locator, searchText: string, optionText: string) {
    await this.dismissEmploymentIdValidationAlert();
    await field.click();
    await field.fill('');
    // Type-then-backspace reliably triggers the dropdown's filter/open request even with no search text.
    await field.pressSequentially(searchText || ' ', { delay: 50 });
    if (!searchText) {
      await field.press('Backspace');
    }
    const option = this.page.getByText(optionText, { exact: true }).first();
    await option.waitFor({ state: 'visible' });
    // A previous dropdown's popup can still be mid-close-animation and intercept pointer events
    // here, so force the click since the target element itself is already correctly resolved.
    await option.click({ force: true });
  }

  /** Dismisses the "Alphabets and Special Characters not allowed" alert and clears the
   * optional Employment ID field it points at (see enterPatientDetails for the root cause). */
  private async dismissEmploymentIdValidationAlert() {
    const alertMessage = this.page.getByText('Alphabets and Special Characters not allowed');
    if (await alertMessage.isVisible().catch(() => false)) {
      await this.page.getByRole('button', { name: 'OK' }).click();
      await this.page.getByRole('textbox', { name: 'Employment ID' }).fill('');
    }
  }

  async clickPatientRegistrationButton() {
    await this.patientRegistrationButton.click();
    console.log('Clicked on Patient Registration Button');
  }
   async selectTitle(){
   await this.selectFromDropdown(this.titleTextBox, 'Dr', 'Dr');
    console.log('Selected Title as Dr');
  }

  async enterPatientDetails() {
    await this.firstnameTextBox.fill(patientData.firstName);
    await this.secondnameTextBox.fill(patientData.secondName);
    await this.familynameTextBox.fill(patientData.familyName);
    await this.localNameTextBox.fill(patientData.localName);
    await this.patientSeriesTextBox.click();
    await this.patientSeriesTextBox.fill(patientData.series);
    const uniqueNationalId = this.uniqueSuffix.padStart(10, '0');
    await this.nationalIdTextBox.fill(uniqueNationalId);
    console.log(`Entered National ID as ${uniqueNationalId}`);
    
    await this.genderRadioButton.click();
    console.log(`Selected Gender as ${patientData.gender}`);
    
    await this.patientDOBYearTextBox.fill(patientData.ageYears);
    await this.patientDOMbutton.fill(patientData.ageMonths);
    await this.patientdobDaybutton.fill(patientData.ageDays);
    console.log(`Selected Patient DOB as ${patientData.ageYears}/${patientData.ageMonths}/${patientData.ageDays}`);

    await this.selectFromDropdown(this.patientMaritalStatusDropdown, patientData.maritalStatus, patientData.maritalStatus);
    console.log(`Selected Patient Marital Status as ${patientData.maritalStatus}`);

    await this.patientResidenceTextBox.click();
    console.log(`Selected Patient Residence as ${patientData.residenceStatus}`);

    // Citizen keeps the default Nationality (SAUDI); no re-selection needed here.
    await this.selectFromDropdown(this.patientOccupationDropdown, patientData.occupation, patientData.occupation);
    console.log(`Selected Patient Occupation as ${patientData.occupation}`);

    const uniqueIqamaId = `IQ${this.uniqueSuffix}`;
    await this.patientIQAMAIDTextBox.fill(uniqueIqamaId);
    console.log(`Entered Patient IQAMA ID as ${uniqueIqamaId}`);

    // MOBILE # must contain both alpha and numeric characters.
    const uniqueMobileNumber = `ABCY${this.uniqueSuffix}`.slice(0, 10);
    await this.patientMobileNumberTextBox.fill(uniqueMobileNumber);
    console.log(`Entered Patient Mobile Number as ${uniqueMobileNumber}`);

    
    await this.patientPassportNumberTextBox.fill("2345678987");
    console.log(`Entered Patient Passport Number as 2345678987`);
    // Known app defect: selecting Non-Citizen residency intermittently mirrors the IQAMA value
    // into the numeric-only Employment ID field, triggering a blocking "Alphabets not allowed"
    // alert. Guard every subsequent interaction against it.
    // await this.dismissEmploymentIdValidationAlert();

    await this.selectFromDropdown(this.patientContactCountryCodeTextBox, patientData.contactCountryCode, `SA (${patientData.contactCountryCode})`);
    await this.patientContactPhoneTextBox.fill(patientData.contactPhoneNumber);
    await this.patientContactEmailTextBox.fill(patientData.email);
    console.log(`Entered Patient Contact details as ${patientData.contactCountryCode} ${patientData.contactPhoneNumber} / ${patientData.email}`);

    // await this.dismissEmploymentIdValidationAlert();
    await this.patientAddressLine1TextBox.fill(patientData.addressLine1);
    await this.selectFromDropdown(this.patientAddressCountryDropdown, patientData.country, patientData.country);
    // Selecting Town auto-populates Area, Governorate and Postal code for this Country;
    // re-selecting Area to a different value desyncs it from the auto-filled Area Code.
    await this.selectFromDropdown(this.patientAddressTownDropdown, '', patientData.town);
    console.log(`Entered Patient Address as ${patientData.addressLine1}, ${patientData.town}, ${patientData.country}`);

    await this.selectFromDropdown(this.patientCategoryDropdown, patientData.patientCategory, patientData.patientCategory);
    console.log(`Selected Patient Category as ${patientData.patientCategory}`);

    await this.selectFromDropdown(this.patientRaceDropdown, patientData.race, patientData.race);
    console.log(`Selected Patient Race as ${patientData.race}`);

    await this.selectFromDropdown(this.patientReligionDropdown, patientData.religion, patientData.religion);
    console.log(`Selected Patient Religion as ${patientData.religion}`);

    // Defensive re-check: the Employment ID alert (see dismissEmploymentIdValidationAlert) can
    // revert Passport and the auto-populated address fields as a side effect of dismissal.
    if (!(await this.patientPassportNumberTextBox.inputValue())) {
      await this.patientPassportNumberTextBox.fill(`PP${this.uniqueSuffix}`);
      console.log('Re-entered Patient Passport Number after Employment ID alert reverted it');
    }
    if (!(await this.patientAddressTownDropdown.inputValue())) {
      await this.selectFromDropdown(this.patientAddressTownDropdown, '', patientData.town);
      console.log('Re-entered Patient Address Town after Employment ID alert reverted it');
    }

    await this.page.screenshot({
      path: './screenshots/register-new-patient-full-page.png',
      fullPage: true,
    });
    console.log('Captured full-page screenshot of the Register New Patient page');
  }

  async continueToNextTab() {
    await this.dismissEmploymentIdValidationAlert();
    await this.patientContinueButton.click();
    console.log('Clicked on Continue Button');
  }

  async fillNextOfKinDetails() {
    await this.nextOfKinFullNameTextBox.fill(patientData.nextOfKinName);
    console.log(`Entered Patient Next of Kin Name as ${patientData.nextOfKinName}`);
  }

  async selectBillingGroup() {
    await this.selectFromDropdown(this.billingGroupSearchTextBox, patientData.billingGroup, `${patientData.billingGroup}(Cash)`);
    console.log(`Selected Billing Group as ${patientData.billingGroup}`);
  }

  async createPatientAccount() {
    await this.createPatientAccountButton.click();
    console.log("Clicked on Create Patient's Account Button");
  }

  /** Captures the generated Patient ID from the success toast and saves it to utils/provider. */
  async captureAndSavePatientId(): Promise<string> {
    const successToast = this.page.getByText(/Patient ID\s*:\s*\S+\s*Created Successfully/i);
    await successToast.waitFor({ state: 'visible' });
    const toastText = await successToast.textContent();
    const patientId = toastText?.match(/Patient ID\s*:\s*(\S+)/i)?.[1] ?? '';
    console.log(`Captured Patient ID: ${patientId}`);
    savePatientId(patientId);
    return patientId;
  }
}
