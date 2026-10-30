-- =============================================================================
-- BUILDGEN AUTHORITATIVE SUPABASE SCHEMA MIGRATION
-- Project: BuildGen Architectural AI-Native Design Engine
-- Target Database: Supabase PostgreSQL
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES (Extends Supabase native auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name varchar(80) NOT NULL CHECK (length(btrim(display_name)) > 0),
  professional_label varchar(100) DEFAULT 'Residential Architect',
  organization varchar(120) DEFAULT 'CYAN/DRAFT ARCHITECTURAL STUDIO',
  avatar_url text,
  sheets_quota integer NOT NULL DEFAULT 25,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. PROJECTS (Residential building project roots)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL CHECK (length(btrim(name)) > 0),
  code varchar(20) NOT NULL DEFAULT 'DWG-01',
  description varchar(2000) NOT NULL DEFAULT '',
  typology varchar(30) NOT NULL DEFAULT 'residential' CHECK (typology IN ('residential','commercial','modular')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id, created_at DESC, id DESC);

-- =============================================================================
-- 3. REQUIREMENTS VERSIONS (Immutable design briefs & boundary constraints)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.requirements_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  schema_version varchar(20) NOT NULL DEFAULT '1.0',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, version),
  UNIQUE(id, project_id)
);

-- =============================================================================
-- 4. FLOOR PLANS (Container for level sheets within a project)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.floor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL DEFAULT 'Level 01',
  sheet_id varchar(30) NOT NULL DEFAULT 'DWG-01',
  current_revision_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_floor_plans_project ON public.floor_plans(project_id, created_at DESC);

-- =============================================================================
-- 5. PLAN REVISIONS (Immutable whole-revision geometry snapshots)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  sequence integer NOT NULL CHECK (sequence > 0),
  parent_revision_id uuid,
  requirements_version_id uuid NOT NULL,
  schema_version varchar(20) NOT NULL DEFAULT '1.0',
  geometry jsonb NOT NULL CHECK (jsonb_typeof(geometry) = 'object'),
  geometry_hash char(64) NOT NULL,
  note varchar(300) NOT NULL DEFAULT 'Architectural CAD revision',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, plan_id, project_id),
  UNIQUE(plan_id, sequence),
  FOREIGN KEY (plan_id, project_id) REFERENCES public.floor_plans(id, project_id) ON DELETE CASCADE,
  FOREIGN KEY (requirements_version_id, project_id) REFERENCES public.requirements_versions(id, project_id),
  FOREIGN KEY (parent_revision_id, plan_id, project_id) REFERENCES public.plan_revisions(id, plan_id, project_id) DEFERRABLE INITIALLY DEFERRED,
  CHECK ((sequence = 1 AND parent_revision_id IS NULL) OR (sequence > 1 AND parent_revision_id IS NOT NULL))
);

-- Circular head reference on floor_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'current_revision_same_plan'
  ) THEN
    ALTER TABLE public.floor_plans ADD CONSTRAINT current_revision_same_plan
      FOREIGN KEY (current_revision_id, id, project_id)
      REFERENCES public.plan_revisions(id, plan_id, project_id)
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;

-- =============================================================================
-- 6. CANDIDATES (AI & algorithmic proposals from retrieval / repair / diffusion)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  requirements_version_id uuid NOT NULL,
  base_revision_id uuid,
  mode varchar(20) NOT NULL CHECK (mode IN ('retrieval','prompted','adapted','repair')),
  seed integer NOT NULL CHECK (seed >= 0),
  geometry_input jsonb,
  schema_valid boolean NOT NULL,
  checks jsonb NOT NULL CHECK (jsonb_typeof(checks) = 'array'),
  source_reference varchar(500) NOT NULL,
  provider_version varchar(120) NOT NULL,
  validator_version varchar(80) NOT NULL,
  failure_code varchar(80),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, plan_id, project_id),
  FOREIGN KEY (plan_id, project_id) REFERENCES public.floor_plans(id, project_id) ON DELETE CASCADE,
  FOREIGN KEY (requirements_version_id, project_id) REFERENCES public.requirements_versions(id, project_id),
  FOREIGN KEY (base_revision_id, plan_id, project_id) REFERENCES public.plan_revisions(id, plan_id, project_id),
  CHECK ((schema_valid AND geometry_input IS NOT NULL) OR (NOT schema_valid AND geometry_input IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_candidates_plan ON public.candidates(plan_id, created_at DESC);

-- =============================================================================
-- 7. VALIDATION REPORTS (Deterministic checks for overlaps & code compliance)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.validation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  revision_id uuid NOT NULL,
  validator_version varchar(80) NOT NULL,
  overall varchar(10) NOT NULL CHECK (overall IN ('pass','fail','unknown')),
  checks jsonb NOT NULL CHECK (jsonb_typeof(checks) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (revision_id, plan_id, project_id) REFERENCES public.plan_revisions(id, plan_id, project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_validations_revision ON public.validation_reports(revision_id, created_at DESC);

-- =============================================================================
-- 8. REPAIR RUNS (Google OR-Tools solver audit ledger)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.repair_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  revision_id uuid NOT NULL,
  candidate_id uuid,
  outcome varchar(30) NOT NULL CHECK (outcome IN ('feasible','optimal','infeasible_model','unknown','unsupported','model_invalid')),
  solver_version varchar(80) NOT NULL,
  grid_mm integer NOT NULL CHECK (grid_mm = 10),
  parameters jsonb NOT NULL,
  changes jsonb NOT NULL,
  checks_before jsonb NOT NULL,
  checks_after jsonb NOT NULL,
  elapsed_ms integer NOT NULL CHECK (elapsed_ms >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (revision_id, plan_id, project_id) REFERENCES public.plan_revisions(id, plan_id, project_id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id, plan_id, project_id) REFERENCES public.candidates(id, plan_id, project_id),
  CHECK ((outcome IN ('feasible','optimal') AND candidate_id IS NOT NULL) OR (outcome NOT IN ('feasible','optimal') AND candidate_id IS NULL))
);

-- =============================================================================
-- 9. ARTIFACTS (Compiled IFC4 building models & BOQ CSV bundles)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  revision_id uuid NOT NULL,
  kind varchar(30) NOT NULL CHECK (kind IN ('ifc','quantity_json','dxf','svg')),
  storage_key varchar(300) NOT NULL UNIQUE,
  media_type varchar(100) NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  sha256 char(64) NOT NULL,
  producer_version varchar(80) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (revision_id, plan_id, project_id) REFERENCES public.plan_revisions(id, plan_id, project_id) ON DELETE CASCADE
);

-- =============================================================================
-- 10. TRACE ASSETS (Calibrated vellum drawings and sketch scans)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.trace_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_key varchar(300) NOT NULL UNIQUE,
  media_type varchar(100) NOT NULL CHECK (media_type IN ('image/png','image/jpeg','image/webp')),
  byte_size bigint NOT NULL CHECK (byte_size BETWEEN 1 AND 10000000),
  sha256 char(64) NOT NULL,
  calibration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, project_id)
);

-- =============================================================================
-- 11. RATE SETS & QUANTITY REPORTS (Bill of Quantities Takeoffs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rate_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  currency char(3) NOT NULL CHECK (currency = 'PKR'),
  location varchar(200) NOT NULL,
  effective_date date NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('draft','reviewed')),
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  source_manifest jsonb NOT NULL,
  review_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, version),
  CHECK (status <> 'reviewed' OR review_reference IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.quantity_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  revision_id uuid NOT NULL,
  rate_set_id uuid REFERENCES public.rate_sets(id),
  method_version varchar(80) NOT NULL,
  items jsonb NOT NULL,
  assumptions jsonb NOT NULL,
  unpriced_codes jsonb NOT NULL,
  excluded_work jsonb NOT NULL,
  currency char(3) NOT NULL CHECK (currency = 'PKR'),
  partial_total numeric(18,2) NOT NULL CHECK (partial_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (revision_id, plan_id, project_id) REFERENCES public.plan_revisions(id, plan_id, project_id) ON DELETE CASCADE
);

-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trace_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantity_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

-- Floor plans scoped to owned project
CREATE POLICY "Users can manage floor plans in own projects" ON public.floor_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.floor_plans.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Revisions scoped to owned project
CREATE POLICY "Users can manage revisions in own projects" ON public.plan_revisions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.plan_revisions.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Trigger to automatically create a profile on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, professional_label)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'Residential Architect')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
