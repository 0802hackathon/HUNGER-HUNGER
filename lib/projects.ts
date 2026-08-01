import { createClient } from "@supabase/supabase-js";
import { sampleContinuations, sampleProjects } from "./sample-data";
import { getSupabasePublicConfig } from "./supabase-config";
import { getServerSupabase } from "./supabase-server";
import {
  LEARNING_TOPIC_OPTIONS,
  TECHNOLOGY_OPTIONS,
} from "./technology-options";
import type {
  Difficulty,
  Project,
  ProjectContinuation,
  ProjectFilters,
  ProjectSort,
} from "./types";

export function isSupabaseConfigured() {
  return Boolean(getSupabasePublicConfig());
}

function publicClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
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

export function filterProjects(
  projects: Project[],
  filters: ProjectFilters = {},
) {
  return projects.filter((project) => matchesFilters(project, filters));
}

export function sortProjects(
  projects: Project[],
  sort: ProjectSort = "updated-desc",
) {
  const byUpdatedAtDescending = (left: Project, right: Project) =>
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

  return [...projects].sort((left, right) => {
    switch (sort) {
      case "updated-asc":
        return (
          new Date(left.updatedAt).getTime() -
          new Date(right.updatedAt).getTime()
        );
      case "beyond-desc":
        return (
          right.beyondCount - left.beyondCount ||
          byUpdatedAtDescending(left, right)
        );
      case "continuation-desc":
        return (
          right.continuationCount - left.continuationCount ||
          byUpdatedAtDescending(left, right)
        );
      case "updated-desc":
      default:
        return byUpdatedAtDescending(left, right);
    }
  });
}

function mapProject(row: Record<string, unknown>): Project {
  const technologyRows =
    (row.project_technologies as Array<Record<string, unknown>> | null) ?? [];
  const implementedRows =
    (row.implemented_features as Array<Record<string, unknown>> | null) ?? [];
  const plannedRows =
    (row.planned_features as Array<Record<string, unknown>> | null) ?? [];
  const continuationCountRows =
    (row.project_continuations as Array<Record<string, unknown>> | null) ?? [];
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
    continuationCount: Number(
      continuationCountRows[0]?.count ?? row.continuation_count ?? 0,
    ),
    updatedAt: String(row.updated_at),
  };
}

type SampleProjectState = "archived" | "deleted";

export function isSampleProject(projectId: string) {
  return sampleProjects.some((project) => project.id === projectId);
}

async function getSampleProjectStates() {
  const client = await getServerSupabase();
  if (!client) return new Map<string, SampleProjectState>();

  const { data, error } = await client
    .from("sample_project_preferences")
    .select("sample_project_id, state");

  if (error || !data) return new Map<string, SampleProjectState>();
  return new Map(
    data.map((row) => [
      String(row.sample_project_id),
      row.state as SampleProjectState,
    ]),
  );
}

function mergeWithSampleProjects(
  projects: Project[],
  sampleStates: Map<string, SampleProjectState>,
) {
  const projectIds = new Set(projects.map((project) => project.id));
  return [
    ...projects,
    ...sampleProjects.filter(
      (project) =>
        !projectIds.has(project.id) && !sampleStates.has(project.id),
    ),
  ];
}

export async function listProjects(
  filters: ProjectFilters = {},
): Promise<Project[]> {
  const client = publicClient();
  const sampleStatesPromise = getSampleProjectStates();
  if (!client) {
    const sampleStates = await sampleStatesPromise;
    return filterProjects(
      sampleProjects.filter((project) => !sampleStates.has(project.id)),
      filters,
    );
  }

  const [{ data, error }, sampleStates] = await Promise.all([
    client
      .from("projects")
      .select(
        "*, profiles!projects_owner_profile_id_fkey(display_name), project_technologies(*), implemented_features(*), planned_features(*), project_continuations(count)",
      )
      .eq("status", "published")
      .order("updated_at", { ascending: false }),
    sampleStatesPromise,
  ]);

  if (error || !data) {
    console.error("Project list fallback:", error?.message);
    return filterProjects(
      sampleProjects.filter((project) => !sampleStates.has(project.id)),
      filters,
    );
  }

  return filterProjects(
    mergeWithSampleProjects(data.map((row) => mapProject(row)), sampleStates),
    filters,
  );
}

export async function getProject(id: string): Promise<Project | null> {
  const sampleProject = sampleProjects.find((item) => item.id === id);
  if (sampleProject) {
    const state = (await getSampleProjectStates()).get(id);
    if (state === "deleted") return null;
    return state === "archived"
      ? { ...sampleProject, status: "archived" }
      : sampleProject;
  }

  const client = publicClient();
  if (!client) return null;

  const { data, error } = await client
    .from("projects")
    .select(
      "*, profiles!projects_owner_profile_id_fkey(display_name), project_technologies(*), implemented_features(*), planned_features(*), project_continuations(count)",
    )
    .eq("id", id)
    .in("status", ["published", "completed", "archived"])
    .maybeSingle();

  if (error || !data) return null;
  return mapProject(data);
}

export async function getProjectContinuations(
  projectId: string,
): Promise<ProjectContinuation[]> {
  if (isSampleProject(projectId)) {
    return sampleContinuations.filter(
      (item) => item.sourceProjectId === projectId,
    );
  }

  const client = publicClient();
  if (!client) {
    return [];
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
