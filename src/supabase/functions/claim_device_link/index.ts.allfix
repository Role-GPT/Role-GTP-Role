/**
 * 기기 연결 PIN 청구 엣지 함수 (다중 브라우저 지원)
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, now, corsHeaders, handleCors } from "../_shared/utils.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { pin } = await req.json();

    if (!pin) {
      return new Response(
        JSON.stringify({ error: "PIN이 필요합니다" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const supabase = createAdminClient();

    // PIN으로 디바이스 링크 찾기
    const { data: deviceLink } = await supabase
      .from("device_links")
      .select("id, device_id, expires_at, claimed")
      .eq("pin", pin)
      .maybeSingle();

    if (!deviceLink) {
      return new Response(
        JSON.stringify({ error: "유효하지 않은 PIN입니다" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    if (deviceLink.claimed || new Date(deviceLink.expires_at) < now()) {
      return new Response(
        JSON.stringify({ error: "PIN이 만료되었거나 이미 사용되었습니다" }),
        { 
          status: 410,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // PIN 청구 완료로 표시
    await supabase
      .from("device_links")
      .update({ claimed: true })
      .eq("id", deviceLink.id);

    return new Response(
      JSON.stringify({
        device_id: deviceLink.device_id,
        message: "디바이스가 성공적으로 연결되었습니다"
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("디바이스 링크 청구 오류:", error);
    return new Response(
      JSON.stringify({ error: "PIN 처리 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});