export interface ClinicProfile {
  clinicName: string;
  doctorName: string;
  credentials: string;
  registrationNo: string;
  address: string;
  website: string;
  phone: string;
}

export interface Patient {
  id: string; // unique generated id, e.g. RX-2026-0001
  name: string;
  mobile: string;
  email: string;
  govtIdNo: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bloodGroup: string;
  createdAt: string;
}

export interface Vitals {
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
}

export interface LabItem {
  name: string;
  result: string;
}

export interface ImagingItem {
  type: "X-Ray" | "USG" | "CT" | "MRI" | "";
  study: string;
  result: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  complaint: string;
  vitals: Vitals;
  labs: LabItem[];
  imaging: ImagingItem[];
  diagnosis: string;
  medications: Medication[];
  aiAnalysis?: string;
}

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const LAB_TESTS = [
  "CBC",
  "Lipid Profile",
  "Fasting Blood Sugar",
  "HbA1c",
  "Renal Function Test",
  "Liver Function Test",
  "Thyroid Profile",
  "Troponin I/T",
  "BNP / NT-proBNP",
  "D-Dimer",
  "Electrolytes",
  "Urine Routine",
  "Other",
];
export const IMAGING_TYPES = ["X-Ray", "USG", "CT", "MRI"] as const;
export const IMAGING_STUDIES: Record<string, string[]> = {
  "X-Ray": ["Chest PA View", "Abdomen", "Spine", "Extremity", "Other"],
  USG: ["Abdomen", "Echocardiogram (Echo)", "Carotid Doppler", "Renal", "Pelvis", "Other"],
  CT: ["CT Chest", "CT Brain", "CT Coronary Angiogram", "CT Abdomen", "Other"],
  MRI: ["MRI Brain", "MRI Spine", "Cardiac MRI", "MRI Joint", "Other"],
};
