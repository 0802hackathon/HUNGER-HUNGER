import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/api-auth";
import { progressUpdateInputSchema } from "@/lib/validation";

type Params = Promise<{ explorationId: string }>;

export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { explorationId } = await params;
  if (!z.uuid().safeParse(explorationId).success) {
    return NextResponse.json(
      { message: "ビヨンド履歴のIDが正しくありません。" },
      { status: 400 },
    );
  }

  const [{ data: userData }, parsedBody] = await Promise.all([
    auth.client.auth.getUser(auth.token),
    request
      .json()
      .then((body: unknown) => progressUpdateInputSchema.safeParse(body))
      .catch(() => null),
  ]);

  if (!userData.user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }
  if (!parsedBody?.success) {
    return NextResponse.json(
      {
        message:
          parsedBody?.error.issues[0]?.message ?? "入力内容を確認してください。",
      },
      { status: 400 },
    );
  }

  const input = parsedBody.data;
  const { data, error } = await auth.client.rpc("record_progress_update", {
    p_exploration_id: explorationId,
    p_payload: {
      summary: input.summary,
      blockers: input.blockers || null,
      progress_percent: input.progressPercent,
      branch_url: input.branchUrl || null,
      commit_url: input.commitUrl || null,
      pull_request_url: input.pullRequestUrl || null,
      learned: input.learned || null,
      next_steps: input.nextSteps || null,
    },
  });

  if (error || !data) {
    console.error("record_progress_update failed", error?.message);
    return NextResponse.json(
      { message: "進捗を保存できませんでした。権限とProject状態を確認してください。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
