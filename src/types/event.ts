export type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  creator_name?: string | null;
};
