export default function Hero() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-12">
      <p className="small-caps">{today}</p>
      <h1 className="mt-3 font-heading text-4xl leading-tight md:text-5xl">
        {greeting}.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Here's where your internship search stands today.
      </p>
    </div>
  );
}
