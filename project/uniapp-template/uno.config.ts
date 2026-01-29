import presetWeapp from 'unocss-preset-weapp'
import { extractorAttributify, transformerClass } from 'unocss-preset-weapp/transformer'
import { defineConfig } from 'unocss/vite'
import transformerDirectives from '@unocss/transformer-directives'

const { presetWeappAttributify, transformerAttributify } = extractorAttributify()

export default defineConfig({
  // @ts-expect-error for demo
  presets: [presetWeapp(), presetWeappAttributify()],
  theme: {
    // 同步 fe 项目 tailwind.config.js 中的扩展颜色
    colors: {
      primary: '#E94560',
      secondary: '#0F3460',
      dark: '#1A1A2E',
      light: '#16213E',
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
