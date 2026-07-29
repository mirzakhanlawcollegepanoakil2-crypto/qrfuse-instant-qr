import { supabase } from "@/integrations/supabase/client";

/**
 * Records a QR generation so the admin dashboard can show usage statistics.
 * Failures are intentionally silent - tracking must never block the generator.
 */
export async function trackQrGeneration(qrType: string): Promise<void> {
  try {
    await supabase.from("qr_events").insert({ qr_type: qrType.slice(0, 32) });
  } catch {
    /* ignore */
  }
}