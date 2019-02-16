export interface DoctorPatientInfo {
  id: string;
  email: string;
  dateAdded: Date;
}

export interface PatientInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  bloodType: BloodType;
  sex: Sex;
}

export enum BloodType {
  aNeg = "A-",
  aPos = "A+",
  bNeg = "B-",
  bPos = "B+",
  abNeg = "AB-",
  abPos = "AB+",
  oNeg = "O-",
  oPos = "O+",
}

export enum Sex {
  male = "Male",
  female = "Female",
}
