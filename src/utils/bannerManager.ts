/**
 * 배너 및 알림 관리 시스템
 */

export type BannerType =
  | "ephemeralMode" 
  | "firstTimeWelcome"
  | "firstRun" 
  | "nudgeVault" 
  | "publicMode" 
  | "beforeClose"
  | "quotaWarn" 
  | "byokNotice" 
  | "expirySoon"
  | "pinSetup";

interface BannerContext {
  mode: "personal" | "public" | "ephemeral";
  messageCount: number;
  vaultConfigured: boolean;
  unsaved: boolean;
  quota: { usage: number; quota: number };
  firstRunSeen: boolean;
  byokNoticeSeen: boolean;
  expiryAt?: number; // ms
  hasPin: boolean;
  isFirstTime?: boolean;
}

const cooldownKey = (b: BannerType) => `banner_cool_${b}`;

const onCooldown = (b: BannerType, hours = 24): boolean => {
  const cooldownTime = localStorage.getItem(cooldownKey(b));
  return cooldownTime ? Date.now() < +cooldownTime : false;
};

const setCooldown = (b: BannerType, hours = 24): void => {
  localStorage.setItem(cooldownKey(b), (Date.now() + hours * 3600_000).toString());
};

export const pickBanner = (ctx: BannerContext): BannerType | null => {
  // 우선순위별 배너 선택
  
  // 1. 긴급: 저장되지 않은 채팅이 있고 종료하려는 경우
  if (ctx.unsaved) return "beforeClose";
  
  // 2. 공용 모드는 항상 표시
  if (ctx.mode === "public") return "publicMode";
  
  // 3. 저장공간 경고 (80% 이상)
  if (ctx.quota.usage / ctx.quota.quota > 0.8 && !onCooldown("quotaWarn", 6)) {
    return "quotaWarn";
  }
  
  // 4. 만료 임박 (24시간 이내)
  if (ctx.expiryAt && ctx.expiryAt - Date.now() < 24 * 3600_000 && !onCooldown("expirySoon", 12)) {
    return "expirySoon";
  }
  
  // 5. 첫 시간 사용자를 위한 환영 메시지 (5번째 메시지 이후, 더 자연스러운 타이밍)
  if (ctx.isFirstTime && ctx.messageCount >= 5 && ctx.mode === "ephemeral" && !onCooldown("firstTimeWelcome", 24)) {
    return "firstTimeWelcome";
  }
  
  // 6. 첫 실행 (7일 쿨다운) - 기존 사용자용
  if (!ctx.firstRunSeen && !ctx.isFirstTime && !onCooldown("firstRun", 24 * 7)) {
    return "firstRun";
  }
  
  // 7. 임시 모드 배너 (5번째 응답 후, 첫 시간 사용자 제외)
  if (ctx.mode === "ephemeral" && ctx.messageCount >= 5 && !ctx.isFirstTime && !onCooldown("ephemeralMode", 24)) {
    return "ephemeralMode";
  }
  
  // 8. PIN 설정 권장 (8번째 메시지)
  if (ctx.messageCount === 8 && !ctx.hasPin && ctx.mode === "personal" && !onCooldown("pinSetup", 24)) {
    return "pinSetup";
  }
  
  // 9. 금고 설정 권장 (10번째 메시지, PIN이 없는 경우)
  if (ctx.messageCount === 10 && !ctx.vaultConfigured && !ctx.hasPin && !onCooldown("nudgeVault", 24)) {
    return "nudgeVault";
  }
  
  // 10. BYOK 첫 사용 안내
  if (!ctx.byokNoticeSeen && ctx.messageCount >= 15 && !ctx.isFirstTime && !onCooldown("byokNotice", 24 * 7)) {
    return "byokNotice";
  }
  
  return null;
};

export const getBannerConfig = (bannerType: BannerType) => {
  const configs = {
    ephemeralMode: {
      title: "체험 모드로 대화 중",
      message: "대화가 브라우저에만 임시 저장됩니다. 영구 저장하려면 모드를 변경하세요.",
      type: "info" as const,
      actions: [
        { label: "모드 변경", action: "switchMode" },
        { label: "파일로 저장", action: "export" },
        { label: "체험 계속", action: "dismiss" }
      ],
      cooldownHours: 12
    },
    firstTimeWelcome: {
      title: "🎉 Role GPT가 마음에 드시나요?",
      message: "지금은 체험 모드로, 대화가 브라우저에만 임시 저장됩니다. 계속 사용하시려면 계정을 만들거나 파일로 저장할 수 있습니다.",
      type: "info" as const,
      actions: [
        { label: "계정 만들기", action: "switchMode" },
        { label: "파일로 저장", action: "export" },
        { label: "체험 계속", action: "dismiss" }
      ],
      cooldownHours: 24
    },
    firstRun: {
      title: "Role GPT에 오신 것을 환영합니다!",
      message: "대화는 이 브라우저에만 저장됩니다. 다른 기기에서 이어쓰려면 파일로 내보내거나 PIN을 설정하세요.",
      type: "info" as const,
      actions: [
        { label: "PIN 설정", action: "setupPin" },
        { label: "파일 금고 연결", action: "setupVault" },
        { label: "알겠음", action: "dismiss" }
      ],
      cooldownHours: 24 * 7
    },
    pinSetup: {
      title: "PIN으로 안전하게 보관하세요",
      message: "PIN을 설정하면 대화가 암호화되어 저장됩니다.",
      type: "info" as const,
      actions: [
        { label: "PIN 설정", action: "setupPin" },
        { label: "나중에", action: "dismiss" }
      ],
      cooldownHours: 24
    },
    nudgeVault: {
      title: "파일 금고를 연결하세요",
      message: "금고를 설정하면 자동으로 백업되고 다른 기기에서도 접근할 수 있습니다.",
      type: "info" as const,
      actions: [
        { label: "금고 연결", action: "setupVault" },
        { label: "나중에", action: "dismiss" }
      ],
      cooldownHours: 24
    },
    publicMode: {
      title: "공용 모드",
      message: "창을 닫으면 기록이 지워집니다.",
      type: "warning" as const,
      actions: [
        { label: "내보내기", action: "export" },
        { label: "좌석 반납", action: "releaseSeat" }
      ],
      cooldownHours: 0 // 항상 표시
    },
    beforeClose: {
      title: "저장되지 않음",
      message: "대화가 저장되지 않았습니다.",
      type: "error" as const,
      actions: [
        { label: "내보내기", action: "export" },
        { label: "PIN 설정", action: "setupPin" },
        { label: "그냥 닫기", action: "forceClose" }
      ],
      cooldownHours: 0,
      persistent: true
    },
    quotaWarn: {
      title: "저장공간 부족",
      message: "저장공간이 부족합니다. 오래된 대화를 정리하세요.",
      type: "warning" as const,
      actions: [
        { label: "내보내기", action: "export" },
        { label: "정리하기", action: "cleanup" },
        { label: "확인", action: "dismiss" }
      ],
      cooldownHours: 6
    },
    expirySoon: {
      title: "곧 만료됩니다",
      message: "내일 만료됩니다. 파일로 보관하거나 업그레이드하세요.",
      type: "warning" as const,
      actions: [
        { label: "내보내기", action: "export" },
        { label: "업그레이드", action: "upgrade" },
        { label: "확인", action: "dismiss" }
      ],
      cooldownHours: 12
    },
    byokNotice: {
      title: "🔑 내 API 키로 무제한 사용하기",
      message: "OpenAI, Claude 등의 API 키를 연결하면 제한 없이 사용할 수 있습니다. 키는 안전하게 브라우저에만 저장됩니다.",
      type: "info" as const,
      actions: [
        { label: "API 키 설정", action: "openSettings" },
        { label: "나중에", action: "dismiss" }
      ],
      cooldownHours: 24 * 7
    }
  };
  
  return configs[bannerType];
};

export const dismissBanner = (bannerType: BannerType): void => {
  const config = getBannerConfig(bannerType);
  if (config.cooldownHours > 0) {
    setCooldown(bannerType, config.cooldownHours);
  }
  
  // 첫 실행 배너의 경우 영구적으로 표시하지 않음
  if (bannerType === "firstRun") {
    localStorage.setItem("firstRunSeen", "true");
  }
  
  if (bannerType === "byokNotice") {
    localStorage.setItem("byokNoticeSeen", "true");
  }
  
  // 첫 시간 환영 배너가 dismiss되면 더 이상 첫 시간 사용자가 아님
  if (bannerType === "firstTimeWelcome") {
    localStorage.removeItem("firstTimeUser");
  }
};
