export default function Loading() {
  return (
    <main className="loading-page" role="status">
      <div className="loading-bar" />
      <div className="loading-line long" />
      <div className="loading-line" />
      <span className="sr-only">読み込み中</span>
    </main>
  );
}
