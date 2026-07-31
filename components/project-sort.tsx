"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import type { ProjectSort } from "@/lib/types";

type Props = {
  current: ProjectSort;
};

export function ProjectSortSelect({ current }: Props) {
  const router = useRouter();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href);
    const sort = event.target.value as ProjectSort;

    if (sort === "updated-desc") {
      url.searchParams.delete("sort");
    } else {
      url.searchParams.set("sort", sort);
    }

    router.push(`${url.pathname}${url.search}`);
  }

  return (
    <label className="project-sort">
      <span className="sr-only">並び替え</span>
      <select
        aria-label="Projectの並び替え"
        value={current}
        onChange={handleChange}
      >
        <option value="updated-desc">更新日の新しい順</option>
        <option value="updated-asc">更新日の古い順</option>
        <option value="beyond-desc">ビヨンド数の多い順</option>
        <option value="continuation-desc">シュート数の多い順</option>
      </select>
    </label>
  );
}
