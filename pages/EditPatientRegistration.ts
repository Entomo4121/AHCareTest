import { Locator, Page } from '@playwright/test';
import editPatientdata from '../TestData/EditPatintRegistrationData.json';

export class EditPatientRegistration {
    readonly page: Page;
    readonly patientNameInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.patientNameInput = page.locator('input[name="patientName"]');
    }

    async editPatientName() {
        await this.patientNameInput.fill(editPatientdata.firstNameEdit);
    }
}