/**
 * 개인 모드 3일 체험 발급 엣지 함수
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, now, sha256, corsHeaders, handleCors } from "../_shared/utils.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { device_fp_raw } = await req.json();

    if (!device_fp_raw) {
      return new Response(
        JSON.stringify({ error: "디바이스 지문이 필요합니다" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const supabase = createAdminClient();
    const deviceFp = await sha256(device_fp_raw);

    // 기존 체험 확인
    const { data: existingTrial } = await supabase
      .from("guest_trials")
      .select("*")
      .eq("device_fp", deviceFp)
      .maybeSingle();

    if (existingTrial && new Date(existingTrial.expires_at) > now()) {
      // 기존 체험이 아직 유효함
      const daysRemaining = Math.max(0, Math.ceil(
        (new Date(existingTrial.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ));

      return new Response(
        JSON.stringify({
          status: "exists",
          expires_at: existingTrial.expires_at,
          days_remaining: daysRemaining,
          message: "이미 체험이 진행 중입니다"
        }),
        {
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 새로운 3일 체험 발급
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const { data: newTrial, error } = await supabase
      .from("guest_trials")
      .upsert({
        device_fp: deviceFp,
        issued_at: now().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("체험 발급 오류:", error);
      return new Response(
        JSON.stringify({ error: "체험 발급 중 오류가 발생했습니다" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 디바이스 지문 매핑도 생성
    await supabase
      .from("device_fingerprints")
      .upsert({
        device_fp_hash: deviceFp,
        trial_id: newTrial.id,
        first_seen_at: now().toISOString(),
        last_seen_at: now().toISOString()
      }, { onConflict: "device_fp_hash" });

    return new Response(
      JSON.stringify({
        status: "issued",
        expires_at: newTrial.expires_at,
        days_remaining: 3,
        message: "3일 체험이 시작되었습니다"
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("게스트 체험 발급 오류:", error);
    return new Response(
      JSON.stringify({ error: "체험 발급 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});