export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Next.js Starter
            </span>{" "}
            Template
          </h1>
          <p className="mb-8 text-xl text-primary-foreground/90 md:text-2xl">
            A comprehensive starter template with TypeScript, Tailwind CSS, and
            full-stack features
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-lg bg-background px-8 py-3 font-semibold text-foreground transition-colors hover:bg-background/90">
              Get Started
            </button>
            <button className="rounded-lg border border-primary-foreground/20 px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
