import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/api-auth";

type Params = Promise<{ projectId: string }>;

export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { projectId } = await params;
  if (!z.uuid().safeParse(projectId).success) {
    return NextResponse.json(
      { message: "Project IDが正しくありません。" },
      { status: 400 },
    );
  }

  const { data: userData, error: userError } =
    await auth.client.auth.getUser(auth.token);
  if (userError || !userData.user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = await auth.client.rpc("start_project_exploration", {
    p_project_id: projectId,
  });
  if (error || !data) {
    console.error("start_project_exploration failed", error?.message);
    return NextResponse.json(
      { message: "ビヨンド履歴を保存できませんでした。" },
      { status: 400 },
    );
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
