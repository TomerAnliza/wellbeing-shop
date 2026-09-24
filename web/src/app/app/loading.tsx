// שלד טעינה לכל מסכי האפליקציה, בצבע הכרטיסים (docs/spec-auth-and-app.md, "טעינה")
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="טוען">
      <div className="h-7 w-40 rounded-lg bg-ink/6" />
      <div className="h-4 w-28 rounded bg-ink/5" />
      <div className="h-[146px] rounded-[26px] bg-card" />
      <div className="h-14 rounded-[18px] bg-ink/6" />
      <div className="h-[70px] rounded-[18px] bg-card" />
      <div className="h-[70px] rounded-[18px] bg-card" />
    </div>
  );
}
