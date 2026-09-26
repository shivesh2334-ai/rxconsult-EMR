# RxConsult

Clinic prescription & consultation app.

## Features
- **Clinic/Doctor Profile** — name, credentials, address, website, registration no. Appears as the header on every prescription.
- **Patient Registry** — name, mobile, email, ID no., auto-generated unique ID, weight/height with auto-calculated BMI, blood group. "Register" or "Register & Start Consultation".
- **Consultation** — complaint, vitals (BP, pulse, temp, SpO2), lab advice + results (dropdown), imaging advice + results (X-Ray/USG/CT/MRI dropdown), diagnosis, medications in a standard prescription table.
- **AI Analysis** — a summary box aggregates all entered data; "Run AI Analysis" calls Claude (via a server-side API route) for a summary, suggestions, differential diagnosis and treatment considerations for physician review.
- **Prescription output** — formatted prescription view with **Print** and **Share** buttons.

Data is stored in the browser's localStorage for this initial version (no login/multi-device sync yet). See "Next steps" below for adding a database.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Create a `.env.local` file (not committed) with:

```
ANTHROPIC_API_KEY=sk-ant-...
```

This key is only used server-side in `app/api/ai-analysis/route.ts` and is never exposed to the browser.

## Deploying

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — RxConsult"
git branch -M main
git remote add origin https://github.com/<your-username>/rxconsult.git
git push -u origin main
```
(Or use the GitHub web UI "Upload files" / Working Copy on iPad if you prefer not to use the terminal.)

### 2. Deploy to Vercel
1. Go to https://vercel.com/new and import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Add the environment variable `ANTHROPIC_API_KEY` in the Vercel project settings.
4. Set the deployment region to **Mumbai (bom1)** in Project Settings → Functions (optional, matches your usual setup).
5. Deploy.

## Next steps (optional)
- Replace localStorage with Supabase for persistent, multi-device patient records (matches your usual stack).
- Add authentication if multiple doctors/staff will use the same deployment.
- Add PDF export of the prescription in addition to browser print.
