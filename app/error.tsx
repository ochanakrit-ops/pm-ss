'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container">
      <div className="card">
        <div className="h1">Something went wrong</div>
        <div className="alert">{error.message}</div>
        <button className="btn primary" onClick={() => reset()}>Try again</button>
        <a className="btn" href="/login" style={{ marginLeft: 10 }}>Go to login</a>
      </div>
    </div>
  );
}
