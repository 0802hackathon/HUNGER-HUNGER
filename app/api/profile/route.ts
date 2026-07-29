import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/api-auth";
import { profileInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const [{ data: userData }, parsedBody] = await Promise.all([
    auth.client.auth.getUser(auth.token),
    request
      .json()
      .then((body: unknown) => profileInputSchema.safeParse(body))
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
  const { data, error } = await auth.client.rpc("update_my_profile", {
    p_payload: {
      display_name: input.displayName,
      bio: input.bio || null,
      github_url: input.githubUrl || null,
      experience_summary: input.experienceSummary || null,
      learning_skills: input.learningSkills,
      experienced_skills: input.experiencedSkills,
    },
  });

  if (error || !data) {
    console.error("update_my_profile failed", error?.message);
    return NextResponse.json(
      { message: "プロフィールを保存できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data });
}
