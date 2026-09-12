<template>
  <header class="page-header">
    <div class="page-header__inner">
      <button class="back-btn" type="button" @click="goBack" aria-label="Quay lại">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <span class="header-title">{{ title }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

// Định nghĩa Props truyền vào từ Component cha
const props = withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Thông tin'
})

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.page-header { 
  background: #ffffff; 
  padding: 10px 14px; 
  border-bottom: none;
  box-shadow: none;
  flex-shrink: 0;
  z-index: 10;
}

.page-header__inner { 
  max-width: 760px; 
  margin: 0 auto; 
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: #f1f5f9;
}

.back-icon {
  width: 22px;
  height: 22px;
  stroke: #8f0000;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #8f0000;
  user-select: none;
}

@media (max-width: 639px) {
  .header-title { font-size: 15px; }
}
</style>