<script setup lang="ts">
const props = defineProps<{
  src?: string
  fallback?: string
  cls?: string
}>()

const onError = (e: any) => {
  if (props.fallback && e?.target) {
    e.target.src = props.fallback
  }
}
</script>

<template>
  <image
    :src="props.src || props.fallback"
    :class="props.cls"
    mode="aspectFill"
    @error="onError"
  />
</template>

<style scoped>
</style>
