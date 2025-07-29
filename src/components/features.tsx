const features = [
  {
    title: "Next.js 15",
    description:
      "Built with the latest Next.js features including App Router and Server Components",
    icon: "⚡",
  },
  {
    title: "TypeScript",
    description:
      "Fully typed codebase for better developer experience and code reliability",
    icon: "🔷",
  },
  {
    title: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    icon: "🎨",
  },
  {
    title: "Redux Toolkit",
    description: "State management with Redux Toolkit and persistence support",
    icon: "🔄",
  },
  {
    title: "NextAuth",
    description: "Authentication solution with multiple providers support",
    icon: "🔐",
  },
  {
    title: "Modern Stack",
    description: "Includes charts, forms, analytics, and email functionality",
    icon: "🚀",
  },
];

export function Features() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Built with Modern Technologies
          </h2>
          <p className="mb-16 text-lg text-muted-foreground">
            This project includes everything you need to build a
            production-ready application
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:bg-accent/5"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
