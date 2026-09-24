"use client";

// שגיאה בטעינת מסך — הודעה תומכת וניסיון חוזר. ב-Next.js 16 הפונקציה היא retry()
export default function AppError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[26px] border border-card-border bg-card px-6 py-10 text-center">
      <span className="ms text-[36px] text-brand-icon" aria-hidden>cloud_off</span>
      <h1 className="text-[16px] font-semibold">לא הצלחנו לטעון את המסך</h1>
      <p className="text-[13px] text-ink-2">אולי החיבור נפל לרגע. שום אימון לא נמחק.</p>
      <button onClick={() => retry()} className="mt-1 rounded-[16px] bg-brand px-5 py-3 text-[14px] font-semibold text-white hover:bg-brand-hover">
        לנסות שוב
      </button>
    </div>
  );
}
