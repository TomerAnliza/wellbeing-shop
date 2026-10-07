"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Microsoft Clarity — הקלטות ומפות חום (docs/web-analytics-clarity.md).
// projectId מגיע מה-layout, רק בפרודקשן של Vercel. בלעדיו לא נטען כלום
export function Clarity({ projectId }: { projectId?: string }) {
  const pathname = usePathname();

  // בדף שיתוף ה-token בכתובת הוא המפתח לאימון. Clarity שומר כתובות, ולכן לא נטען שם
  if (!projectId || pathname.startsWith("/share/")) return null;

  // קוד ההטמעה הרשמי מלוח הבקרה של Clarity. ה-id חובה לסקריפט inline ב-next/script
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", ${JSON.stringify(projectId)});`}
    </Script>
  );
}
