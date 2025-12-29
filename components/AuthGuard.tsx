"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) {
      setReady(true);
      return;
    }

    (async () => {
      const res = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      setReady(true);
    })();
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
