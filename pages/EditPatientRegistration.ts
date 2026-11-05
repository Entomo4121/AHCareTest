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
            .locator('xpath=../..')
            .getByRole('button', { name: 'Edit', exact: true })
            .first();
    }

    async editPatientName() {
        await this.patientNameInput.fill(editPatientdata.firstNameEdit);
    }

    async openLatestPatientForEdit(): Promise<string> {
        const patientsNewestFirst = [...patientIdDetails].sort(
            (first, second) => Date.parse(second.capturedAt) - Date.parse(first.capturedAt),
        );
        if (patientsNewestFirst.length === 0) {
            throw new Error('No patient ID was found in patientIdDetails.json');
        }

        const patientFullName = [
            patientData.title,
            patientData.firstName,
            patientData.secondName,
            patientData.familyName,
        ]
            .filter(Boolean)
            .join(' ');
        const patientNameResult = this.page.getByRole('button', {
            name: patientFullName,
            exact: true,
        });
        const noRecordsMessage = this.page.getByText('No Records Found', { exact: true });

        let latestAvailablePatient: (typeof patientIdDetails)[number] | undefined;
        for (const patient of patientsNewestFirst) {
            await this.patientSearchInput.fill(patient.patientId);
            await patientNameResult.or(noRecordsMessage).waitFor({
                state: 'visible',
                timeout: 3_000,
            });
            if (await patientNameResult.isVisible()) {
                latestAvailablePatient = patient;
                break;
            }
        }

        if (!latestAvailablePatient) {
            throw new Error('None of the patient IDs in patientIdDetails.json could be found');
        }

        await patientNameResult.click();
        await this.editButton.click();
        await this.firstNameInput.fill(editPatientdata.firstNameEdit);
        return latestAvailablePatient.patientId;
    }
}