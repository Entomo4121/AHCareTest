import { expect, Locator, Page } from '@playwright/test';
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
    readonly civilIdInput: Locator;
    readonly saveButton: Locator;

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
        this.civilIdInput = page.getByRole('textbox', { name: 'CIVIL ID', exact: true });
        // Several sections have a Save button (e.g. File Storage has Reset + Save). Patient's Details
        // is the one that sits next to Close. Role-based, since generated react-aria ids change per render.
        this.saveButton = page
            .getByRole('button', { name: 'Close', exact: true })
            .locator('xpath=..')
            .getByRole('button', { name: 'Save', exact: true });
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

        // Search results show "<prefix> <first> <second> <family>"; match on the name only,
        // since the prefix saved in the application can differ from the test data title.
        const patientFullName = [
            patientData.firstName,
            patientData.secondName,
            patientData.familyName,
        ].join(' ');
        const patientNameResult = this.page.getByRole('button', {
            name: new RegExp(`${patientFullName}$`),
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
        await expect(this.civilIdInput).toBeVisible();
        return latestAvailablePatient.patientId;
    }

    /** Runs the complete edit flow in one call: open the latest patient, change CIVIL ID, save. */
    async editLatestPatient(): Promise<string> {
        const patientId = await this.openLatestPatientForEdit();
        await this.editCivilIdAndSave();
        return patientId;
    }

    /** Replaces the CIVIL ID (10 digits max) with a unique per-run value and saves the patient. */
    async editCivilIdAndSave(): Promise<string> {
        const newCivilId = Date.now().toString().slice(-10);
        await this.civilIdInput.fill(newCivilId);
        await expect(this.civilIdInput).toHaveValue(newCivilId);
        await expect(this.saveButton).toHaveCount(1); // must be unique
        await this.saveButton.click();
        console.log(`Edited CIVIL ID to ${newCivilId} and clicked Save`);
        return newCivilId;
    }
}