import * as recordService from "./record_service";
import { DoctorPatientInfo } from "../models/patients";
import { ERR_NOT_AUTHORIZED } from "../models/errors";

export function getDoctors(): Promise<DoctorPatientInfo[]> {
  return recordService.get("/doctors/get", { json: true }).then(response => {
    if (response.statusCode === 200) {
      const doctors = response.body.data as DoctorPatientInfo[];
      return doctors;
    }
    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown error: ${response.toJSON()}`);
  });
}
