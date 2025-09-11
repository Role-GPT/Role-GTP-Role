/**
 * 공용 모드 좌석 반납 엣지 함수
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, corsHeaders, handleCors } from "../_shared/utils.ts";

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

    // 코드 확인
    const { data: publicCode } = await supabase
      .from("public_codes")
      .select("id")
      .eq("code", code)
      .single();

    if (!publicCode) {
      return new Response(
        JSON.stringify({ error: "유효하지 않은 코드입니다" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 좌석 반납
    const { data: releasedSeat } = await supabase
      .from("public_seats")
      .update({
        device_fp: null,
        seat_token: null,
        assigned_at: null,
        last_seen_at: null,
        session_expires_at: null
      })
      .eq("code_id", publicCode.id)
      .eq("seat_token", seat_token)
      .select("seat_no")
      .single();

    if (!releasedSeat) {
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
        message: "좌석이 성공적으로 반납되었습니다",
        seat_no: releasedSeat.seat_no
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("좌석 반납 오류:", error);
    return new Response(
      JSON.stringify({ error: "좌석 반납 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});