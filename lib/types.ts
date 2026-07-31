export type ProjectStatus = "draft" | "published" | "completed" | "archived";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type ProjectSort =
  | "updated-desc"
  | "updated-asc"
  | "beyond-desc"
  | "continuation-desc";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type ExplorationStatus = "active" | "paused" | "completed";
export type LockfileStatus =
  | "committed"
  | "missing"
  | "not_applicable"
  | "unknown";

export type Feature = {
  id: string;
  title: string;
  description?: string;
};

export type Project = {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  summary: string;
  motivation: string;
  abandonmentReason: string;
  currentState: string;
  knownLimitations: string;
  repositoryUrl: string;
  runtimeRequirements: string;
  packageManager: string;
  installCommand: string;
  lockfileStatus: LockfileStatus;
  setupInstructions: string;
  dependencyNotes: string;
  testedEnvironment: string;
  defaultBranch: string;
  lastTestedCommit?: string;
  status: ProjectStatus;
  difficulty: Difficulty;
  recommendedSkillLevel: SkillLevel;
  licenseIdentifier: string;
  usageTerms: string;
  technologies: string[];
  learnableTechnologies: string[];
  implementedFeatures: Feature[];
  plannedFeatures: Feature[];
  beyondCount: number;
  continuationCount: number;
  updatedAt: string;
};

export type ProjectContinuation = {
  id: string;
  sourceProjectId: string;
  authorId: string;
  authorName: string;
  title: string;
  summary: string;
  changesMade: string;
  repositoryUrl: string;
  demoUrl?: string;
  pullRequestUrl?: string;
  learningOutcome?: string;
  licenseIdentifier: string;
  publishedAt: string;
};

export type ProjectExploration = {
  id: string;
  projectId: string;
  learnerId: string;
  status: ExplorationStatus;
  forkUrl?: string;
  startedAt: string;
};

export type ProjectFilters = {
  query?: string;
  technology?: string;
  learningTechnology?: string;
  difficulty?: Difficulty | "";
};
