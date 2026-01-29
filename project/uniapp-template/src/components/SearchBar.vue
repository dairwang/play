<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emits = defineEmits(['update:modelValue', 'submit'])

function onInput(e: any) {
  emits('update:modelValue', e.detail.value)
}

function onConfirm() {
  emits('submit')
}
</script>

<template>
  <view class="search-bar">
    <input
      class="search-input"
      type="text"
      :value="props.modelValue"
      placeholder="搜索"
      confirm-type="search"
      @input="onInput"
      @confirm="onConfirm"
    />
  </view>
</template>

<style scoped>
.search-bar {
  width: 100%;
  padding: 8px 12px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.05);
}

.search-input {
  width: 100%;
  font-size: 14px;
  color: #fff;
}
</style>
