/**
 * 이메일 로그인 후 디바이스 지문 매핑 엣지 함수
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, now, sha256, corsHeaders, handleCors } from "../_shared/utils.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { email, device_fp_raw, trial_id } = await req.json();

    if (!email || !device_fp_raw) {
      return new Response(
        JSON.stringify({ error: "이메일과 디바이스 지문이 필요합니다" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const supabase = createAdminClient();
    const deviceFp = await sha256(device_fp_raw);

    // 사용자 계정 생성 또는 확인
    const { data: user } = await supabase
      .from("user_accounts")
      .upsert({ email })
      .select("id")
      .single();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "사용자 계정 생성에 실패했습니다" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 디바이스 지문 매핑 업데이트
    const { data: deviceMapping } = await supabase
      .from("device_fingerprints")
      .upsert({
        device_fp_hash: deviceFp,
        user_id: user.id,
        trial_id: trial_id || null,
        last_seen_at: now().toISOString()
      }, { onConflict: "device_fp_hash" })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        link_id: deviceMapping?.id,
        message: "디바이스가 계정에 연결되었습니다"
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("디바이스 연결 오류:", error);
    return new Response(
      JSON.stringify({ error: "디바이스 연결 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});