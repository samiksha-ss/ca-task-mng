# CA Task Manager — End-to-End Deployment Playbook

This playbook outlines the steps required to deploy the **CA Task Manager** application to production (Vercel, Netlify, or self-hosted) and connect it to a Supabase database instance.

---

## 🚀 1. Database & Storage Configuration (Supabase)

The database schema is fully modularized as SQL migrations.

### Step A: Initialize Database Tables
Choose one of the two methods to initialize your tables:
* **Method 1 (Supabase CLI)**: If using Supabase local development, execute:
  ```bash
  supabase db push
  ```
* **Method 2 (Supabase Dashboard)**: Go to your Supabase project dashboard, open the **SQL Editor**, and copy-paste the contents of the SQL files under `supabase/migrations/` in ascending chronological order:
  1. `20260427_001_initial_schema.sql` (Core profiles, companies, teams)
  2. `20260427_002_tasks_foundation.sql` (Tasks foundation & scoped RLS)
  3. `20260427_003_events_calendar.sql` (Events calendar schedules)
  4. `20260517_005_comments_time_notifications.sql` (Discussion thread, manual logs, alerts tables)
  5. `20260517_006_task_recurrence.sql` (Recurrence columns)
  6. `20260517_007_storage_bucket_policies.sql` (File attachments storage bucket & RLS policies)

### Step B: Storage Bucket Setup
Running `20260517_007_storage_bucket_policies.sql` automatically:
1. Registers a new public bucket called `task-attachments`.
2. Enables Row Level Security (RLS) on storage objects.
3. Sets up policies allowing authenticated users to upload and delete files, and public users to view/download attachments securely.

---

## 🔑 2. Environment Variables

Configure the following environment variables. Create a `.env.local` for local development, and add these in your hosting provider's dashboard (e.g. Vercel dashboard):

| Variable Name | Description | Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project API URL. | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous client API key. | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **(Private)** Service role API key for bypassing RLS in background cron schedulers. | Supabase Dashboard → Settings → API |
| `CRON_SECRET` | **(Private)** A secure string token used to authorize automated scheduled cron requests. | Generate a secure random string (e.g. UUID) |

---

## 🔄 3. Automated Recurrence Schedulers (Cron Setup)

The application has a background recurrence cloner at `/api/cron`. To trigger recurring tasks automatically (e.g. monthly filings or weekly review templates):

### Method A: Vercel Cron (Recommended)
Add a `vercel.json` file in the root of the project to trigger execution at midnight daily:
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Method B: Third-Party Schedulers (Upstash / Cron-Job.org / GitHub Actions)
1. Configure a cron job hitting `https://your-domain.vercel.app/api/cron` daily.
2. In the request headers, add:
   ```http
   Authorization: Bearer <your_configured_CRON_SECRET>
   ```
This prevents unauthorized endpoints crawls and securely triggers the cloner.

---

## 📦 4. Building & Deploying Frontend (Vercel)

1. Import your repository into **Vercel** (`https://vercel.com`).
2. Set the framework preset to **Next.js**.
3. Add the **Environment Variables** listed in Section 2.
4. Click **Deploy**.
5. Once deployed, verify your authentication callback endpoints:
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` handles redirection to `https://your-domain.vercel.app/auth/callback`.

---

## 🩺 5. Post-Deployment Verification Check

Execute these quick tests to confirm that your deployed environment is operational:
1. **User Sign Up/Login**: Create a user account at `/login` and confirm that they are successfully registered in Supabase Auth.
2. **Assignee Dashboard**: Log in, create a task, and verify that the workload distribution chart loads.
3. **Manual Time Logs**: Open a task details page, log `45` minutes, and check if the total minutes count changes on the task details instantly.
4. **File Dropzone**: Drag an image or PDF into the attachments zone and confirm that it uploads, shows in the lists, and downloads with a single click.
