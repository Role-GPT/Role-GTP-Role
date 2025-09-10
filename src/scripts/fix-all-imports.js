#!/usr/bin/env node
/**
 * 모든 파일의 문제 임포트 일괄 수정 스크립트
 * 
 * 실행 방법: node scripts/fix-all-imports.js
 */

const fs = require('fs');
const path = require('path');

// 수정할 임포트 패턴들
const importFixes = [
  // sonner 버전 제거 (모든 버전 패턴)
  { from: /from ['"]sonner@[\d.]+['"]/g, to: 'from "sonner"' },
  { from: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]sonner@[\d.]+['"]/g, to: 'import { $1 } from "sonner"' },
  
  // Radix UI 버전 제거 
  { from: /from ['"]@radix-ui\/([^@'"]+)@[^'"]+['"]/g, to: 'from "@radix-ui/$1"' },
  
  // figma:asset 경로 수정 (존재하지 않는 경로 제거)
  { from: /import .+ from ['"]figma:asset\/[^'"]+['"];?\s*/g, to: '// Removed figma:asset import\n' },
  
  // React Hook Form 버전 수정
  { from: /from ['"]react-hook-form@[\d.]+['"]/g, to: 'from "react-hook-form"' },
  
  // 존재하지 않는 패키지 제거
  { from: /import .+ from ['"]react-markdown['"];?\s*/g, to: '// Removed react-markdown import (not installed)\n' },
  
  // 상대 경로 정리 (src/src 문제 해결)
  { from: /from ['"]\.\/(src\/src\/[^'"]+)['"]/g, to: 'from "./src/$2"' },
  { from: /from ['"]\.\.\/src\/src\/([^'"]+)['"]/g, to: 'from "../src/$1"' },
  { from: /from ['"]\.\.\/\.\.\/src\/src\/([^'"]+)['"]/g, to: 'from "../../src/$1"' },
  { from: /from ['"]\.\/(src\/[^'"]+)['"]/g, to: 'from "./$1"' },
  { from: /from ['"]\.\.\/src\/([^'"]+)['"]/g, to: 'from "../src/$1"' },
  { from: /from ['"]\.\.\/\.\.\/src\/([^'"]+)['"]/g, to: 'from "../../src/$1"' },
  
  // 컴포넌트 상대 경로 정리
  { from: /from ['"]\.\/(components\/[^'"]+)['"]/g, to: 'from "./$1"' },
  { from: /from ['"]\.\.\/components\/([^'"]+)['"]/g, to: 'from "../components/$1"' },
  { from: /from ['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: 'from "../../components/$1"' },
  
  // utils 경로 정리
  { from: /from ['"]\.\/(utils\/[^'"]+)['"]/g, to: 'from "./$1"' },
  { from: /from ['"]\.\.\/utils\/([^'"]+)['"]/g, to: 'from "../utils/$1"' },
  { from: /from ['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, to: 'from "../../utils/$1"' },
];

// 처리할 파일 확장자
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];

// 제외할 폴더들
const excludeDirs = ['node_modules', 'dist', 'build', '.next', 'RoleGPT-oldversion', 'TO_DELETE', 'new_version', 'test-build'];

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
    
    for (const fix of importFixes) {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
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
  console.log('🔧 Starting import fixes...\n');
  
  const files = walkDirectory(process.cwd());
  let fixedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Import fix completed!`);
  console.log(`📊 Files processed: ${files.length}`);
  console.log(`🔧 Files modified: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🚀 Run "npm run build" to test the fixes!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, walkDirectory };