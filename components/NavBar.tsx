"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="no-print flex items-center justify-between mb-6 pb-4 border-b border-clinic-teal/20">
      <Link href="/" className="text-xl font-semibold text-clinic-dark">
        RxConsult
      </Link>
      <div className="flex gap-4 text-sm">
        <Link href="/profile" className="hover:text-clinic-teal">
          Clinic Profile
        </Link>
        <Link href="/patients" className="hover:text-clinic-teal">
          Patients
        </Link>
      </div>
    </nav>
  );
}
