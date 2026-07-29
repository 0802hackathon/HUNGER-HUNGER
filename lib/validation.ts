import { z } from "zod";

const safeUrl = z
  .url("有効なURLを入力してください")
  .refine((value) => new URL(value).protocol === "https:", {
    message: "HTTPSのURLだけ登録できます",
  })
  .refine((value) => {
    const url = new URL(value);
    return !url.username && !url.password;
  }, "認証情報を含むURLは登録できません");

export const projectInputSchema = z.object({
  title: z.string().trim().min(3).max(80),
  summary: z.string().trim().min(20).max(240),
  motivation: z.string().trim().min(20).max(2000),
  abandonmentReason: z.string().trim().min(20).max(2000),
  currentState: z.string().trim().min(20).max(3000),
  knownLimitations: z.string().trim().min(10).max(3000),
  repositoryUrl: safeUrl.refine(
    (value) => new URL(value).hostname === "github.com",
    "MVPではGitHubの公開Repositoryだけ登録できます",
  ),
  runtimeRequirements: z.string().trim().min(3).max(300),
  packageManager: z.string().trim().min(2).max(80),
  installCommand: z.string().trim().min(2).max(300),
  lockfileStatus: z.enum([
    "committed",
    "missing",
    "not_applicable",
    "unknown",
  ]),
  setupInstructions: z.string().trim().min(20).max(3000),
  dependencyNotes: z.string().trim().min(10).max(3000),
  testedEnvironment: z.string().trim().min(3).max(500),
  defaultBranch: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9._/-]+$/, "Branch名の形式を確認してください"),
  lastTestedCommit: z
    .union([
      z
        .string()
        .trim()
        .regex(
          /^[0-9a-fA-F]{7,64}$/,
          "最後に動作確認したCommit SHAを7〜64桁で入力してください",
        ),
      z.literal(""),
    ])
    .optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  recommendedSkillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  licenseIdentifier: z.string().trim().min(2).max(80),
  usageTerms: z.string().trim().min(20).max(2000),
  technologies: z.array(z.string().trim().min(1).max(50)).min(1).max(15),
  learnableTechnologies: z
    .array(z.string().trim().min(1).max(50))
    .min(1)
    .max(15),
  implementedFeatures: z.array(z.string().trim().min(1).max(120)).max(30),
  plannedFeatures: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
  rightsConfirmed: z.literal(true),
  secretsConfirmed: z.literal(true),
});

export const continuationInputSchema = z.object({
  sourceProjectId: z.uuid(),
  title: z.string().trim().min(3).max(100),
  summary: z.string().trim().min(20).max(300),
  changesMade: z.string().trim().min(20).max(3000),
  repositoryUrl: safeUrl,
  demoUrl: z.union([safeUrl, z.literal("")]).optional(),
  pullRequestUrl: z.union([safeUrl, z.literal("")]).optional(),
  learningOutcome: z.string().trim().max(3000).optional(),
  licenseIdentifier: z.string().trim().min(2).max(80),
  rightsConfirmed: z.literal(true),
  secretsConfirmed: z.literal(true),
});

export const progressUpdateInputSchema = z.object({
  summary: z.string().trim().min(3).max(2000),
  blockers: z.string().trim().max(2000).optional(),
  progressPercent: z.number().int().min(0).max(100),
  branchUrl: z.union([safeUrl, z.literal("")]).optional(),
  commitUrl: z.union([safeUrl, z.literal("")]).optional(),
  pullRequestUrl: z.union([safeUrl, z.literal("")]).optional(),
  learned: z.union([z.string().trim().min(10).max(3000), z.literal("")]).optional(),
  nextSteps: z.string().trim().max(3000).optional(),
});

const skillNames = z
  .array(z.string().trim().min(1).max(50))
  .max(30)
  .transform((items) => Array.from(new Set(items)));

export const profileInputSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  bio: z.string().trim().max(500).optional(),
  githubUrl: z
    .union([
      safeUrl.refine(
        (value) =>
          /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/?$/.test(value),
        "GitHubプロフィールのURLを入力してください",
      ),
      z.literal(""),
    ])
    .optional(),
  experienceSummary: z.string().trim().max(1000).optional(),
  learningSkills: skillNames,
  experiencedSkills: skillNames,
});
