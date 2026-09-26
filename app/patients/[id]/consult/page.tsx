"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import {
  getConsultationsForPatient,
  getPatient,
  getProfile,
  saveConsultation,
} from "@/lib/storage";
import {
  ClinicProfile,
  Consultation,
  IMAGING_STUDIES,
  IMAGING_TYPES,
  ImagingItem,
  LabItem,
  LAB_TESTS,
  Medication,
  Patient,
  Vitals,
} from "@/lib/types";

function newId() {
  return `CONS-${Date.now()}`;
}

export default function ConsultPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<ClinicProfile | null>(null);

  const [complaint, setComplaint] = useState("");
  const [vitals, setVitals] = useState<Vitals>({ bp: "", pulse: "", temp: "", spo2: "" });
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [imaging, setImaging] = useState<ImagingItem[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dose: "", frequency: "", duration: "", instructions: "" },
  ]);

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showPrescription, setShowPrescription] = useState(false);
  const [consultId] = useState(newId());

  useEffect(() => {
    setPatient(getPatient(params.id) ?? null);
    setProfile(getProfile());
    const history = getConsultationsForPatient(params.id);
    if (history.length > 0) {
      // preload most recent as a starting point (optional convenience)
    }
  }, [params.id]);

  function addLab() {
    setLabs((l) => [...l, { name: LAB_TESTS[0], result: "" }]);
  }
  function updateLab(idx: number, patch: Partial<LabItem>) {
    setLabs((l) => l.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function removeLab(idx: number) {
    setLabs((l) => l.filter((_, i) => i !== idx));
  }

  function addImaging() {
    setImaging((l) => [...l, { type: "X-Ray", study: IMAGING_STUDIES["X-Ray"][0], result: "" }]);
  }
  function updateImaging(idx: number, patch: Partial<ImagingItem>) {
    setImaging((l) => l.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function removeImaging(idx: number) {
    setImaging((l) => l.filter((_, i) => i !== idx));
  }

  function addMedication() {
    setMedications((m) => [...m, { name: "", dose: "", frequency: "", duration: "", instructions: "" }]);
  }
  function updateMedication(idx: number, patch: Partial<Medication>) {
    setMedications((m) => m.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }
  function removeMedication(idx: number) {
    setMedications((m) => m.filter((_, i) => i !== idx));
  }

  const summaryText = useMemo(() => {
    if (!patient) return "";
    const lines = [
      `Patient: ${patient.name} (${patient.id}), ${patient.bloodGroup}, BMI ${patient.bmi || "N/A"}`,
      `Complaint: ${complaint || "—"}`,
      `Vitals: BP ${vitals.bp || "—"}, Pulse ${vitals.pulse || "—"}, Temp ${vitals.temp || "—"}, SpO2 ${vitals.spo2 || "—"}`,
      `Lab results: ${labs.length ? labs.map((l) => `${l.name}: ${l.result || "pending"}`).join("; ") : "none advised"}`,
      `Imaging: ${imaging.length ? imaging.map((i) => `${i.type} ${i.study}: ${i.result || "pending"}`).join("; ") : "none advised"}`,
      `Diagnosis (working): ${diagnosis || "—"}`,
      `Medications: ${
        medications.filter((m) => m.name).length
          ? medications
              .filter((m) => m.name)
              .map((m) => `${m.name} ${m.dose} ${m.frequency} x ${m.duration}`)
              .join("; ")
          : "none entered"
      }`,
    ];
    return lines.join("\n");
  }, [patient, complaint, vitals, labs, imaging, diagnosis, medications]);

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiError("");
    setAiAnalysis("");
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI analysis failed.");
      setAiAnalysis(data.analysis);
    } catch (e: any) {
      setAiError(e.message || "Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  }

  function persist() {
    if (!patient) return;
    const consultation: Consultation = {
      id: consultId,
      patientId: patient.id,
      date: new Date().toISOString(),
      complaint,
      vitals,
      labs,
      imaging,
      diagnosis,
      medications,
      aiAnalysis,
    };
    saveConsultation(consultation);
  }

  function handleCreatePrescription() {
    persist();
    setShowPrescription(true);
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const text = `Prescription for ${patient?.name} (${patient?.id})\n\n${summaryText}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Prescription", text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Share not supported on this browser — prescription copied to clipboard instead.");
    }
  }

  if (!patient) {
    return (
      <main>
        <NavBar />
        <p className="text-clinic-dark/70">Patient not found.</p>
      </main>
    );
  }

  if (showPrescription) {
    return (
      <main>
        <NavBar />
        <div className="no-print flex justify-between items-center mb-4">
          <button onClick={() => setShowPrescription(false)} className="text-sm text-clinic-teal hover:underline">
            ← Back to edit
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-clinic-teal text-white px-4 py-2 rounded-md text-sm hover:bg-clinic-dark"
            >
              Print
            </button>
            <button
              onClick={handleShare}
              className="bg-clinic-terracotta text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
            >
              Share
            </button>
          </div>
        </div>

        <div id="prescription" className="bg-white border border-clinic-teal/30 rounded-lg p-8">
          <header className="text-center border-b-2 border-clinic-teal pb-3 mb-4">
            <div className="text-xl font-bold text-clinic-dark">{profile?.clinicName || "Clinic Name"}</div>
            <div className="text-sm">
              {profile?.doctorName}
              {profile?.credentials ? `, ${profile.credentials}` : ""}
            </div>
            <div className="text-xs text-clinic-dark/70">
              {profile?.address} {profile?.website ? `| ${profile.website}` : ""}
            </div>
            <div className="text-xs text-clinic-dark/70">
              {profile?.registrationNo ? `Reg. No: ${profile.registrationNo}` : ""}
            </div>
          </header>

          <div className="flex justify-between text-sm mb-4">
            <div>
              <div>
                <strong>Patient:</strong> {patient.name} ({patient.id})
              </div>
              <div>
                <strong>Mobile:</strong> {patient.mobile} &nbsp; <strong>Blood Group:</strong> {patient.bloodGroup}
              </div>
              <div>
                <strong>Wt/Ht/BMI:</strong> {patient.weightKg}kg / {patient.heightCm}cm / {patient.bmi}
              </div>
            </div>
            <div className="text-right">
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <Section title="Complaint">{complaint || "—"}</Section>

          <Section title="Vitals">
            BP {vitals.bp || "—"} | Pulse {vitals.pulse || "—"} | Temp {vitals.temp || "—"} | SpO2 {vitals.spo2 || "—"}
          </Section>

          {labs.length > 0 && (
            <Section title="Investigations Advised / Results">
              <ul className="list-disc pl-5">
                {labs.map((l, i) => (
                  <li key={i}>
                    {l.name}: {l.result || "pending"}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {imaging.length > 0 && (
            <Section title="Imaging Advised / Results">
              <ul className="list-disc pl-5">
                {imaging.map((im, i) => (
                  <li key={i}>
                    {im.type} — {im.study}: {im.result || "pending"}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Diagnosis">{diagnosis || "—"}</Section>

          <Section title="Rx (Medications)">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-clinic-dark/20">
                  <th className="py-1">Medicine</th>
                  <th className="py-1">Dose</th>
                  <th className="py-1">Frequency</th>
                  <th className="py-1">Duration</th>
                  <th className="py-1">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {medications
                  .filter((m) => m.name)
                  .map((m, i) => (
                    <tr key={i} className="border-b border-clinic-dark/10">
                      <td className="py-1">{m.name}</td>
                      <td className="py-1">{m.dose}</td>
                      <td className="py-1">{m.frequency}</td>
                      <td className="py-1">{m.duration}</td>
                      <td className="py-1">{m.instructions}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Section>

          {aiAnalysis && (
            <Section title="AI-Assisted Summary & Suggestions (for physician review)">
              <pre className="whitespace-pre-wrap text-xs bg-clinic-paper p-3 rounded">{aiAnalysis}</pre>
            </Section>
          )}

          <div className="mt-10 text-right text-sm">
            <div className="mt-8">_____________________</div>
            <div>{profile?.doctorName || "Doctor Signature"}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <NavBar />
      <h1 className="text-xl font-semibold text-clinic-dark mb-1">
        Consultation — {patient.name} ({patient.id})
      </h1>
      <p className="text-sm text-clinic-dark/60 mb-4">
        BMI {patient.bmi || "—"} | Blood Group {patient.bloodGroup}
      </p>

      <div className="space-y-6">
        <Card title="Complaint">
          <textarea
            className="w-full rounded-md border border-clinic-teal/30 px-3 py-2 text-sm"
            rows={2}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Presenting complaint..."
          />
        </Card>

        <Card title="Vitals">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniField label="BP (mmHg)" value={vitals.bp} onChange={(v) => setVitals((x) => ({ ...x, bp: v }))} />
            <MiniField
              label="Pulse (/min)"
              value={vitals.pulse}
              onChange={(v) => setVitals((x) => ({ ...x, pulse: v }))}
            />
            <MiniField
              label="Temp (°F)"
              value={vitals.temp}
              onChange={(v) => setVitals((x) => ({ ...x, temp: v }))}
            />
            <MiniField label="SpO2 (%)" value={vitals.spo2} onChange={(v) => setVitals((x) => ({ ...x, spo2: v }))} />
          </div>
        </Card>

        <Card title="Lab Advice & Results">
          {labs.map((lab, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <select
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                value={lab.name}
                onChange={(e) => updateLab(i, { name: e.target.value })}
              >
                {LAB_TESTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                placeholder="Enter result"
                value={lab.result}
                onChange={(e) => updateLab(i, { result: e.target.value })}
              />
              <button onClick={() => removeLab(i)} className="text-clinic-terracotta text-sm">
                Remove
              </button>
            </div>
          ))}
          <button onClick={addLab} className="text-sm text-clinic-teal hover:underline">
            + Add lab test
          </button>
        </Card>

        <Card title="Imaging Advice & Results">
          {imaging.map((im, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center flex-wrap">
              <select
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                value={im.type}
                onChange={(e) => {
                  const type = e.target.value as ImagingItem["type"];
                  updateImaging(i, { type, study: IMAGING_STUDIES[type]?.[0] ?? "" });
                }}
              >
                {IMAGING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                value={im.study}
                onChange={(e) => updateImaging(i, { study: e.target.value })}
              >
                {(IMAGING_STUDIES[im.type] ?? []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 min-w-[140px] rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                placeholder="Enter result"
                value={im.result}
                onChange={(e) => updateImaging(i, { result: e.target.value })}
              />
              <button onClick={() => removeImaging(i)} className="text-clinic-terracotta text-sm">
                Remove
              </button>
            </div>
          ))}
          <button onClick={addImaging} className="text-sm text-clinic-teal hover:underline">
            + Add imaging study
          </button>
        </Card>

        <Card title="Diagnosis">
          <textarea
            className="w-full rounded-md border border-clinic-teal/30 px-3 py-2 text-sm"
            rows={2}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Working / final diagnosis..."
          />
        </Card>

        <Card title="Medications (Rx)">
          {medications.map((m, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2 items-center">
              <input
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                placeholder="Medicine name"
                value={m.name}
                onChange={(e) => updateMedication(i, { name: e.target.value })}
              />
              <input
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                placeholder="Dose (e.g. 5mg)"
                value={m.dose}
                onChange={(e) => updateMedication(i, { dose: e.target.value })}
              />
              <input
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                placeholder="Frequency (e.g. OD)"
                value={m.frequency}
                onChange={(e) => updateMedication(i, { frequency: e.target.value })}
              />
              <input
                className="rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                placeholder="Duration (e.g. 30 days)"
                value={m.duration}
                onChange={(e) => updateMedication(i, { duration: e.target.value })}
              />
              <div className="flex gap-1">
                <input
                  className="flex-1 rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
                  placeholder="Instructions"
                  value={m.instructions}
                  onChange={(e) => updateMedication(i, { instructions: e.target.value })}
                />
                <button onClick={() => removeMedication(i)} className="text-clinic-terracotta text-sm">
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button onClick={addMedication} className="text-sm text-clinic-teal hover:underline">
            + Add medication
          </button>
        </Card>

        <Card title="Summary & AI Analysis">
          <pre className="whitespace-pre-wrap text-xs bg-clinic-paper p-3 rounded mb-3">{summaryText}</pre>
          <button
            onClick={runAiAnalysis}
            disabled={aiLoading}
            className="bg-clinic-dark text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
          >
            {aiLoading ? "Analyzing…" : "Run AI Analysis"}
          </button>
          {aiError && <p className="text-sm text-red-600 mt-2">{aiError}</p>}
          {aiAnalysis && (
            <div className="mt-3">
              <div className="text-sm font-medium text-clinic-dark/80 mb-1">
                AI Summary, Suggestions, Diagnosis &amp; Treatment (for physician review)
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-clinic-teal/5 border border-clinic-teal/20 p-3 rounded">
                {aiAnalysis}
              </pre>
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <button
            onClick={persist}
            className="border border-clinic-teal text-clinic-teal px-4 py-2 rounded-md text-sm hover:bg-clinic-teal/10"
          >
            Save Consultation
          </button>
          <button
            onClick={handleCreatePrescription}
            className="bg-clinic-teal text-white px-4 py-2 rounded-md text-sm hover:bg-clinic-dark"
          >
            Create Prescription
          </button>
        </div>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-clinic-teal/20 p-4">
      <h2 className="text-sm font-semibold text-clinic-dark mb-3">{title}</h2>
      {children}
    </div>
  );
}

function MiniField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-clinic-dark/60 mb-1">{label}</span>
      <input
        className="w-full rounded-md border border-clinic-teal/30 px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wide text-clinic-teal font-semibold mb-1">{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
