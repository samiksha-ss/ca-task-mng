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

## Step 6
- Add task detail, edit, and delete flows.
- Reuse shared task form fields between create and update workflows.
- Respect role-aware delete access while keeping update flows available to assigned members.

## Step 7
- Build the board experience on top of task data.
- Build the calendar experience on top of task data.
- Replace the board and calendar placeholders with live protected views.

## Step 8
- Introduce live team and member management views.
- Replace team, member, and admin user placeholders with role-aware directory pages.
- Surface basic staffing and role distribution metrics on top of the protected shell.

## Step 9
- Add admin-facing team creation, manager assignment, and member update mutation flows.
- Wire the admin user screen to real Supabase-backed server actions.
- Revalidate teams and members views after role and staffing changes.

## Next
- Start tightening role-management workflows around real team data.
- Add richer edit paths for teams and member assignments.
- Introduce company management mutations and admin CRUD polish.
