# Implementation Steps

## Step 1
- Bootstrap the Next.js application.
- Add shared dependencies for Supabase and UI helpers.
- Create the initial source folder structure.
- Replace the default starter page with CA Task Manager foundation screens.

## Step 2
- Add Supabase environment validation and SSR client helpers.
- Build login, forgot-password, reset-password, and callback flows.
- Add protected app layout and proxy-based route protection.

## Step 3
- Add the first Supabase migration for `profiles`, `teams`, and `companies`.
- Add profile bootstrap helpers so authenticated users get a role-backed record.
- Surface user profile context inside the protected app shell.

## Step 4
- Build the responsive app shell with sidebar, mobile navigation, and topbar.
- Add role-aware navigation for `admin`, `manager`, and `member`.

## Step 5
- Add the first task migration with status, priority, and RLS policies.
- Build the first task list and creation workflow inside the protected app.

## Next
- Add task detail, edit, and delete flows.
- Build the board and calendar experiences on top of task data.
- Introduce team and member management UI.
