<template>
  <div class="w-full">
    <div class="flex items-center bg-white/10 rounded-full px-4 py-2 border border-white/10 backdrop-blur-sm focus-within:ring-2 ring-primary/40">
      <Icon icon="mdi:magnify" class="text-gray-400 mr-2" width="20" height="20" />
      <input :placeholder="placeholder" :value="modelValue" @input="onInput" class="flex-1 bg-transparent text-white text-sm placeholder:text-gray-400 outline-none" />
      <button v-if="modelValue" class="ml-2 text-gray-400 active:scale-95" @click="clear">
        <Icon icon="mdi:close" width="18" height="18" />
      </button>
      <button class="ml-3 btn-primary-sm" @click="submit">搜索</button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
const props = defineProps({ modelValue: { type: String, default: '' }, placeholder: { type: String, default: '搜索陪玩师/游戏' } })
const emit = defineEmits(['update:modelValue','submit'])
function onInput(e) { emit('update:modelValue', e.target.value) }
function clear() { emit('update:modelValue', '') }
function submit() { emit('submit') }
</script>
