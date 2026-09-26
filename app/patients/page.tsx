"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { addPatient, calcBmi, getPatients, nextPatientId } from "@/lib/storage";
import { BLOOD_GROUPS, Patient } from "@/lib/types";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  govtIdNo: "",
  weightKg: "",
  heightCm: "",
  bloodGroup: BLOOD_GROUPS[0],
};

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const bmi = calcBmi(Number(form.weightKg) || 0, Number(form.heightCm) || 0);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPatient(): Patient {
    return {
      id: nextPatientId(),
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      govtIdNo: form.govtIdNo,
      weightKg: Number(form.weightKg) || 0,
      heightCm: Number(form.heightCm) || 0,
      bmi: calcBmi(Number(form.weightKg) || 0, Number(form.heightCm) || 0),
      bloodGroup: form.bloodGroup,
      createdAt: new Date().toISOString(),
    };
  }

  function handleRegister(startConsult: boolean) {
    if (!form.name || !form.mobile) {
      alert("Name and mobile number are required.");
      return;
    }
    const patient = buildPatient();
    addPatient(patient);
    setPatients(getPatients());
    setForm(emptyForm);
    setShowForm(false);
    if (startConsult) {
      router.push(`/patients/${patient.id}/consult`);
    }
  }

  return (
    <main>
      <NavBar />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-clinic-dark">Patient Registry</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-clinic-teal text-white px-4 py-2 rounded-md text-sm hover:bg-clinic-dark transition-colors"
        >
          {showForm ? "Cancel" : "+ Register New Patient"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-clinic-teal/20 p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name *" value={form.name} onChange={(v) => update("name", v)} />
            <Field label="Mobile No. *" value={form.mobile} onChange={(v) => update("mobile", v)} />
            <Field label="Email Address" value={form.email} onChange={(v) => update("email", v)} />
            <Field label="ID No. (Aadhaar/Passport etc.)" value={form.govtIdNo} onChange={(v) => update("govtIdNo", v)} />
            <Field label="Weight (kg)" value={form.weightKg} onChange={(v) => update("weightKg", v)} type="number" />
            <Field label="Height (cm)" value={form.heightCm} onChange={(v) => update("heightCm", v)} type="number" />
            <label className="block">
              <span className="block text-sm font-medium text-clinic-dark/80 mb-1">Blood Group</span>
              <select
                className="w-full rounded-md border border-clinic-teal/30 px-3 py-2 text-sm"
                value={form.bloodGroup}
                onChange={(e) => update("bloodGroup", e.target.value)}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col justify-end">
              <span className="text-sm font-medium text-clinic-dark/80 mb-1">BMI (auto)</span>
              <div className="rounded-md bg-clinic-paper border border-clinic-teal/20 px-3 py-2 text-sm">
                {bmi ? bmi : "—"}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleRegister(false)}
              className="border border-clinic-teal text-clinic-teal px-4 py-2 rounded-md text-sm hover:bg-clinic-teal/10 transition-colors"
            >
              Register
            </button>
            <button
              onClick={() => handleRegister(true)}
              className="bg-clinic-terracotta text-white px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity"
            >
              Register &amp; Start Consultation
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-clinic-teal/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-clinic-paper text-left">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">BMI</th>
              <th className="px-4 py-2">Blood Grp</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-clinic-dark/50">
                  No patients registered yet.
                </td>
              </tr>
            )}
            {patients.map((p) => (
              <tr key={p.id} className="border-t border-clinic-teal/10">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.mobile}</td>
                <td className="px-4 py-2">{p.bmi || "—"}</td>
                <td className="px-4 py-2">{p.bloodGroup}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => router.push(`/patients/${p.id}/consult`)}
                    className="text-clinic-teal hover:underline"
                  >
                    Consult →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-clinic-dark/80 mb-1">{label}</span>
      <input
        type={type}
        className="w-full rounded-md border border-clinic-teal/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-teal/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
