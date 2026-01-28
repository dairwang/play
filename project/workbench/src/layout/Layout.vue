<script setup>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
</script>

<template>
  <div class="flex h-screen w-full bg-dark overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 transition-all duration-300">
      <Sidebar />
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <Header />
      
      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-6 bg-dark">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
