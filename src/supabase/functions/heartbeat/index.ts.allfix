/**
 * 공용 모드 좌석 하트비트 (유휴 갱신) 엣지 함수
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, now, corsHeaders, handleCors } from "../_shared/utils.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { code, seat_token } = await req.json();

    if (!code || !seat_token) {
      return new Response(
        JSON.stringify({ error: "코드와 좌석 토큰이 필요합니다" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const supabase = createAdminClient();

    // 코드 유효성 확인
    const { data: publicCode } = await supabase
      .from("public_codes")
      .select("id, expires_at")
      .eq("code", code)
      .single();

    if (!publicCode || new Date(publicCode.expires_at) < now()) {
      return new Response(
        JSON.stringify({ error: "코드가 만료되었습니다" }),
        { 
          status: 410,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 좌석 하트비트 업데이트
    const { data: updatedSeat, error } = await supabase
      .from("public_seats")
      .update({ 
        last_seen_at: now().toISOString() 
      })
      .eq("code_id", publicCode.id)
      .eq("seat_token", seat_token)
      .select("seat_no, session_expires_at, last_seen_at")
      .single();

    if (error || !updatedSeat) {
      return new Response(
        JSON.stringify({ error: "유효하지 않은 좌석 토큰입니다" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        seat_no: updatedSeat.seat_no,
        session_expires_at: updatedSeat.session_expires_at,
        last_seen_at: updatedSeat.last_seen_at,
        status: "active"
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("하트비트 오류:", error);
    return new Response(
      JSON.stringify({ error: "하트비트 처리 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});