import { redirect } from "next/navigation";

export default function DeprecatedBlockedDatesPage() {
  redirect("/admin/calendar");
}
