#!/usr/bin/env node
/**
 * Vite 환경변수 수정 스크립트
 * process.env -> import.meta.env 일괄 변환
 */

const fs = require('fs');
const path = require('path');

const envVarFixes = [
  // Node.js process.env를 Vite import.meta.env로 변경
  { 
    from: /process\.env\.NEXT_PUBLIC_SUPABASE_URL/g, 
    to: 'import.meta.env.VITE_SUPABASE_URL' 
  },
  { 
    from: /process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/g, 
    to: 'import.meta.env.VITE_SUPABASE_ANON_KEY' 
  },
  { 
    from: /process\.env\.NEXT_PUBLIC_SUPABASE_PROJECT_ID/g, 
    to: 'import.meta.env.VITE_SUPABASE_PROJECT_ID' 
  },
  { 
    from: /process\.env\.GOOGLE_CLIENT_ID/g, 
    to: 'import.meta.env.VITE_GOOGLE_CLIENT_ID' 
  },
  { 
    from: /process\.env\.GOOGLE_CLIENT_SECRET/g, 
    to: 'import.meta.env.VITE_GOOGLE_CLIENT_SECRET' 
  },
  { 
    from: /process\.env\.NEWS_API_KEY/g, 
    to: 'import.meta.env.VITE_NEWS_API_KEY' 
  },
  { 
    from: /process\.env\.NAVER_CLIENT_ID/g, 
    to: 'import.meta.env.VITE_NAVER_CLIENT_ID' 
  },
  { 
    from: /process\.env\.NAVER_CLIENT_SECRET/g, 
    to: 'import.meta.env.VITE_NAVER_CLIENT_SECRET' 
  },
  { 
    from: /process\.env\.GOOGLE_GEMINI_API_KEY/g, 
    to: 'import.meta.env.VITE_GOOGLE_GEMINI_API_KEY' 
  },
];

const excludeDirs = ['node_modules', 'dist', 'build', '.next', 'RoleGPT-oldversion', 'TO_DELETE', 'new_version', 'test-build'];
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!fileExtensions.includes(ext)) return false;
  
  const relativePath = path.relative(process.cwd(), filePath);
  for (const excludeDir of excludeDirs) {
    if (relativePath.startsWith(excludeDir)) return false;
  }
  
  return true;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of envVarFixes) {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed env vars in: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  
  return false;
}

function walkDirectory(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const relativePath = path.relative(process.cwd(), fullPath);
        if (!excludeDirs.some(exclude => relativePath.startsWith(exclude))) {
          walk(fullPath);
        }
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🔧 Starting environment variable fixes...\n');
  
  const files = walkDirectory(process.cwd());
  let fixedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Environment variable fix completed!`);
  console.log(`📊 Files processed: ${files.length}`);
  console.log(`🔧 Files modified: ${fixedCount}`);
}

if (require.main === module) {
  main();
}