
<template>
  <div class="home-page">
    <header class="home-header">
      <p class="home-subtitle">Hệ thống quản lý lịch diễn & nhân sự Bạch Hổ Đường</p>

      <div class="home-header__brand">
        <img :src="logo" alt="Logo" class="home-header__logo" />

        <div class="home-header__info">
          <div class="home-header__user-sub">
            <span
              class="status-dot"
              :class="isLoggedIn ? 'status-dot--online' : 'status-dot--offline'"
            ></span>

            <span
              class="home-header__username"
              :class="{ 'home-header__username--clickable': !isLoggedIn }"
              @click="handleUserClick"
            >
              {{ displayName }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <section class="home-bottom">
      <div class="section-title">Show sắp tới</div>

      <div class="upcoming-list">
        <div v-if="loadingShows" class="show-loading-wrapper">
          <IconLoading />
        </div>

        <KhungThongTinShow
          v-else-if="upcomingShows.length > 0"
          :show-id="upcomingShows[0].id"
          :ten-show="upcomingShows[0].name"
          :ngay="upcomingShows[0].date || 'Chưa xếp'"
          :gio="upcomingShows[0].time || 'Chưa xếp'"
          :trang-thai="upcomingShows[0].status"
        />

        <div v-else class="show-message">
          Chưa có show sắp tới
        </div>
      </div>

      <CacChuNang :is-admin="isAdmin" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS, SHOW_GANNHAT_SAPTOI_API } from '../config/api'
import { getUserField } from '../utils/auth'

import KhungThongTinShow from '../components/KhungThongTinShow.vue'
import IconLoading from '../components/IconLoading.vue'
import CacChuNang from './CacChucNang.vue'
import logo from '../assets/logo2008.jpg'

type ShowItem = {
  id: string | number
  name: string
  date: string
  time: string
  location: string
  customer: string
  phone: string
  showType: string
  status: string
}

const router = useRouter()

const loadingShows = ref(true)
const upcomingShows = ref<ShowItem[]>([])

const readStorage = (key: string): string => {
  const fromAuth = getUserField(key)

  if (
    fromAuth !== undefined &&
    fromAuth !== null &&
    String(fromAuth).trim() !== ''
  ) {
    return String(fromAuth).trim()
  }

  const direct = localStorage.getItem(key)
  return direct ? direct.trim() : ''
}

const isAdmin = computed(() => {
  const role = readStorage('vai_tro') || readStorage('role')
  return role.toLowerCase() === 'admin'
})

const displayName = computed(() => {
  const name =
    readStorage('ten_ns') ||
    readStorage('ten') ||
    readStorage('name')

  return name || 'Đăng nhập'
})

const isLoggedIn = computed(() => {
  return (
    displayName.value !== 'Đăng nhập' &&
    displayName.value !== 'Chưa đăng nhập'
  )
})

const handleUserClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

let lastTouchEnd = 0

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault()
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  const currentTime = Date.now()

  if (currentTime - lastTouchEnd <= 300) {
    e.preventDefault()
  }

  lastTouchEnd = currentTime
}

const handleGestureStart = (e: Event) => {
  e.preventDefault()
}

const mapShow = (item: any, idx = 0): ShowItem => ({
  id: item?.ma_show || item?.id || `SHOW_${idx}`,
  name: String(item?.ten_show || 'Chưa có tên').trim(),
  date: String(item?.ngay || '').trim(),
  time: String(item?.gio || '').trim(),
  location: String(item?.diachi ?? item?.dia_chi ?? '').trim(),
  customer: String(item?.ten_khachhang || '').trim(),
  phone: String(item?.sdt || '').trim(),
  showType: String(item?.ma_loai_show || '').trim(),
  status: String(item?.trang_thai || 'Chưa xác định').trim()
})

const fetchUpcoming = async () => {
  loadingShows.value = true
  upcomingShows.value = []

  try {
    const endpoint =
      (API_ENDPOINTS as any).SHOW_GANNHAT_SAPTOI ||
      SHOW_GANNHAT_SAPTOI_API

    const res = await fetch(endpoint)
    const result = await res.json()

    if (result?.code === 200 && result?.data) {
      if (Array.isArray(result.data)) {
        upcomingShows.value = result.data
          .slice(0, 1)
          .map((item: any, idx: number) => mapShow(item, idx))
      } else if (
        typeof result.data === 'object' &&
        Object.keys(result.data).length > 0
      ) {
        upcomingShows.value = [mapShow(result.data, 0)]
      }
    } else {
      upcomingShows.value = []
    }
  } catch (e) {
    console.error('Lỗi tải show sắp tới:', e)
    upcomingShows.value = []
  } finally {
    loadingShows.value = false
  }
}

onMounted(() => {
  fetchUpcoming()

  document.addEventListener('touchstart', handleTouchStart, {
    passive: false
  })

  document.addEventListener('touchend', handleTouchEnd, {
    passive: false
  })

  document.addEventListener('gesturestart', handleGestureStart, {
    passive: false
  })
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
  document.removeEventListener('gesturestart', handleGestureStart)
})
</script>

<style scoped>
@import '../styles/loading.css';

.home-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
}

.home-header {
  background: transparent;
  padding: 12px 16px 8px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
  flex-shrink: 0;
}

.home-subtitle {
  margin: 0;
  padding-left: 16px;
  font-size: 10px;
  font-weight: 700;
  color: #8f0000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  width: 100%;
}

.home-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px 6px 12px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(
    135deg,
    #fef08a 0%,
    #eab308 50%,
    #ca8a04 100%
  );
  border: 1px solid #fde047;
  border-left: none;
  box-shadow: 2px 3px 10px rgba(202, 138, 4, 0.25);
  max-width: max-content;
}

.home-header__logo {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ffffff;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.home-header__info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.home-header__user-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.status-dot--online {
  background-color: #16a34a;
  box-shadow: 0 0 4px rgba(22, 163, 74, 0.6);
}

.status-dot--offline {
  background-color: #dc2626;
  box-shadow: 0 0 4px rgba(220, 38, 38, 0.6);
}

.home-header__username {
  font-size: 15px;
  font-weight: 800;
  color: #710000;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.home-header__username--clickable {
  cursor: pointer;
  text-decoration: underline;
}

.home-bottom {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 14px 60px;
  overscroll-behavior-y: contain;
}

.section-title {
  max-width: 760px;
  margin: 0 auto 12px;
  font-size: 13px;
  font-weight: 800;
  color: #8f0000;
}

.upcoming-list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.show-loading-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  border-radius: 18px;
  background: transparent;
}

.show-loading-wrapper :deep(.loading-container) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: unset;
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
}

.show-message {
  padding: 24px 16px;
  text-align: center;
  color: #8f0000;
  font-size: 14px;
  font-weight: 700;
  background: #fff7f7;
  border: 1px dashed rgba(143, 0, 0, 0.25);
  border-radius: 14px;
}

@media (max-width: 640px) {
  .home-header__logo {
    width: 38px;
    height: 38px;
  }

  .home-header__username {
    font-size: 14px;
    max-width: 160px;
  }

  .home-subtitle {
    font-size: 9px;
    padding-left: 12px;
  }
}
</style>
