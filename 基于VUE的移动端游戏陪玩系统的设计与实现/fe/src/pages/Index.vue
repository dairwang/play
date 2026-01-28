<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black pb-24 overflow-x-hidden w-full">
    <div class="px-4 pt-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-pink-500 grid place-items-center animate-[pulse-glow_3s_ease_infinite]">🎮</div>
          <div class="hero-title">电竞陪玩</div>
        </div>
        <div class="hidden md:flex items-center gap-3">
          <button class="btn-secondary-sm">发现</button>
          <button class="btn-primary-sm">发布</button>
        </div>
      </div>
      <div class="mt-4">
        <SearchBar v-model="searchKey" @submit="onSearch" />
      </div>
    </div>

    <div class="px-4 mt-4">
      <div class="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <div class="h-48 w-[85%] min-w-[280px] shrink-0 snap-center rounded-3xl overflow-hidden shadow-2xl" v-for="(item, idx) in banners" :key="idx">
          <SmartImage :src="item" :fallback="fallbacks.banner" cls="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <div class="mt-6">
      <div class="px-4 mb-3 flex justify-between items-end">
        <span class="section-title">热门游戏</span>
        <span class="chip-info flex items-center">查看全部</span>
      </div>
      <div v-if="loadingGames" class="px-4">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <div v-for="n in 4" :key="n" class="flex flex-col items-center animate-pulse">
            <div class="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 mb-2"></div>
            <div class="w-12 h-2 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
      <div v-else-if="errorGames" class="px-4">
        <div class="card p-6 text-center">
          <span class="text-gray-500 mb-3">加载失败</span>
          <button class="btn-secondary-sm" @click="fetchGames">重试</button>
        </div>
      </div>
      <div v-else-if="games.length === 0" class="px-4">
        <div class="card p-6 text-center text-gray-400">暂无游戏</div>
      </div>
      <div v-else class="px-4">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <div
            v-for="game in games"
            :key="game.id || game.name"
            class="flex flex-col items-center group cursor-pointer min-w-0"
            @click="selectGame(game)"
          >
            <div
              class="w-full aspect-square rounded-2xl bg-light border border-white/10 p-1 mb-2 relative overflow-hidden transition-all"
              :class="selectedGameId === game.id ? 'ring-2 ring-primary/70' : 'group-hover:ring-2 ring-primary/50'"
            >
              <SmartImage :src="game.icon" :fallback="GAME_ICON_MAP[game.name] || fallbacks.game" cls="w-full h-full rounded-xl group-hover:scale-105 transition-transform object-cover" />
            </div>
            <span class="text-gray-300 text-xs mt-1 w-full truncate text-center">{{ game.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 px-4">
      <div class="mb-4">
        <span class="section-title">推荐陪玩</span>
      </div>
      <div v-if="loadingCompanions" class="grid grid-cols-2 gap-4 px-0 animate-pulse">
        <div v-for="n in 4" :key="n" class="card overflow-hidden">
          <div class="relative aspect-[3/4] bg-white/5"></div>
          <div class="p-3">
            <div class="h-4 w-24 bg-white/10 rounded mb-2"></div>
            <div class="h-3 w-16 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
      <div v-else-if="errorCompanions" class="px-4">
        <div class="card p-6 text-center">
          <span class="text-gray-500 mb-3">加载失败</span>
          <button class="btn-secondary-sm" @click="fetchCompanions">重试</button>
        </div>
      </div>
      <div v-else-if="companions.length === 0" class="px-4">
        <div class="card p-6 text-center">
          <span class="text-gray-500">暂无推荐内容</span>
        </div>
      </div>
      <div v-else class="grid grid-cols-2 gap-4">
        <div v-for="(item, index) in companions" :key="index" class="card overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-2xl" @click="goDetail(item)">
          <div class="relative aspect-[3/4]">
            <SmartImage :src="item.User?.avatar" :fallback="fallbacks.avatar" cls="w-full h-full object-cover" />
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
              <div class="flex items-center">
                <span class="text-white font-bold text-sm">{{ item.User?.nickname || '未知用户' }}</span>
                <span class="badge-primary ml-2">20</span>
              </div>
            </div>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-primary font-bold text-sm">¥{{ item.price }}/局</span>
              <span class="text-gray-500 text-xs">0.5km</span>
            </div>
            <div class="flex flex-wrap gap-1 items-center">
              <span class="chip">{{ item.Game?.name || '未知游戏' }}</span>
              <span class="chip-primary">热门</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script>
import TabBar from '../components/TabBar.vue'
import request from '../common/request.js'
import SearchBar from '../components/SearchBar.vue'
import SmartImage from '../components/SmartImage.vue'
import { DEFAULT_AVATAR, DEFAULT_GAME_ICON, DEFAULT_BANNER, GAME_ICON_MAP } from '../common/images.js'

export default {
  name: 'Index',
  components: { TabBar, SearchBar, SmartImage },
  data() {
    return {
      banners: [
        'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=1200&auto=format&fit=crop'
      ],
      games: [],
      companions: [],
      loadingGames: false,
      loadingCompanions: false,
      errorGames: false,
      errorCompanions: false,
      searchKey: '',
      selectedGameId: null,
      GAME_ICON_MAP,
      fallbacks: {
        avatar: DEFAULT_AVATAR,
        game: DEFAULT_GAME_ICON,
        banner: DEFAULT_BANNER
      }
    }
  },
  mounted() {
    this.fetchGames()
    this.fetchCompanions()
  },
  methods: {
    async fetchGames() {
      try {
        this.loadingGames = true
        this.errorGames = false
        const q = this.searchKey ? `?keyword=${encodeURIComponent(this.searchKey)}` : ''
        const res = await request({ url: `/games/list${q}` })
        this.games = res.data
      } catch (e) {
        console.error(e)
        this.errorGames = true
      } finally {
        this.loadingGames = false
      }
    },
    async fetchCompanions() {
      try {
        this.loadingCompanions = true
        this.errorCompanions = false
        const params = new URLSearchParams()
        if (this.searchKey) params.set('keyword', this.searchKey)
        if (this.selectedGameId) params.set('game_id', this.selectedGameId)
        const qs = params.toString() ? `?${params.toString()}` : ''
        const res = await request({ url: `/companions/list${qs}` })
        this.companions = res.data
      } catch (e) {
        console.error(e)
        this.errorCompanions = true
      } finally {
        this.loadingCompanions = false
      }
    },
    goDetail(item) {
      this.$router.push(`/companion/${item.id}`)
    },
    onSearch() {
      this.fetchGames()
      this.fetchCompanions()
    },
    selectGame(game) {
      this.selectedGameId = this.selectedGameId === game.id ? null : game.id
      this.fetchCompanions()
    }
  }
}
</script>

<style scoped>
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
