alter table public.chat_threads
  add column if not exists rolling_summary text,
  add column if not exists summary_through_message_id uuid
    references public.chat_messages(id) on delete set null;
