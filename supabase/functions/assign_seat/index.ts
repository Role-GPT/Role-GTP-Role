/**
 * 공용 모드 좌석 할당 엣지 함수
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, now, inMinutes, sha256, corsHeaders, handleCors } from "../_shared/utils.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { code, device_fp_raw } = await req.json();
    
    if (!code || !device_fp_raw) {
      return new Response(
        JSON.stringify({ error: "코드와 디바이스 지문이 필요합니다" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    const supabase = createAdminClient();
    const device_fp = await sha256(device_fp_raw);

    // 코드 유효성 확인
    const { data: publicCode, error: codeError } = await supabase
      .from("public_codes")
      .select("id, seats_total, expires_at")
      .eq("code", code)
      .single();

    if (codeError || !publicCode) {
      return new Response(
        JSON.stringify({ error: "유효하지 않은 코드입니다" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    if (new Date(publicCode.expires_at) < now()) {
      return new Response(
        JSON.stringify({ error: "만료된 코드입니다" }),
        { 
          status: 410,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 현재 좌석 상태 조회
    const { data: seats } = await supabase
      .from("public_seats")
      .select("*")
      .eq("code_id", publicCode.id)
      .order("seat_no", { ascending: true });

    // 빈 좌석 찾기 또는 유휴 좌석 회수
    const LIMIT_MIN = 60;
    const IDLE_MIN = 10;
    const nowTs = now();

    let availableSeat = seats?.find(s => 
      !s.assigned_at ||
      new Date(s.session_expires_at) < nowTs ||
      (new Date(s.last_seen_at).getTime() + IDLE_MIN * 60 * 1000) < nowTs.getTime()
    );

    // 좌석이 없으면 새로 생성
    if (!availableSeat) {
      if (!seats || seats.length < publicCode.seats_total) {
        const nextSeatNo = (seats?.length ?? 0) + 1;
        const { data: newSeat } = await supabase
          .from("public_seats")
          .insert({
            code_id: publicCode.id,
            seat_no: nextSeatNo
          })
          .select()
          .single();
        
        availableSeat = newSeat;
      }
    }

    if (!availableSeat) {
      return new Response(
        JSON.stringify({ error: "모든 좌석이 사용 중입니다. 잠시 후 다시 시도해주세요." }),
        { 
          status: 429,
          headers: { ...corsHeaders, "content-type": "application/json" }
        }
      );
    }

    // 좌석 할당
    const seatToken = crypto.randomUUID();
    const { data: assignedSeat } = await supabase
      .from("public_seats")
      .update({
        device_fp,
        seat_token: seatToken,
        assigned_at: nowTs.toISOString(),
        last_seen_at: nowTs.toISOString(),
        session_expires_at: inMinutes(LIMIT_MIN).toISOString(),
      })
      .eq("id", availableSeat.id)
      .select("seat_no, session_expires_at, seat_token")
      .single();

    return new Response(
      JSON.stringify({
        seat_no: assignedSeat.data.seat_no,
        seat_token: assignedSeat.data.seat_token,
        session_expires_at: assignedSeat.data.session_expires_at,
        seats_used: seats?.filter(s => s.assigned_at).length + 1,
        seats_total: publicCode.seats_total
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );

  } catch (error) {
    console.error("좌석 할당 오류:", error);
    return new Response(
      JSON.stringify({ error: "좌석 할당 중 오류가 발생했습니다" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      }
    );
  }
});