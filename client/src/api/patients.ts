import * as recordService from "./record_service";
import { PatientInfo } from "../models/patients";
import { ERR_NOT_AUTHORIZED, ERR_USER_NOT_FOUND } from "../models/errors";

export function addPatient(email: string): Promise<string> {
  const data = {
    email
  };
  return recordService.post("/patients/add", data).then(response => {
    if (response.statusCode === 200) {
      return "Successfully added patient";
    } else if (response.statusCode === 302) {
      return "Patient already exists";
    } else if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    } else if (response.statusCode === 404) {
      throw new Error(ERR_USER_NOT_FOUND);
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}

type PatientInfoResponse = {
  id: string;
  email: string;
  dateAdded: string;
};

function coercePatientInfo(response: PatientInfoResponse): PatientInfo {
  return {
    ...response,
    dateAdded: new Date(response.dateAdded)
  };
}

export function getPatients(): Promise<PatientInfo[]> {
  return recordService.get("/patients/get", { json: true }).then(response => {
    if (response.statusCode === 200) {
      const patients = response.body.data as PatientInfoResponse[];
      return patients.map(item => coercePatientInfo(item));
    }
    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}
