import type { Difficulty } from "@/lib/types";

type Props = {
  technologies: string[];
  learningTechnologies: string[];
  current: {
    query?: string;
    technology?: string;
    learningTechnology?: string;
    difficulty?: Difficulty | "";
  };
};

export function ProjectFilters({
  technologies,
  learningTechnologies,
  current,
}: Props) {
  return (
    <form className="filter-panel" action="/projects" method="get">
      <label className="search-field">
        <span className="sr-only">キーワード</span>
        <span aria-hidden="true">⌕</span>
        <input
          defaultValue={current.query}
          name="q"
          placeholder="タイトル、構想、技術から検索"
        />
      </label>

      <label>
        <span>使用技術</span>
        <select defaultValue={current.technology} name="technology">
          <option value="">すべて</option>
          {technologies.map((technology) => (
            <option key={technology} value={technology}>
              {technology}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>学びたい技術</span>
        <select
          defaultValue={current.learningTechnology}
          name="learningTechnology"
        >
          <option value="">すべて</option>
          {learningTechnologies.map((technology) => (
            <option key={technology} value={technology}>
              {technology}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>難易度</span>
        <select defaultValue={current.difficulty} name="difficulty">
          <option value="">すべて</option>
          <option value="beginner">危険度 D・入門</option>
          <option value="intermediate">危険度 C・中級</option>
          <option value="advanced">危険度 B・上級</option>
          <option value="expert">危険度 A・熟練</option>
        </select>
      </label>

      <button className="button button-primary" type="submit">
        絞り込む
      </button>
    </form>
  );
}
