import { createServerFn } from "@tanstack/react-start";

import { requireVercelCompatibleAuth } from "./vercel-auth-middleware";
import {
  assertCanUseDynamic,
  buildCodeAnalytics,
  loadPlanState,
  normalizeCodeInput,
  randomSlug,
  type CodeInput,
} from "./dynamic-codes.server";

export const getPlanState = createServerFn({ method: "GET" })
  .middleware([requireVercelCompatibleAuth])
  .handler(async ({ context }) => loadPlanState(context.supabase, context.userId));

export const startTrial = createServerFn({ method: "POST" })
  .middleware([requireVercelCompatibleAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("start_trial");
    if (error) throw new Error(error.message);
    return loadPlanState(context.supabase, context.userId);
  });

export const listMyCodes = createServerFn({ method: "GET" })
  .middleware([requireVercelCompatibleAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("dynamic_codes")
      .select("id, slug, name, destination_url, is_active, scan_count, created_at, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveCode = createServerFn({ method: "POST" })
  .middleware([requireVercelCompatibleAuth])
  .inputValidator((input: CodeInput) => normalizeCodeInput(input))
  .handler(async ({ data, context }) => {
    const plan = await assertCanUseDynamic(context.supabase, context.userId);
    const { supabase, userId } = context;

    if (data.id) {
      const { error } = await supabase
        .from("dynamic_codes")
        .update({
          name: data.name,
          destination_url: data.destination_url,
          is_active: data.is_active,
          ...(data.slug ? { slug: data.slug } : {}),
        })
        .eq("id", data.id)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    if (plan.used >= plan.limit) {
      throw new Error(`Your plan allows ${plan.limit} dynamic codes. Upgrade to add more.`);
    }

    let slug = data.slug ?? randomSlug();
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const { data: inserted, error } = await supabase
        .from("dynamic_codes")
        .insert({
          user_id: userId,
          slug,
          name: data.name,
          destination_url: data.destination_url,
          is_active: data.is_active,
          style: data.style as never,
        })
        .select("id")
        .single();
      if (!error) return { id: inserted.id };
      if (error.code !== "23505") throw new Error(error.message);
      if (data.slug) throw new Error("That short link is already taken.");
      slug = randomSlug();
    }
    throw new Error("Could not allocate a short link. Please retry.");
  });

export const deleteCode = createServerFn({ method: "POST" })
  .middleware([requireVercelCompatibleAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("dynamic_codes")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCodeAnalytics = createServerFn({ method: "GET" })
  .middleware([requireVercelCompatibleAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const { data: owned, error } = await context.supabase
      .from("dynamic_codes")
      .select("id, name, slug, scan_count")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!owned) throw new Error("Code not found.");
    return { code: owned, analytics: await buildCodeAnalytics(context.supabase, owned.id) };
  });
