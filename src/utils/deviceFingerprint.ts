/**
 * 디바이스 지문 생성 유틸리티
 */

export const getDeviceFingerprintRaw = (): string => {
  const parts = [
    navigator.userAgent,
    navigator.platform,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    (navigator as any).hardwareConcurrency ?? "hc?",
    (navigator as any).deviceMemory ?? "dm?",
    screen.width + "x" + screen.height + "x" + screen.colorDepth,
  ];
  
  return parts.join("|");
};

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
};

export const getRandomSeed = (): string => {
  let seed = localStorage.getItem("rnd");
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem("rnd", seed);
  }
  return seed;
};

export const sha256 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};
