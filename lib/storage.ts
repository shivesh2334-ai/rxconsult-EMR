"use client";

import { ClinicProfile, Consultation, Patient } from "./types";

const KEYS = {
  profile: "rxconsult:profile",
  patients: "rxconsult:patients",
  consultations: "rxconsult:consultations",
  counter: "rxconsult:patient-counter",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): ClinicProfile | null {
  return read<ClinicProfile | null>(KEYS.profile, null);
}

export function saveProfile(profile: ClinicProfile) {
  write(KEYS.profile, profile);
}

export function getPatients(): Patient[] {
  return read<Patient[]>(KEYS.patients, []);
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function nextPatientId(): string {
  const year = new Date().getFullYear();
  const count = read<number>(KEYS.counter, 0) + 1;
  write(KEYS.counter, count);
  return `RX-${year}-${String(count).padStart(4, "0")}`;
}

export function addPatient(patient: Patient) {
  const patients = getPatients();
  patients.unshift(patient);
  write(KEYS.patients, patients);
}

export function getConsultations(): Consultation[] {
  return read<Consultation[]>(KEYS.consultations, []);
}

export function getConsultationsForPatient(patientId: string): Consultation[] {
  return getConsultations().filter((c) => c.patientId === patientId);
}

export function getConsultation(id: string): Consultation | undefined {
  return getConsultations().find((c) => c.id === id);
}

export function saveConsultation(consultation: Consultation) {
  const all = getConsultations();
  const idx = all.findIndex((c) => c.id === consultation.id);
  if (idx >= 0) all[idx] = consultation;
  else all.unshift(consultation);
  write(KEYS.consultations, all);
}

export function calcBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
