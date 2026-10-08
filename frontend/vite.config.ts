import { defineConfig, loadEnv } from 'vite'

import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

import path from 'path'



const CLOUD_RUN_API = 'https://trangtran-api-327982031536.asia-southeast1.run.app'



function isLocalOnlyApiUrl(url: string): boolean {

  try {

    const host = new URL(url).hostname

    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'

  } catch {

    return false

  }

}



/** Lúc build production: thay localhost bằng Cloud Run (Cloudflare Pages hay set nhầm VITE_API_URL). */

function productionApiUrlForBuild(mode: string, env: Record<string, string>): string | undefined {

  if (mode !== 'production') return undefined

  const raw = (env.VITE_API_URL ?? '').trim()

  if (!raw) return undefined

  if (isLocalOnlyApiUrl(raw)) return CLOUD_RUN_API

  return raw.replace(/\/$/, '')

}



export default defineConfig(({ mode }) => {

  const envDir = path.resolve(__dirname, '..')

  const env = loadEnv(mode, envDir, '')

  const prodApi = productionApiUrlForBuild(mode, env)



  return {

    envDir,

    plugins: [react(), tailwindcss()],

    resolve: {

      alias: {

        '@': path.resolve(__dirname, './src'),

      },

    },

    define: prodApi ? { 'import.meta.env.VITE_API_URL': JSON.stringify(prodApi) } : {},

    server: {

      port: 5173,

      proxy: {

        '/api': {

          target: 'http://localhost:5000',

          changeOrigin: true,

        },

        '/__/auth': {

          target: 'https://trangtranhairsalon-872c5.firebaseapp.com',

          changeOrigin: true,

          secure: true,

        },

      },

    },

  }

})


