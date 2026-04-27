export type AppRole = "admin" | "manager" | "member";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: AppRole;
  job_title: string | null;
  avatar_url: string | null;
  team_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: "active" | "inactive";
  priority_tier: "standard" | "priority" | "vip";
  notes: string | null;
  created_at: string;
  updated_at: string;
};
