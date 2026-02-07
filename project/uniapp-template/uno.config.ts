import presetWeapp from 'unocss-preset-weapp'
import { extractorAttributify, transformerClass } from 'unocss-preset-weapp/transformer'
import { defineConfig } from 'unocss/vite'
import transformerDirectives from '@unocss/transformer-directives'

const { presetWeappAttributify, transformerAttributify } = extractorAttributify()

export default defineConfig({
  // @ts-expect-error for demo
  presets: [presetWeapp(), presetWeappAttributify()],
  theme: {
    // 同步 fe 项目 tailwind.config.js 中的扩展颜色，供 tailwind.css 中 @apply 使用
    colors: {
      primary: '#E94560',
      secondary: '#0F3460',
      dark: '#1A1A2E',
      light: '#16213E',
      pink: {
        500: '#ec4899',
      },
      green: { 500: '#22c55e' },
      blue: { 400: '#60a5fa', 500: '#3b82f6' },
      yellow: { 400: '#facc15', 500: '#eab308' },
      gray: { 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af' },
    },
  },
  transformers: [
    // @ts-expect-error for demo
    transformerAttributify({
      enforce: 'pre',
    }),
    // @ts-expect-error for demo
    transformerClass(),
    transformerDirectives(),
  ],
})
