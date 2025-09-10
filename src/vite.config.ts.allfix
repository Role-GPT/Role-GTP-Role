import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'components'),
      '@styles': path.resolve(__dirname, 'styles'),
      // 오염 경로 흡수
      './src': path.resolve(__dirname, 'src'),
      '../src': path.resolve(__dirname, 'src'),
      '../../src': path.resolve(__dirname, 'src'),
      './components': path.resolve(__dirname, 'components'),
      '../components': path.resolve(__dirname, 'components'),
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'sonner']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true
  },
  preview: {
    port: 5173,
    strictPort: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // 환경변수 기본값 설정 (현재 프로젝트 정보로 업데이트)
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(process.env.VITE_SUPABASE_PROJECT_ID || 'xechvtzmtxxnvkfedwds'),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://xechvtzmtxxnvkfedwds.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY2h2dHptdHh4bnZrZmVkd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjc0MTcsImV4cCI6MjA3MjgwMzQxN30.9tStOoa2hSIHqlEczX0ucPlJyYBIq-CCat6mThfBDbk'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
})