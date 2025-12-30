"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext, User } from "./AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // ✅ never guard public pages
    if (pathname === "/login" || pathname === "/register") {
      setOk(true);
      setUser(null)
      return;
    }

    (async () => {
      const res = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setUser(null);
        router.replace("/login");
        return;
      }
      const data: User = await res.json();
      setUser(data)
      setOk(true);
    })();
  }, [pathname, router]);

  if (!ok) return null;
  // ✅ provide user to Navbar (and anything else)
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
