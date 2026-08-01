import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/api-auth";
import { isSampleProject } from "@/lib/projects";

type Params = Promise<{ projectId: string }>;

const archiveSchema = z.object({
  action: z.literal("archive"),
  reason: z.string().trim().min(3).max(500),
});

type ProjectManagementError = {
  code?: string;
  message?: string;
};

function managementFailure(
  error: ProjectManagementError | null,
  action: "archive" | "delete",
) {
  const code = error?.code ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (
    message.includes("project owner required") ||
    message.includes("project manager required") ||
    code === "42501"
  ) {
    return {
      message: `作成者または管理権限を持つユーザーだけがProjectを${action === "archive" ? "アーカイブ" : "削除"}できます。`,
      status: 403,
    };
  }
  if (message.includes("project not found") || code === "P0002") {
    return { message: "Projectが見つかりません。", status: 404 };
  }
  if (code === "PGRST202" || code === "42883") {
    return {
      message: "Project管理機能の準備が完了していません。",
      status: 503,
    };
  }

  return {
    message: `Projectを${action === "archive" ? "アーカイブ" : "削除"}できませんでした。`,
    status: 500,
  };
}

async function hasAuthenticatedUser(
  auth: NonNullable<ReturnType<typeof getAuthenticatedClient>>,
) {
  const { data } = await auth.client.auth.getUser(auth.token);
  return Boolean(data.user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Params },
) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { projectId } = await params;
  const sample = isSampleProject(projectId);
  const parsedId = z.uuid().safeParse(projectId);
  const parsedBody = await request
    .json()
    .then((body: unknown) => archiveSchema.safeParse(body))
    .catch(() => null);
  if ((!sample && !parsedId.success) || !parsedBody?.success) {
    return NextResponse.json(
      { message: "入力内容を確認してください。" },
      { status: 400 },
    );
  }

  if (!(await hasAuthenticatedUser(auth))) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = sample
    ? await auth.client.rpc("archive_sample_project", {
        p_sample_project_id: projectId,
        p_reason: parsedBody.data.reason,
      })
    : await auth.client.rpc("archive_owned_project", {
        p_project_id: projectId,
        p_reason: parsedBody.data.reason,
      });

  if (error || !data) {
    const failure = managementFailure(error, "archive");
    console.error("archive_project failed", {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { message: failure.message },
      { status: failure.status },
    );
  }

  return NextResponse.json({ id: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Params },
) {
  const auth = getAuthenticatedClient(request);
  if (!auth) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { projectId } = await params;
  const sample = isSampleProject(projectId);
  if (!sample && !z.uuid().safeParse(projectId).success) {
    return NextResponse.json(
      { message: "Project IDを確認してください。" },
      { status: 400 },
    );
  }
  if (!(await hasAuthenticatedUser(auth))) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = sample
    ? await auth.client.rpc("delete_sample_project", {
        p_sample_project_id: projectId,
      })
    : await auth.client.rpc("delete_owned_project", {
        p_project_id: projectId,
      });

  if (error || !data) {
    const failure = managementFailure(error, "delete");
    console.error("delete_project failed", {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { message: failure.message },
      { status: failure.status },
    );
  }

  return NextResponse.json({ id: data });
}
