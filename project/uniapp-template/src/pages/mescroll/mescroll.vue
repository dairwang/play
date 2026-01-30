<!-- 此处不好用 -->
<script setup lang="ts">
import { ref } from 'vue'
import { onPageScroll, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

// @ts-expect-error 未安装
import useMescroll from '@/uni_modules/mescroll-uni/hooks/useMescroll.js'
import mescrollBody from '@/uni_modules/mescroll-uni/components/mescroll-body/mescroll-body.vue'

// 数据列表
const total = ref(0)
// 调用mescroll的hook (注: mescroll-uni不用传onPageScroll,onReachBottom, 而mescroll-body必传)
// 此处的钩子都是一些回调的默认实现, 可以不传, 也可以自定义实现, 此处官网的 demo 虽然是 hooks 实现 还是 mixin 的思想
const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom, onPullDownRefresh)
function downCallback() {
  if (total.value === 0)
    return

  setTimeout(() => {
    total.value = 20
    getMescroll().resetUpScroll(false)
  }, 1000)
}

function upCallback() {
  setTimeout(() => {
    total.value += 40
    getMescroll().endSuccess(20, !(total.value > 100))
  }, 1000)
}
</script>

<template>
  <view class="page-container">
    <mescroll-body @init="mescrollInit" @down="downCallback" @up="upCallback">
    <div v-for="item in total" :key="item">
      {{ item }}
    </div>
    </mescroll-body>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  background: linear-gradient(180deg, #1C0F3C 0%, #221245 50%, #1a0d35 100%);
  position: relative;
  min-height: 100vh;
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.15), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(168, 85, 247, 0.2), transparent),
    radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(1px 1px at 80% 10%, rgba(168, 85, 247, 0.15), transparent),
    radial-gradient(2px 2px at 40% 80%, rgba(255, 255, 255, 0.1), transparent);
  background-size: 200% 200%;
  background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%, 100% 0%;
  pointer-events: none;
  z-index: 0;
}

.page-container > * {
  position: relative;
  z-index: 1;
}
</style>
