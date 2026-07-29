import { createClient } from "@supabase/supabase-js";
import { sampleContinuations, sampleProjects } from "./sample-data";
import {
  LEARNING_TOPIC_OPTIONS,
  TECHNOLOGY_OPTIONS,
} from "./technology-options";
import type {
  Difficulty,
  Project,
  ProjectContinuation,
  ProjectFilters,
} from "./types";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function matchesFilters(project: Project, filters: ProjectFilters) {
  const query = filters.query?.trim().toLocaleLowerCase("ja");
  const haystack = [
    project.title,
    project.summary,
    project.motivation,
    project.currentState,
    project.knownLimitations,
    project.runtimeRequirements,
    project.packageManager,
    project.dependencyNotes,
    project.testedEnvironment,
    ...project.technologies,
    ...project.learnableTechnologies,
    ...project.implementedFeatures.map((feature) => feature.title),
    ...project.plannedFeatures.map((feature) => feature.title),
  ]
    .join(" ")
    .toLocaleLowerCase("ja");

  return (
    (!query || haystack.includes(query)) &&
    (!filters.technology ||
      project.technologies.includes(filters.technology)) &&
    (!filters.learningTechnology ||
      project.learnableTechnologies.includes(filters.learningTechnology)) &&
    (!filters.difficulty || project.difficulty === filters.difficulty)
  );
}

function mapProject(row: Record<string, unknown>): Project {
  const technologyRows =
    (row.project_technologies as Array<Record<string, unknown>> | null) ?? [];
  const implementedRows =
    (row.implemented_features as Array<Record<string, unknown>> | null) ?? [];
  const plannedRows =
    (row.planned_features as Array<Record<string, unknown>> | null) ?? [];
  const owner = row.profiles as Record<string, unknown> | null;

  return {
    id: String(row.id),
    ownerId: String(row.owner_profile_id),
    ownerName: String(owner?.display_name ?? "退会済みユーザー"),
    title: String(row.title),
    summary: String(row.summary),
    motivation: String(row.motivation),
    abandonmentReason: String(row.abandonment_reason),
    currentState: String(row.current_state),
    knownLimitations: String(row.known_limitations ?? ""),
    repositoryUrl: String(row.repository_url),
    runtimeRequirements: String(
      row.runtime_requirements ?? "RepositoryのREADMEを確認",
    ),
    packageManager: String(row.package_manager ?? "未確認"),
    installCommand: String(row.install_command ?? "RepositoryのREADMEを確認"),
    lockfileStatus:
      (row.lockfile_status as Project["lockfileStatus"]) ?? "unknown",
    setupInstructions: String(
      row.setup_instructions ?? "RepositoryのREADMEを確認してください。",
    ),
    dependencyNotes: String(
      row.dependency_notes ??
        "依存関係を更新する前に、既存のLockfileとREADMEを確認してください。",
    ),
    testedEnvironment: String(row.tested_environment ?? "未確認"),
    defaultBranch: String(row.default_branch ?? "main"),
    lastTestedCommit: row.last_tested_commit
      ? String(row.last_tested_commit)
      : undefined,
    status: row.status as Project["status"],
    difficulty: row.difficulty as Difficulty,
    recommendedSkillLevel:
      row.recommended_skill_level as Project["recommendedSkillLevel"],
    licenseIdentifier: String(row.license_identifier),
    usageTerms: String(row.usage_terms),
    technologies: technologyRows
      .filter((item) => item.is_used)
      .map((item) => String(item.name)),
    learnableTechnologies: technologyRows
      .filter((item) => item.is_learnable)
      .map((item) => String(item.name)),
    implementedFeatures: implementedRows.map((item) => ({
      id: String(item.id),
      title: String(item.title),
      description: item.description ? String(item.description) : undefined,
    })),
    plannedFeatures: plannedRows.map((item) => ({
      id: String(item.id),
      title: String(item.title),
      description: item.description ? String(item.description) : undefined,
    })),
    beyondCount: Number(row.beyond_count ?? 0),
    continuationCount: Number(row.continuation_count ?? 0),
    updatedAt: String(row.updated_at),
  };
}

export async function listProjects(
  filters: ProjectFilters = {},
): Promise<Project[]> {
  const client = publicClient();
  if (!client) return sampleProjects.filter((item) => matchesFilters(item, filters));

  const { data, error } = await client
    .from("projects")
    .select(
      "*, profiles!projects_owner_profile_id_fkey(display_name), project_technologies(*), implemented_features(*), planned_features(*)",
    )
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.error("Project list fallback:", error?.message);
    return sampleProjects.filter((item) => matchesFilters(item, filters));
  }

  return data.map((row) => mapProject(row)).filter((item) => matchesFilters(item, filters));
}

export async function getProject(id: string): Promise<Project | null> {
  const client = publicClient();
  if (!client) return sampleProjects.find((item) => item.id === id) ?? null;

  const { data, error } = await client
    .from("projects")
    .select(
      "*, profiles!projects_owner_profile_id_fkey(display_name), project_technologies(*), implemented_features(*), planned_features(*)",
    )
    .eq("id", id)
    .in("status", ["published", "completed", "archived"])
    .maybeSingle();

  if (error || !data) {
    return sampleProjects.find((item) => item.id === id) ?? null;
  }
  return mapProject(data);
}

export async function getProjectContinuations(
  projectId: string,
): Promise<ProjectContinuation[]> {
  const client = publicClient();
  if (!client) {
    return sampleContinuations.filter(
      (item) => item.sourceProjectId === projectId,
    );
  }

  const { data, error } = await client
    .from("project_continuations")
    .select("*, profiles!project_continuations_author_profile_id_fkey(display_name)")
    .eq("source_project_id", projectId)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => {
    const owner = row.profiles as unknown as Record<string, unknown> | null;
    return {
      id: String(row.id),
      sourceProjectId: String(row.source_project_id),
      authorId: String(row.author_profile_id),
      authorName: String(owner?.display_name ?? "退会済みユーザー"),
      title: String(row.title),
      summary: String(row.summary),
      changesMade: String(row.changes_made),
      repositoryUrl: String(row.repository_url),
      demoUrl: row.demo_url ? String(row.demo_url) : undefined,
      pullRequestUrl: row.pull_request_url
        ? String(row.pull_request_url)
        : undefined,
      learningOutcome: row.learning_outcome
        ? String(row.learning_outcome)
        : undefined,
      licenseIdentifier: String(row.license_identifier),
      publishedAt: String(row.published_at),
    };
  });
}

export function getTechnologyOptions(projects: Project[]) {
  return Array.from(
    new Set([
      ...TECHNOLOGY_OPTIONS,
      ...projects.flatMap((item) => item.technologies),
    ]),
  );
}

export function getLearningTechnologyOptions(projects: Project[]) {
  return Array.from(
    new Set([
      ...LEARNING_TOPIC_OPTIONS,
      ...projects.flatMap((item) => item.learnableTechnologies),
    ]),
  );
}
