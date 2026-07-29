"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="status-page">
      <span className="status-code">!</span>
      <h1>読み込みに失敗しました</h1>
      <p>時間をおいて、もう一度お試しください。</p>
      <button className="button button-primary" onClick={reset} type="button">
        再試行
      </button>
    </main>
  );
}
