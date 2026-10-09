import { Locator, Page } from '@playwright/test';
import editPatientdata from '../TestData/EditPatintRegistrationData.json';
import patientData from '../TestData/patientRegistrationData.json';
import patientIdDetails from '../utils/provider/patientIdDetails.json';

export class EditPatientRegistration {
    readonly page: Page;
    readonly patientNameInput: Locator;
    readonly firstNameInput: Locator;
    readonly secondNameInput: Locator;
    readonly familyNameInput: Locator;
    readonly patientSearchInput: Locator;
    readonly editButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.patientNameInput = page.locator('input[name="patientName"]');
        this.firstNameInput = page.getByRole('textbox', { name: 'First Name', exact: true });
        this.secondNameInput = page.getByRole('textbox', { name: 'Second Name', exact: true });
        this.familyNameInput = page.getByRole('textbox', { name: 'Family Name', exact: true });
        this.patientSearchInput = page.getByRole('textbox', {
            name: 'Search Name, Patient ID, Mobile Number',
            exact: true,
        });
        this.editButton = page
            .locator('p', { hasText: "Patient's Details" })
            .locator('xpath=..')
            .getByRole('button', { name: 'Edit', exact: true })
            .first();
    }

    async editPatientName() {
        await this.patientNameInput.fill(editPatientdata.firstNameEdit);
    }

    async openLatestPatientForEdit(): Promise<string> {
        const latestPatient = [...patientIdDetails].sort(
            (first, second) => Date.parse(second.capturedAt) - Date.parse(first.capturedAt),
        )[0];

        if (!latestPatient) {
            throw new Error('No patient ID was found in patientIdDetails.json');
        }

        await this.patientSearchInput.fill('');
        await this.patientSearchInput.pressSequentially(latestPatient.patientId, { delay: 100 });
        const patientNameResult = this.page.getByRole('button', {
            name: `${patientData.firstName} ${patientData.secondName} ${patientData.familyName}`,
            exact: true,
        });
        
        await patientNameResult.waitFor({ state: 'visible' });
        await patientNameResult.click();
        await this.editButton.click();
        await this.firstNameInput.fill(editPatientdata.firstNameEdit);
        return latestPatient.patientId;
    }
}