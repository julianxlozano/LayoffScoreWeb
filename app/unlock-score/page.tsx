"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnlockScoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to results page (payment is now handled there)
    router.push("/results");
  }, [router]);

  return null;
}
