import * as fs from 'fs';
import * as path from 'path';

const patientIdDetailsFile = path.join(__dirname, 'patientIdDetails.json');

interface PatientIdEntry {
  patientId: string;
  capturedAt: string;
}

/** Appends a newly created patient's ID to utils/provider/patientIdDetails.json. */
export function savePatientId(patientId: string): void {
  let details: PatientIdEntry[] = [];
  if (fs.existsSync(patientIdDetailsFile)) {
    details = JSON.parse(fs.readFileSync(patientIdDetailsFile, 'utf-8'));
  }
  details.push({ patientId, capturedAt: new Date().toISOString() });
  fs.writeFileSync(patientIdDetailsFile, JSON.stringify(details, null, 2));
}
