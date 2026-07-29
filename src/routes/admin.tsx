import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin | QRFUSE" },
      { name: "description", content: "Private QRFUSE administration area." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setSignedIn(Boolean(data.user));
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void refresh();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <AdminPanel signedIn={signedIn} onAuthChange={refresh} />;
}