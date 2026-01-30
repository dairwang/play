<script setup lang="ts">
const props = defineProps<{
  src?: string
  fallback?: string
  cls?: string
}>()

function onError(e: any) {
  if (props.fallback && e?.target)
    e.target.src = props.fallback
}
</script>

<template>
  <image
    :src="`https://images.weserv.nl/?url=${props.src}` || `https://images.weserv.nl/?url=${props.fallback}`"
    :class="props.cls"
    referrer="no-referrer|origin|unsafe-url"
    mode="aspectFill"
    @error="onError" />
</template>
