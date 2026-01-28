<template>
  <img :src="currentSrc" :alt="alt" :class="cls" loading="lazy" @error="onError" />
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ src: { type: String, default: '' }, fallback: { type: String, default: '' }, alt: { type: String, default: '' }, cls: { type: String, default: '' } })
const isBad = (v) => !v
const currentSrc = ref(isBad(props.src) ? props.fallback : props.src)
watch(() => props.src, (v) => { currentSrc.value = isBad(v) ? props.fallback : v })
function onError() { if (props.fallback && currentSrc.value !== props.fallback) currentSrc.value = props.fallback }
</script>
