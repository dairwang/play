<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import SearchBar from '@/components/SearchBar.vue'
import SmartImage from '@/components/SmartImage.vue'
import { DEFAULT_AVATAR, DEFAULT_BANNER, DEFAULT_GAME_ICON, GAME_ICON_MAP } from '@/common/images'

import banner1 from '@/assets/images/王者荣耀.webp'
import banner2 from '@/assets/images/英雄联盟.webp'
import banner3 from '@/assets/images/金铲铲.webp'

const banners = ref<string[]>([banner1, banner2, banner3])

const games = ref<any[]>([])
const companions = ref<any[]>([])

const sortOptions = [
  { key: 'hot', label: '热门' },
  { key: 'price_desc', label: '价格高' },
  { key: 'price_asc', label: '价格低' },
  { key: 'rating_desc', label: '评分高' },
  { key: 'rating_asc', label: '评分低' },
] as const

const activeSort = ref<(typeof sortOptions)[number]['key']>('hot')

const loadingGames = ref(false)
const loadingCompanions = ref(false)
const errorGames = ref(false)
const errorCompanions = ref(false)
const searchKey = ref('')
const selectedGameId = ref<number | null>(null)

const fallbacks = {
  avatar: DEFAULT_AVATAR,
  game: DEFAULT_GAME_ICON,
  banner: DEFAULT_BANNER,
}

// 每次显示页面时重新拉取数据（含切换 tabBar 回到首页）
onShow(() => {
  fetchGames()
  fetchCompanions()
})

async function fetchGames() {
  try {
    loadingGames.value = true
    errorGames.value = false
    const q = searchKey.value ? `?keyword=${encodeURIComponent(searchKey.value)}` : ''
    const res: any = await request({ url: `/games/list${q}`, method: 'GET' })
    games.value = res.data || []
  }
  catch (e) {
    console.error(e)
    errorGames.value = true
  }
  finally {
    loadingGames.value = false
  }
}

async function fetchCompanions() {
  try {
    loadingCompanions.value = true
    errorCompanions.value = false

    const params: string[] = []
    if (searchKey.value)
      params.push(`keyword=${encodeURIComponent(searchKey.value)}`)
    if (selectedGameId.value)
      params.push(`game_id=${selectedGameId.value}`)

    const qs = params.length ? `?${params.join('&')}` : ''
    const res: any = await request({ url: `/companions/list${qs}`, method: 'GET' })
    companions.value = res.data || []
  }
  catch (e) {
    console.error(e)
    errorCompanions.value = true
  }
  finally {
    loadingCompanions.value = false
  }
}

function goDetail(item: any) {
  uni.navigateTo({
    url: `/pages/companion/detail?id=${item.id}`,
  })
}

function onSearch() {
  fetchGames()
  fetchCompanions()
}

function selectGame(game: any) {
  selectedGameId.value = selectedGameId.value === game.id ? null : game.id
  fetchCompanions()
}

const sortedCompanions = computed(() => {
  const list = companions.value.slice()
  switch (activeSort.value) {
    case 'price_desc':
      return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    case 'price_asc':
      return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    case 'rating_desc': {
      const getRating = (x: any) => Number(x.average_rating ?? x.rating ?? 0)
      return list.sort((a, b) => getRating(b) - getRating(a))
    }
    case 'rating_asc': {
      const getRating = (x: any) => Number(x.average_rating ?? x.rating ?? 0)
      return list.sort((a, b) => getRating(a) - getRating(b))
    }
    case 'hot':
    default:
      return list
  }
})
</script>

<template>
  <view class="home-container min-h-screen pb-24 overflow-x-hidden w-full">
    <view class="px-4 pt-6">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-3">
          <view class="h-40px w-40px rounded-xl bg-gradient-to-tr from-primary to-pink-500 grid place-items-center animate-[pulse-glow_3s_ease_infinite]">
            🎮
          </view>
          <view class="hero-title">
            <!-- 电竞陪玩 -->
          </view>
        </view>
      </view>
      <view class="mt-4">
        <SearchBar v-model="searchKey" @submit="onSearch" />
      </view>
    </view>

    <view class="px-4 mt-4 banner-wrap">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#a855f7"
        :autoplay="true"
        :interval="4000"
        :duration="500"
        :circular="true"
      >
        <swiper-item v-for="(item, idx) in banners" :key="idx">
          <view class="banner-item">
            <img :src="item" alt="" srcset="" style="object-fit: cover;" class="banner-img">
            <!-- <SmartImage :src="item" :fallback="fallbacks.banner" cls="banner-img" /> -->
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="mt-6">
      <view class="px-4 mb-3 flex justify-between items-end">
        <text class="section-title text-primary from-primary to-pink-500">
          热门游戏
        </text>
        <!-- <text class="chip-info flex items-center">
          查看全部
        </text> -->
      </view>

      <view v-if="loadingGames" class="px-4">
        <view class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <view
            v-for="n in 4"
            :key="n"
            class="flex flex-col items-center animate-pulse"
          >
            <view class="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 mb-2" />
            <view class="w-12 h-2 bg-white/10 rounded" />
          </view>
        </view>
      </view>

      <view v-else-if="errorGames" class="px-4">
        <view class="card p-6 text-center">
          <text class="text-gray-500 mb-3">
            加载失败
          </text>
          <button class="btn-secondary-sm" @click="fetchGames">
            重试
          </button>
        </view>
      </view>

      <view v-else-if="games.length === 0" class="px-4">
        <view class="card p-6 text-center text-gray-400">
          暂无游戏
        </view>
      </view>

      <view v-else class="px-4">
        <view class="grid grid-cols-5 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <view
            v-for="game in games"
            :key="game.id || game.name"
            class="flex flex-col items-center group cursor-pointer min-w-0"
            @click="selectGame(game)"
          >
            <view
              class="w-full aspect-square rounded-2xl bg-light border border-white/10 p-1 mb-2 relative overflow-hidden transition-all"
              :class="selectedGameId === game.id ? 'ring-2 ring-primary/70' : 'group-hover:ring-2 ring-primary/50'"
            >
              <SmartImage
                :src="game.icon"
                :fallback="GAME_ICON_MAP[game.name] || fallbacks.game"
                cls="w-full h-full rounded-xl group-hover:scale-105 transition-transform object-cover"
              />
            </view>
            <text class="text-gray-300 text-xs mt-1 w-full truncate text-center">
              {{ game.name }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="mt-8 px-4">
      <view class="mb-4 flex items-center justify-between">
        <text class="section-title text-primary">
          推荐陪玩
        </text>
        <view class="flex gap-3 text-xs">
          <text
            v-for="opt in sortOptions"
            :key="opt.key"
            class="cursor-pointer"
            :class="activeSort === opt.key ? 'text-primary font-bold' : 'text-gray-400'"
            @click="activeSort = opt.key"
          >
            {{ opt.label }}
          </text>
        </view>
      </view>

      <view v-if="loadingCompanions" class="grid grid-cols-2 gap-4 px-0 animate-pulse">
        <view
          v-for="n in 4"
          :key="n"
          class="card overflow-hidden"
        >
          <view class="relative aspect-[3/4] bg-white/5" />
          <view class="p-3">
            <view class="h-4 w-24 bg-white/10 rounded mb-2" />
            <view class="h-3 w-16 bg-white/10 rounded" />
          </view>
        </view>
      </view>

      <view v-else-if="errorCompanions" class="px-4">
        <view class="card p-6 text-center">
          <text class="text-gray-500 mb-3">
            加载失败
          </text>
          <button class="btn-secondary-sm" @click="fetchCompanions">
            重试
          </button>
        </view>
      </view>

      <view v-else-if="companions.length === 0" class="px-4">
        <view class="card p-6 text-center">
          <text class="text-gray-500">
            暂无推荐内容
          </text>
        </view>
      </view>

      <view v-else class="grid grid-cols-2 gap-4">
        <view
          v-for="(item, index) in sortedCompanions"
          :key="index"
          class="card overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-2xl"
          @click="goDetail(item)"
        >
          <view class="relative aspect-[3/4]">
            <SmartImage :src="item.User?.avatar" :fallback="fallbacks.avatar" cls="w-full h-full object-cover" />
            <view class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
              <view class="flex items-center">
                <text class="text-white font-bold text-sm">
                  {{ item.User?.nickname || '未知用户' }}
                </text>
                <!-- <text class="badge-primary ml-2">
                  20
                </text> -->
              </view>
            </view>
          </view>
          <view class="p-3">
            <view class="flex items-center justify-between mb-1">
              <text class="text-primary font-bold text-sm">
                ¥{{ item.price }}/小时
              </text>
            </view>
            <!-- 评分：与详情页风格保持一致的精简版 -->
            <view
              v-if="item.evaluation_count > 0"
              class="flex items-center gap-1 mb-2"
            >
              <u-rate
                :model-value="item.average_rating"
                :count="5"
                size="12"
                readonly
                active-color="#FF2D55"
              />
              <text class="text-gray-400 text-10px">
                {{ item.average_rating }} 分 · {{ item.evaluation_count }} 评
              </text>
            </view>
            <view class="flex flex-wrap gap-1 items-center">
              <text class="chip text-white">
                {{ item.Game?.name || '未知游戏' }}
              </text>
              <text class="chip-primary text-white">
                热门
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.home-container {
  background: linear-gradient(180deg, #1C0F3C 0%, #221245 50%, #1a0d35 100%);
  position: relative;
  min-height: 100vh;
}

/* 添加星光纹理效果 */
.home-container::before {
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

.home-container > view {
  position: relative;
  z-index: 1;
}

.banner-wrap {
  width: 91%;
}

.banner-swiper {
  height: 384rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.banner-item {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 24rpx;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
