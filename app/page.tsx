import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <main>
      <NavBar />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/profile"
          className="block rounded-lg border border-clinic-teal/20 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-clinic-dark mb-1">1. Clinic / Doctor Profile</h2>
          <p className="text-sm text-clinic-dark/70">
            Set the name, credentials, address, website and registration number that appear on every prescription header.
          </p>
        </Link>
        <Link
          href="/patients"
          className="block rounded-lg border border-clinic-teal/20 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-clinic-dark mb-1">2. Patient Registry</h2>
          <p className="text-sm text-clinic-dark/70">
            Register a new patient (auto BMI, unique ID) and start a consultation, or browse existing patients.
          </p>
        </Link>
      </div>
    </main>
  );
}
