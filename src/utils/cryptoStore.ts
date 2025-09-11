/**
 * 암호화 저장소 및 파일 시스템
 * WebCrypto API를 사용한 AES-GCM 암호화
 */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export interface EncryptedPackage {
  salt: string;
  iv: string;
  ciphertext: string;
  version: string;
}

export interface RolepackData {
  version: string;
  createdAt: string;
  deviceId: string;
  data: any;
  includesApiKey: boolean;
}

/**
 * PBKDF2로 암호화 키 파생
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250_000,
      hash: "SHA-256"
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * 객체를 AES-GCM으로 암호화
 */
export async function encryptJSON(obj: any, password: string): Promise<EncryptedPackage> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const plaintext = textEncoder.encode(JSON.stringify(obj));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  return {
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    version: "1.0"
  };
}

/**
 * AES-GCM으로 암호화된 객체 복호화
 */
export async function decryptJSON(pkg: EncryptedPackage, password: string): Promise<any> {
  const salt = Uint8Array.from(atob(pkg.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(pkg.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(pkg.ciphertext), c => c.charCodeAt(0));
  
  const key = await deriveKey(password, salt);
  
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    return JSON.parse(textDecoder.decode(plaintext));
  } catch (error) {
    throw new Error("잘못된 비밀번호이거나 손상된 파일입니다");
  }
}

/**
 * .rolepack 파일로 내보내기
 */
export async function exportRolepack(
  appState: any, 
  password: string, 
  includeApiKey = false
): Promise<void> {
  try {
    const safeState = structuredClone(appState);
    
    // API 키 제거 (선택적)
    if (!includeApiKey) {
      if (safeState.userSettings?.apiKeys) {
        safeState.userSettings.apiKeys = safeState.userSettings.apiKeys.map((key: any) => ({
          ...key,
          key: '[REMOVED_FOR_SECURITY]'
        }));
      }
      if (safeState.userSettings?.apiConfigurations) {
        safeState.userSettings.apiConfigurations = safeState.userSettings.apiConfigurations.map((config: any) => ({
          ...config,
          apiKey: '[REMOVED_FOR_SECURITY]'
        }));
      }
    }

    const rolepackData: RolepackData = {
      version: "2.0",
      createdAt: new Date().toISOString(),
      deviceId: localStorage.getItem('device_id') || 'unknown',
      data: safeState,
      includesApiKey
    };

    const encrypted = await encryptJSON(rolepackData, password);
    
    const blob = new Blob([JSON.stringify(encrypted)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rolegpt-backup-${Date.now()}.rolepack`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 백업 시간 기록
    localStorage.setItem('last_backup', new Date().toISOString());
    
  } catch (error) {
    console.error('내보내기 오류:', error);
    throw new Error('파일 내보내기 중 오류가 발생했습니다');
  }
}

/**
 * .rolepack 파일 불러오기
 */
export async function importRolepack(file: File, password: string): Promise<RolepackData> {
  try {
    const text = await file.text();
    const encrypted = JSON.parse(text) as EncryptedPackage;
    
    const decrypted = await decryptJSON(encrypted, password);
    
    // 버전 호환성 체크
    if (!decrypted.version || parseFloat(decrypted.version) < 1.0) {
      throw new Error('지원하지 않는 파일 버전입니다');
    }
    
    return decrypted as RolepackData;
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('파일 불러오기 중 오류가 발생했습니다');
  }
}

/**
 * 로컬 암호화 저장소 관리
 */
export class SecureVault {
  private cache: any = null;
  private locked = true;
  private autoSaveTimer: number | null = null;
  
  async openVault(password: string): Promise<void> {
    const encryptedData = localStorage.getItem('secure_vault');
    
    if (!encryptedData) {
      // 새 금고 생성
      this.cache = {};
      this.locked = false;
      return;
    }
    
    try {
      const encrypted = JSON.parse(encryptedData) as EncryptedPackage;
      this.cache = await decryptJSON(encrypted, password);
      this.locked = false;
    } catch (error) {
      throw new Error('잘못된 PIN입니다');
    }
  }
  
  async saveVault(password: string): Promise<void> {
    if (this.locked) {
      throw new Error('금고가 잠겨있습니다');
    }
    
    const encrypted = await encryptJSON(this.cache, password);
    localStorage.setItem('secure_vault', JSON.stringify(encrypted));
    localStorage.setItem('vault_configured', 'true');
  }
  
  getState(): any {
    if (this.locked) {
      throw new Error('금고가 잠겨있습니다');
    }
    return this.cache;
  }
  
  setState(updater: (state: any) => any): void {
    if (this.locked) {
      throw new Error('금고가 잠겨있습니다');
    }
    this.cache = updater(this.cache);
  }
  
  lock(): void {
    this.cache = null;
    this.locked = true;
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
  
  isLocked(): boolean {
    return this.locked;
  }
  
  enableAutoSave(password: string, intervalMinutes = 5): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = window.setInterval(async () => {
      if (!this.locked) {
        try {
          await this.saveVault(password);
          console.log('자동 저장 완료');
        } catch (error) {
          console.error('자동 저장 실패:', error);
        }
      }
    }, intervalMinutes * 60 * 1000);
  }
}

// 전역 금고 인스턴스
export const secureVault = new SecureVault();

/**
 * 파일 시스템 액세스 API를 사용한 금고 파일 관리
 */
export class FileVault {
  private fileHandle: FileSystemFileHandle | null = null;
  
  async selectVaultFile(): Promise<void> {
    if (!('showSaveFilePicker' in window)) {
      throw new Error('브라우저가 파일 시스템 액세스를 지원하지 않습니다');
    }
    
    this.fileHandle = await window.showSaveFilePicker({
      suggestedName: 'rolegpt-vault.json',
      types: [{
        description: 'RoleGPT Vault Files',
        accept: { 'application/json': ['.json'] }
      }]
    });
    
    localStorage.setItem('vault_file_configured', 'true');
  }
  
  async saveToFile(data: any, password: string): Promise<void> {
    if (!this.fileHandle) {
      throw new Error('금고 파일이 선택되지 않았습니다');
    }
    
    const encrypted = await encryptJSON(data, password);
    const writable = await this.fileHandle.createWritable();
    await writable.write(JSON.stringify(encrypted));
    await writable.close();
  }
  
  async loadFromFile(password: string): Promise<any> {
    if (!this.fileHandle) {
      throw new Error('금고 파일이 선택되지 않았습니다');
    }
    
    const file = await this.fileHandle.getFile();
    const text = await file.text();
    const encrypted = JSON.parse(text) as EncryptedPackage;
    
    return await decryptJSON(encrypted, password);
  }
  
  isConfigured(): boolean {
    return this.fileHandle !== null;
  }
}

// 전역 파일 금고 인스턴스
export const fileVault = new FileVault();
