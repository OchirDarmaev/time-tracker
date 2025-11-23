import { JSX } from "hono/jsx";

export function PageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: JSX.HTMLAttributes;
}) {
  return (
    <div class="mb-8">
      <h1 class="mb-2 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
        {title}
      </h1>
      <p class="text-gray-400">{description}</p>
      {children}
    </div>
  );
}
