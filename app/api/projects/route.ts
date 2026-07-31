import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/api-auth";
import {
  getGitHubRepositoryStatus,
  GitHubRepositoryLookupError,
} from "@/lib/github-repository";
import { projectInputSchema } from "@/lib/validation";

const skillLevelByDifficulty = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
  expert: "advanced",
} as const;

type ProjectStorageError = {
  code?: string;
  message?: string;
};

function projectStorageFailure(error: ProjectStorageError | null) {
  const code = error?.code ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (message.includes("authenticated profile required")) {
    return {
      message:
        "プロフィールの準備が完了していません。管理者に連絡してください。",
      status: 409,
    };
  }

  if (
    code === "PGRST202" ||
    code === "42883" ||
    message.includes("could not find the function public.create_project")
  ) {
    return {
      message:
        "Project公開機能の準備が完了していません。管理者に連絡してください。",
      status: 503,
    };
  }

  if (code === "22P02" || code === "23514") {
    return {
      message: "入力内容が保存条件を満たしていません。各項目を確認してください。",
      status: 400,
    };
  }

  if (code === "42501") {
    return {
      message: "このProjectを公開する権限を確認できませんでした。",
      status: 403,
    };
  }

  return {
    message: "Projectを保存できませんでした。時間をおいて再度お試しください。",
    status: 500,
  };
}

export async function POST(request: Request) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json(
      { message: "認証情報またはSupabase設定がありません。" },
      { status: 401 },
    );
  }

  const { data: userData, error: userError } =
    await auth.client.auth.getUser(auth.token);
  if (userError || !userData.user) {
    return NextResponse.json(
      { message: "ログイン状態を確認できませんでした。" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "JSONの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const repositoryStatus = await getGitHubRepositoryStatus(
      parsed.data.repositoryUrl,
    );
    if (!repositoryStatus.isPublic) {
      return NextResponse.json(
        {
          message:
            "Repositoryを公開状態で確認できませんでした。URLと公開設定を確認してください。",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    if (error instanceof GitHubRepositoryLookupError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    console.error("GitHub repository validation failed", error);
    return NextResponse.json(
      { message: "Repositoryの公開状態を確認できませんでした。" },
      { status: 503 },
    );
  }

  const { data, error } = await auth.client.rpc("create_project", {
    p_payload: {
      submission_key: parsed.data.submissionKey,
      title: parsed.data.title,
      summary: parsed.data.summary,
      motivation: parsed.data.motivation,
      abandonment_reason: parsed.data.abandonmentReason,
      current_state: parsed.data.currentState,
      known_limitations: parsed.data.knownLimitations,
      repository_url: parsed.data.repositoryUrl,
      runtime_requirements: parsed.data.runtimeRequirements,
      package_manager: parsed.data.packageManager,
      install_command: parsed.data.installCommand,
      lockfile_status: parsed.data.lockfileStatus,
      setup_instructions: parsed.data.setupInstructions,
      dependency_notes: parsed.data.dependencyNotes,
      tested_environment: parsed.data.testedEnvironment,
      default_branch: parsed.data.defaultBranch,
      last_tested_commit: parsed.data.lastTestedCommit || null,
      difficulty: parsed.data.difficulty,
      recommended_skill_level:
        skillLevelByDifficulty[parsed.data.difficulty],
      license_identifier: parsed.data.licenseIdentifier,
      usage_terms: parsed.data.usageTerms,
      technologies: parsed.data.technologies,
      learnable_technologies: parsed.data.learnableTechnologies,
      implemented_features: parsed.data.implementedFeatures,
      planned_features: parsed.data.plannedFeatures,
      rights_confirmed: parsed.data.rightsConfirmed,
      secrets_confirmed: parsed.data.secretsConfirmed,
    },
  });

  if (error || !data) {
    const failure = projectStorageFailure(error);
    console.error("create_project failed", {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { message: failure.message },
      { status: failure.status },
    );
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
