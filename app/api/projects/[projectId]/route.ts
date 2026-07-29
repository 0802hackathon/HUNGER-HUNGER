import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/api-auth";

type Params = Promise<{ projectId: string }>;

const archiveSchema = z.object({
  action: z.literal("archive"),
  reason: z.string().trim().min(3).max(500),
});

export async function PATCH(
  request: Request,
  { params }: { params: Params },
) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { projectId } = await params;
  const parsedId = z.uuid().safeParse(projectId);
  const parsedBody = await request
    .json()
    .then((body: unknown) => archiveSchema.safeParse(body))
    .catch(() => null);
  if (!parsedId.success || !parsedBody?.success) {
    return NextResponse.json(
      { message: "入力内容を確認してください。" },
      { status: 400 },
    );
  }

  const { data: userData } = await auth.client.auth.getUser(auth.token);
  if (!userData.user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = await auth.client
    .from("projects")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      archive_reason: parsedBody.data.reason,
    })
    .eq("id", projectId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { message: "投稿者だけがProjectをアーカイブできます。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ id: data.id });
}
