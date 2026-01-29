<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { request } from '@/utils/request'
import SearchBar from '@/components/SearchBar.vue'
import SmartImage from '@/components/SmartImage.vue'
import { DEFAULT_AVATAR, DEFAULT_BANNER, DEFAULT_GAME_ICON, GAME_ICON_MAP } from '@/common/images'

const banners = ref<string[]>([
  'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=1200&auto=format&fit=crop',
])

const games = ref<any[]>([])
const companions = ref<any[]>([])
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

onMounted(() => {
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
</script>

<template>
  <view class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black pb-24 overflow-x-hidden w-full">
    <view class="px-4 pt-6">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-3">
          <view class="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-pink-500 grid place-items-center animate-[pulse-glow_3s_ease_infinite]">
            🎮
          </view>
          <!-- <view class="hero-title">
            电竞陪玩
          </view> -->
        </view>
        <view class="hidden md:flex items-center gap-3">
          <button class="btn-secondary-sm">
            发现
          </button>
          <button class="btn-primary-sm">
            发布
          </button>
        </view>
      </view>
      <view class="mt-4">
        <SearchBar v-model="searchKey" @submit="onSearch" />
      </view>
    </view>

    <view class="px-4 mt-4">
      <view class="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <view
          v-for="(item, idx) in banners"
          :key="idx"
          class="h-48 w-[85%] min-w-[280px] shrink-0 snap-center rounded-3xl overflow-hidden shadow-2xl"
        >
          <SmartImage :src="item" :fallback="fallbacks.banner" cls="w-full h-full object-cover" />
        </view>
      </view>
    </view>

    <view class="mt-6">
      <view class="px-4 mb-3 flex justify-between items-end">
        <text class="section-title">
          热门游戏
        </text>
        <text class="chip-info flex items-center">
          查看全部
        </text>
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
        <view class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
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
      <view class="mb-4">
        <text class="section-title">
          推荐陪玩
        </text>
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
          v-for="(item, index) in companions"
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
                <text class="badge-primary ml-2">
                  20
                </text>
              </view>
            </view>
          </view>
          <view class="p-3">
            <view class="flex items-center justify-between mb-2">
              <text class="text-primary font-bold text-sm">
                ¥{{ item.price }}/局
              </text>
              <text class="text-gray-500 text-xs">
                0.5km
              </text>
            </view>
            <view class="flex flex-wrap gap-1 items-center">
              <text class="chip">
                {{ item.Game?.name || '未知游戏' }}
              </text>
              <text class="chip-primary">
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
.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
