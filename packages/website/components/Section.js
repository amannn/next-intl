export default function Section({ title, description, children }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 lg:py-32">
      <div className="lg:text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-4xl">
          {title}
        </h2>
        <div className="mt-6 max-w-2xl text-base text-slate-600 lg:mx-auto lg:text-lg">
          {description}
        </div>
      </div>
      <div className="mt-10 lg:mt-20">{children}</div>
    </section>
  );
}
