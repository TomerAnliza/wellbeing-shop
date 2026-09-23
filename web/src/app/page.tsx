import { redirect } from "next/navigation";

// עד שייבנה דף התדמית (/) — נכנסים ישר לחנות
export default function Home() {
  redirect("/app/shop");
}
