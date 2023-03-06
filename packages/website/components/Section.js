export default function Section({children, description, title}) {
  return (
    <>
      <div className="mx-auto h-px w-full bg-gradient-to-r from-sky-300/0 via-sky-300/30 to-sky-300/0" />
      <section className="mx-auto max-w-[95rem] px-4 py-20 lg:py-40">
        <div className="lg:text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
            {title}
          </h2>
          <div className="mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-400 lg:mx-auto lg:text-lg">
            {description}
          </div>
        </div>
        <div className="mt-10 lg:mt-24">{children}</div>
      </section>
    </>
  );
}
