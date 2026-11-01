import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TimePortalExperience from "@/src/components/timeportal/TimePortalExperience";
import {
  TIMEPORTAL_UNLOCK_COOKIE,
  getTimePortalUnlockToken,
} from "@/src/lib/timeportalAccess.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Time Portal | Sathsara Dahana 2026",
  description:
    "Calibrate the temporal gateway and travel across five distinct eras of time and web design at Sathsara Dahana 2026.",
};

export default async function TimePortalPage() {
  const cookieStore = await cookies();
  const unlockToken = cookieStore.get(TIMEPORTAL_UNLOCK_COOKIE)?.value;

  if (unlockToken !== getTimePortalUnlockToken()) {
    redirect("/puzzle");
  }

  return <TimePortalExperience />;
}
