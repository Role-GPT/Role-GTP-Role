/**
 * 기기 연결 PIN 생성 엣지 함수 (다중 브라우저 지원)
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, inMinutes, generatePin, corsHeaders, handleCors } from "../_shared/utils.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { device_id } = await req.json();

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: "디바이스 ID가 필요합니다" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const supabase = createAdminClient();
    const pin = generatePin();
    const expiresAt = inMinutes(10); // 10분 후 만료

    const { data: deviceLink, error } = await supabase
      .from("device_links")
      .insert({
        device_id,
        pin,
        expires_at: expiresAt.toISOString()
      })
      .select("pin, expires_at")
      .single();

    if (error) {
      console.error("PIN 생성 오류:", error);
      return new Response(
        JSON.stringify({ error: "PIN 생성 중 오류가 발생했습니다" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        pin: deviceLink.pin,
        expires_at: deviceLink.expires_at,
        expires_in_minutes: 10,
        message: "PIN이 생성되었습니다. 새 브라우저에서 입력하세요."
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("디바이스 링크 생성 오류:", error);
    return new Response(
      JSON.stringify({ error: "PIN 생성 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});