/**
 * Supabase Edge Functions 공용 유틸리티
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const createAdminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

export const now = () => new Date();

export const inMinutes = (minutes: number) => 
  new Date(Date.now() + minutes * 60 * 1000);

export const sha256 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
};

export const generatePin = (): string => 
  Math.floor(100000 + Math.random() * 900000).toString();