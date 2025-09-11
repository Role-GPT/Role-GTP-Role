import { Mode, ModeComparisonResult } from '../types';

/**
 * 두 모드를 비교하여 관계를 반환
 */
export function compareModes(chatMode: Mode, roleMode: Mode): ModeComparisonResult {
  const rank = { standard: 0, advanced: 1, expert: 2 } as const;
  
  if (rank[chatMode] === rank[roleMode]) return 'same';
  if (rank[chatMode] < rank[roleMode]) return 'chatLower';
  return 'chatHigher';
}

/**
 * 모드 이름을 사용자 친화적인 라벨로 변환
 */
export function getModeLabel(mode: Mode, lang: 'ko' | 'en' = 'ko'): string {
  const labels = {
    ko: {
      standard: 'Standard',
      advanced: 'Advanced', 
      expert: 'Expert'
    },
    en: {
      standard: 'Standard',
      advanced: 'Advanced',
      expert: 'Expert'
    }
  };
  
  return labels[lang][mode];
}

/**
 * Cross-Mode Guard i18n 메시지
 */
export const crossModeGuardMessages = {
  ko: {
    title_same: '모드 일치',
    body_same: '현재 대화창({chat})과 Role({role})의 모드가 동일합니다. 그대로 진행합니다.',
    
    title_chatLower: '모드 차이 안내',
    body_chatLower: '현재 대화창은 {chat}, 선택한 Role은 **{role}**입니다.\n{chat} 제한으로 실행됩니다. 계속 진행하시겠습니까?',
    cta_keepChat: '계속 ({chat} 제한)', 
    cta_switchChat: '{role} 모드로 전환',
    hint_chatLower: '※ 전환 시 이 대화창은 {role} 모드로 변경됩니다. (다른 대화창에는 영향 없음)',
    
    title_chatHigher: 'Role 향상 제안',
    body_chatHigher: '현재 대화창은 {chat}, 선택한 Role은 **{role}**입니다.\n그대로 진행하거나 Role을 {chat} 기준으로 복사할 수 있어요.',
    cta_runAsIs: '그대로 진행',
    cta_improveRole: 'Role 복사·향상 ({chat})',
    
    toast_downgraded: '{chat} 제한으로 실행합니다.',
    toast_switched: '대화창 모드를 {role}로 전환했습니다.',
    toast_runAsIs: '현재 설정으로 진행합니다.',
    toast_roleCloned: 'Role을 {chat} 기준으로 복사했습니다.',
  },
  
  en: {
    title_same: 'Modes Match',
    body_same: 'Chat ({chat}) and Role ({role}) modes match. Proceeding.',
    
    title_chatLower: 'Mode Mismatch',
    body_chatLower: 'This chat is {chat} but the Role is **{role}**.\nIt will run with {chat} limits. Continue?',
    cta_keepChat: 'Continue (limit: {chat})',
    cta_switchChat: 'Switch chat to {role}',
    hint_chatLower: 'Switching updates this chat only. Other chats remain unchanged.',
    
    title_chatHigher: 'Improve Role?', 
    body_chatHigher: 'This chat is {chat} while the Role is **{role}**.\nYou can proceed as is, or clone the Role to {chat} for fuller control.',
    cta_runAsIs: 'Proceed as is',
    cta_improveRole: 'Clone Role to {chat}',
    
    toast_downgraded: 'Running with {chat} limits.',
    toast_switched: 'Chat mode switched to {role}.',
    toast_runAsIs: 'Proceeding with current settings.',
    toast_roleCloned: 'Cloned Role to {chat}.',
  }
} as const;

/**
 * 메시지 템플릿에 플레이스홀더 값을 주입
 */
export function interpolateMessage(
  template: string, 
  values: { chat: string; role: string }
): string {
  return template
    .replace(/\{chat\}/g, values.chat)
    .replace(/\{role\}/g, values.role);
}
