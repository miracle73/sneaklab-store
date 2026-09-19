import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-wrap py-20 text-center">
      <span className="font-display text-7xl text-accent">404</span>
      <h1 className="mt-4 font-display text-4xl uppercase tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to shop
      </Link>
    </div>
  );
}
