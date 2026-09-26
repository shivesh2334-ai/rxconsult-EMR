"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { getProfile, saveProfile } from "@/lib/storage";
import { ClinicProfile } from "@/lib/types";

const empty: ClinicProfile = {
  clinicName: "",
  doctorName: "",
  credentials: "",
  registrationNo: "",
  address: "",
  website: "",
  phone: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ClinicProfile>(empty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile(existing);
  }, []);

  function update<K extends keyof ClinicProfile>(key: K, value: ClinicProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
  }

  return (
    <main>
      <NavBar />
      <h1 className="text-xl font-semibold text-clinic-dark mb-4">Clinic / Doctor Profile</h1>
      <div className="bg-white rounded-lg border border-clinic-teal/20 p-6 space-y-4 max-w-xl">
        <Field label="Clinic / Hospital Name" value={profile.clinicName} onChange={(v) => update("clinicName", v)} />
        <Field label="Doctor Name" value={profile.doctorName} onChange={(v) => update("doctorName", v)} />
        <Field
          label="Credentials (e.g. MD, DM Cardiology)"
          value={profile.credentials}
          onChange={(v) => update("credentials", v)}
        />
        <Field
          label="Registration No."
          value={profile.registrationNo}
          onChange={(v) => update("registrationNo", v)}
        />
        <Field label="Address" value={profile.address} onChange={(v) => update("address", v)} textarea />
        <Field label="Website" value={profile.website} onChange={(v) => update("website", v)} />
        <Field label="Phone" value={profile.phone} onChange={(v) => update("phone", v)} />
        <button
          onClick={handleSave}
          className="bg-clinic-teal text-white px-4 py-2 rounded-md text-sm hover:bg-clinic-dark transition-colors"
        >
          Save Profile
        </button>
        {saved && <span className="ml-3 text-sm text-clinic-teal">Saved.</span>}
      </div>

      {(profile.clinicName || profile.doctorName) && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-clinic-dark/70 mb-2">Preview — prescription header</h2>
          <div className="bg-white border border-clinic-teal/30 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-clinic-dark">{profile.clinicName || "Clinic Name"}</div>
            <div className="text-sm">
              {profile.doctorName}
              {profile.credentials ? `, ${profile.credentials}` : ""}
            </div>
            <div className="text-xs text-clinic-dark/70">
              {profile.address} {profile.website ? `| ${profile.website}` : ""}
            </div>
            <div className="text-xs text-clinic-dark/70">
              {profile.registrationNo ? `Reg. No: ${profile.registrationNo}` : ""}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-clinic-dark/80 mb-1">{label}</span>
      {textarea ? (
        <textarea
          className="w-full rounded-md border border-clinic-teal/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-teal/40"
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-md border border-clinic-teal/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-teal/40"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
