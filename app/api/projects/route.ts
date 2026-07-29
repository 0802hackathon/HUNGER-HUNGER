import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/api-auth";
import { projectInputSchema } from "@/lib/validation";

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

  const { data, error } = await auth.client.rpc("create_project", {
    p_payload: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      motivation: parsed.data.motivation,
      abandonment_reason: parsed.data.abandonmentReason,
      current_state: parsed.data.currentState,
      known_limitations: parsed.data.knownLimitations,
      repository_url: parsed.data.repositoryUrl,
      difficulty: parsed.data.difficulty,
      recommended_skill_level: parsed.data.recommendedSkillLevel,
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
    console.error("create_project failed", error?.message);
    return NextResponse.json(
      { message: "Projectを保存できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
