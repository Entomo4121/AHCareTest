import { expect, Locator, Page } from '@playwright/test';
import patientData from '../TestData/patientRegistrationData.json';
import patientIdDetails from '../utils/provider/patientIdDetails.json';

export interface AppointmentDetails {
  location: string;
  visitType: string;
  physicianOrEquipment: string;
  service: string;
  slot: string;
}

export class Appointment {
  readonly page: Page;
  readonly patientSearchInput: Locator;
  readonly appointmentShortcut: Locator;
  readonly appointmentsNavigation: Locator;
  readonly newAppointmentButton: Locator;
  readonly saveAndContinueButton: Locator;
  readonly continueButton: Locator;
  readonly bookAppointmentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.patientSearchInput = page.getByRole('textbox', {
      name: 'Search Name, Patient ID, Mobile Number',
      exact: true,
    });
    this.appointmentShortcut = page.getByRole('button', {
      name: 'Appointment',
      exact: true,
    });
    this.appointmentsNavigation = page.getByText('Appointments', { exact: true });
    this.newAppointmentButton = page.getByRole('button', {
      name: 'New Appointment',
      exact: true,
    });
    this.saveAndContinueButton = page.getByRole('button', {
      name: 'Save and Continue',
      exact: true,
    });
    this.continueButton = page.getByRole('button', {
      name: 'Continue',
      exact: true,
    });
    this.bookAppointmentButton = page.getByRole('button', {
      name: /^Book(?: Appointment)?$/i,
    });
  }

  async openLatestPatientForAppointment(): Promise<string> {
    const [latestPatient] = [...patientIdDetails].sort(
      (first, second) => Date.parse(second.capturedAt) - Date.parse(first.capturedAt),
    );
    if (!latestPatient) {
      throw new Error('No patient ID was found in patientIdDetails.json');
    }

    const patientIdResult = this.page
      .locator('button, [role="button"], tr, a, li, div')
      .filter({ hasText: latestPatient.patientId })
      .first();
    const noRecordsMessage = this.page.getByText('No Records Found', { exact: true }).first();

    await this.patientSearchInput.fill(latestPatient.patientId);
    await this.patientSearchInput.press('Enter');
    await expect
      .poll(
        async () =>
          (await patientIdResult.isVisible()) ||
          (await noRecordsMessage.isVisible()) ||
          (await this.page.getByText(/No Records Found|Patient not found/i).first().isVisible()),
        { message: `Waiting for search results for patient ${latestPatient.patientId}` },
      )
      .toBe(true);
    if (!(await patientIdResult.isVisible())) {
      throw new Error(`Latest patient ID ${latestPatient.patientId} could not be found`);
    }

    await patientIdResult.click();
    await this.appointmentShortcut.click();
    await this.page.getByRole('button', { name: /Appointment/i, exact: true }).click();
    await this.appointmentsNavigation.click();
    await this.newAppointmentButton.click();

    return latestPatient.patientId;
  }

  async bookAppointment(details: AppointmentDetails): Promise<void> {
    for (const [field, value] of Object.entries(details)) {
      if (!value.trim()) {
        throw new Error(`Appointment ${field} must be provided`);
      }
    }

    await this.selectFromDropdown('Location', details.location);
    await this.selectFromDropdown('Visit Type', details.visitType);
    await this.selectFromDropdown('Physician/Equipment', details.physicianOrEquipment);
    await this.selectFromDropdown('Service', details.service);
    await this.saveAndContinueButton.click();

    const appointmentSlot = this.page.getByRole('button', {
      name: details.slot,
      exact: true,
    });
    await expect(appointmentSlot).toBeVisible();
    await appointmentSlot.click();
    await this.continueButton.click();
    await this.bookAppointmentButton.click();
  }

  async bookLatestPatientAppointment(details: AppointmentDetails): Promise<string> {
    const patientId = await this.openLatestPatientForAppointment();
    await this.bookAppointment(details);
    return patientId;
  }

  private async selectFromDropdown(label: string, value: string): Promise<void> {
    const field = this.page.getByRole('textbox', { name: label, exact: true });
    await expect(field).toBeVisible();
    await field.click();
    await field.fill(value);

    const option = this.page.getByText(value, { exact: true }).first();
    await expect(option).toBeVisible();
    await option.click();
  }
}