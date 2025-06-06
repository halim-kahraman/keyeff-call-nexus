
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    // Proxy nur im Development-Modus
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'http://keyeff.local/backend',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '/api')
        }
      }
    })
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": resolve(fileURLToPath(new URL('./src', import.meta.url))),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@tanstack/react-query',
      'react-router-dom',
      'lucide-react',
      'sonner',
      'date-fns',
      'class-variance-authority',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-slot',
      'react-day-picker'
    ]
  },
  build: {
    outDir: 'webapp/public',
    assetsDir: 'assets',
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
          'ui': ['lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar'],
        },
      },
      onwarn(warning: any, warn: any) {
        if (warning.code === 'MISSING_EXPORT') return;
        warn(warning);
      }
    }
  }
}));
