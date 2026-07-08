-- Supabase Database Schema for CloudPilot AI
-- Created: 2026-07-07

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Roles enum
create type user_role as enum ('Admin', 'HR', 'Employee', 'Finance', 'Manager');

-- 2. Profiles Table (extends Supabase auth.users or handles self-contained user accounts)
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    full_name text,
    avatar_url text,
    role user_role not null default 'Employee',
    organization_name text default 'Acme Corp',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Documents Table (For Knowledge Base)
create table if not exists public.documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete set null,
    name text not null,
    file_path text not null,
    file_type text not null, -- PDF, DOCX, TXT, CSV, Excel
    file_size integer not null,
    content text, -- Extracted text content
    status text not null default 'processed', -- processing, processed, error
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Document Embeddings / Chunks Table (for semantic search & RAG)
create table if not exists public.document_chunks (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid references public.documents(id) on delete cascade not null,
    chunk_index integer not null,
    content text not null,
    embedding vector(1536), -- Vector extension type (supported on Supabase)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Chat History Table
create table if not exists public.chat_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null default 'New Conversation',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.chat_messages (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references public.chat_sessions(id) on delete cascade not null,
    sender text not null, -- 'user' or 'assistant'
    content text not null,
    source_documents jsonb default '[]'::jsonb, -- References to documents used for answering (RAG)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tasks Table
create table if not exists public.tasks (
    id uuid primary key default uuid_generate_v4(),
    creator_id uuid references public.profiles(id) on delete set null,
    assignee_id uuid references public.profiles(id) on delete set null,
    title text not null,
    description text,
    status text not null default 'pending', -- pending, in_progress, completed, cancelled
    priority text not null default 'medium', -- low, medium, high
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Invoices Table
create table if not exists public.invoices (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete set null,
    invoice_number text not null unique,
    client_name text not null,
    client_email text not null,
    amount numeric(12,2) not null,
    status text not null default 'unpaid', -- paid, unpaid, overdue, draft
    issue_date date not null,
    due_date date not null,
    items jsonb default '[]'::jsonb, -- Array of products/services
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Workflows Table (Zapier-like builder templates)
create table if not exists public.workflows (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    description text,
    is_active boolean not null default true,
    trigger_type text not null, -- e.g. 'leave_request', 'new_invoice', 'manual'
    steps jsonb not null default '[]'::jsonb, -- Sequence of actions: [ { type: 'check_balance' }, { type: 'manager_approval' } ]
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Workflow Execution Log Table
create table if not exists public.workflow_logs (
    id uuid primary key default uuid_generate_v4(),
    workflow_id uuid references public.workflows(id) on delete cascade not null,
    status text not null, -- running, completed, failed, pending_approval
    current_step integer not null default 0,
    steps_log jsonb not null default '[]'::jsonb, -- Results of each executed step
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Approvals Table (for workflow steps requiring manager/admin verification)
create table if not exists public.approvals (
    id uuid primary key default uuid_generate_v4(),
    workflow_log_id uuid references public.workflow_logs(id) on delete cascade not null,
    approver_id uuid references public.profiles(id) on delete set null,
    role_required user_role default 'Manager',
    status text not null default 'pending', -- pending, approved, rejected
    comments text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Notifications Table
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text not null default 'info', -- info, success, warning, danger, workflow
    is_read boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Audit Logs Table
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete set null,
    action text not null, -- e.g. 'USER_LOGIN', 'FILE_UPLOAD', 'WORKFLOW_TRIGGER'
    target_type text not null, -- 'user', 'document', 'workflow', etc.
    target_id text,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) - Optional but good for Supabase
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_logs enable row level security;
alter table public.notifications enable row level security;

-- Policies can be customized when connected to Supabase Auth.
