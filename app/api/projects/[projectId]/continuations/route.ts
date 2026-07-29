import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/api-auth";
import { continuationInputSchema } from "@/lib/validation";

type Params = Promise<{ projectId: string }>;

export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { data: userData, error: userError } =
    await auth.client.auth.getUser(auth.token);
  if (userError || !userData.user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
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

  const parsed = continuationInputSchema.safeParse(body);
  const { projectId } = await params;
  if (!parsed.success || parsed.data.sourceProjectId !== projectId) {
    return NextResponse.json(
      {
        message:
          parsed.success
            ? "Project IDが一致しません。"
            : parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      },
      { status: 400 },
    );
  }

  const { data, error } = await auth.client.rpc(
    "publish_project_continuation",
    {
      p_payload: {
        source_project_id: parsed.data.sourceProjectId,
        title: parsed.data.title,
        summary: parsed.data.summary,
        changes_made: parsed.data.changesMade,
        repository_url: parsed.data.repositoryUrl,
        demo_url: parsed.data.demoUrl || null,
        pull_request_url: parsed.data.pullRequestUrl || null,
        learning_outcome: parsed.data.learningOutcome || null,
        license_identifier: parsed.data.licenseIdentifier,
        rights_confirmed: parsed.data.rightsConfirmed,
        secrets_confirmed: parsed.data.secretsConfirmed,
      },
    },
  );
  if (error || !data) {
    console.error("publish_project_continuation failed", error?.message);
    return NextResponse.json(
      { message: "シュートを保存できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
