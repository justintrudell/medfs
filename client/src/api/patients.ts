import * as recordService from "./record_service";
import {
  DoctorPatientInfo,
  PatientInfo,
  BloodType,
  Sex
} from "../models/patients";
import { ERR_NOT_AUTHORIZED, ERR_USER_NOT_FOUND } from "../models/errors";
import { RecordItem } from "../models/records";
import { getAllForUser } from "./records";

type DoctorPatientInfoResponse = {
  id: string;
  email: string;
  dateAdded: string;
};

export interface PatientInfoResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  bloodType: string;
  sex: string;
}

function coerceDoctorPatientInfo(
  response: DoctorPatientInfoResponse
): DoctorPatientInfo {
  return {
    ...response,
    dateAdded: new Date(response.dateAdded)
  };
}

function coercePatientInfo(response: PatientInfoResponse): PatientInfo {
  return {
    ...response,
    dateOfBirth:
      response.dateOfBirth !== null ? new Date(response.dateOfBirth) : null,
    bloodType: response.bloodType as BloodType,
    sex: response.sex as Sex
  };
}

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

export function getPatients(): Promise<DoctorPatientInfo[]> {
  return recordService.get("/patients/get", { json: true }).then(response => {
    if (response.statusCode === 200) {
      const patients = response.body.data as DoctorPatientInfoResponse[];
      return patients.map(item => coerceDoctorPatientInfo(item));
    }
    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}

export function getPatientInfo(patientId?: string): Promise<PatientInfo> {
  const url =
    patientId !== undefined ? "/patients/info/" + patientId : "/patients/info";

  return recordService.get(url, { json: true }).then(response => {
    // 200, 400, 403
    if (response.statusCode === 200) {
      const patientInfo = response.body.data as PatientInfoResponse;
      return coercePatientInfo(patientInfo);
    }

    if (response.statusCode === 403) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}

export function updatePatientInfo(info: PatientInfo): Promise<string> {
  const data = {
    ...info,
    dateOfBirth: "",
    bloodType: info.bloodType as string,
    sex: info.sex as string
  };

  if (info.dateOfBirth !== null) {
    data.dateOfBirth =
      info.dateOfBirth!.getFullYear() +
      "-" +
      (info.dateOfBirth!.getMonth() + 1) +
      "-" +
      info.dateOfBirth!.getDate();
  }

  return recordService.post("/patients/update", data).then(response => {
    if (response.statusCode === 200) {
      return "Successfully updated settings.";
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}

export function getAllForPatient(patientId: string): Promise<RecordItem[]> {
  return getAllForUser(patientId);
}

export function respondToPatientRequest(
  doctorId: string,
  accepted: boolean,
  notificationId: string
): Promise<string> {
  const data = {
    doctorId,
    accepted,
    notificationId
  };

  return recordService.post("/patients/respond", data).then(response => {
    if (response.statusCode === 200) {
      return "Successfully added patient";
    } else if (response.statusCode === 302) {
      return "Already responded";
    } else if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    } else if (response.statusCode === 404) {
      throw new Error(ERR_USER_NOT_FOUND);
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}
