"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck } from "@/components/LucideIcons";

export default function AppHeader() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let alive = true;
    void supabase.auth.getUser().then(
      (result: { data: { user: User | null } }) => {
        if (alive) setEmail(result.data.user?.email ?? null);
      },
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (alive) setEmail(session?.user.email ?? null);
      },
    );

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.assign("/auth/sign-in");
  }

  return (
    <header className="app-header">
      <Link href="/app" className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="brand-name">ScamLens</p>
          <p className="brand-tagline">Understand the signal. Avoid the scam.</p>
        </div>
      </Link>
      <div className="app-account">
        <span className="header-status">
          <span className="status-dot" /> {email ?? "Local learning mode"}
        </span>
        {email ? (
          <button className="account-signout" type="button" onClick={signOut}>
            Sign out
          </button>
        ) : (
          <Link className="account-signout" href="/auth/sign-in">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
