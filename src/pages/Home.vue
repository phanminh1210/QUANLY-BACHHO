<template>
  <div class="home-page">
    <!-- HEADER THƯƠNG HIỆU & TÀI KHOẢN -->
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

    <!-- BODY (Tự động cuộn khi tràn nội dung, vừa khít thì đứng yên) -->
    <section class="home-bottom">
      <!-- 1. LỊCH DIỄN SẮP TỚI (SHOW GẦN NHẤT) -->
      <div class="section-title">📅 Lịch diễn sắp tới</div>

      <div class="upcoming-list">
        <article
          v-for="item in (upcomingShows.length > 0 ? upcomingShows : [{} as ShowItem])"
          :key="item.id || 'skeleton-show'"
          class="schedule-card schedule-card--not-played"
        >
          <div class="schedule-card__top">
            <div class="schedule-card__name">
              <span v-if="loadingShows" class="skeleton-text skeleton-text--title"></span>
              <template v-else>{{ item.name || 'Chưa có show sắp diễn' }}</template>
            </div>
            <div class="schedule-card__tag schedule-card__tag--not-played">
              {{ item.status || 'Sắp diễn' }}
            </div>
          </div>
          <div class="schedule-card__content">
            <div class="schedule-card__line">
              <span class="schedule-card__key">Ngày:</span>
              <span class="schedule-card__value">
                <span v-if="loadingShows" class="skeleton-text skeleton-text--short"></span>
                <template v-else>{{ item.date || 'Chưa xếp' }}</template>
              </span>
              <span class="schedule-card__key schedule-card__key--inline">Giờ:</span>
              <span class="schedule-card__value">
                <span v-if="loadingShows" class="skeleton-text skeleton-text--short"></span>
                <template v-else>{{ item.time || 'Chưa xếp' }}</template>
              </span>
            </div>
            <div class="schedule-card__line">
              <span class="schedule-card__key">Địa điểm:</span>
              <span class="schedule-card__value">
                <span v-if="loadingShows" class="skeleton-text skeleton-text--medium"></span>
                <template v-else>{{ item.location || 'Chưa cập nhật' }}</template>
              </span>
            </div>
            <div class="schedule-card__line">
              <span class="schedule-card__key">SĐT:</span>
              <span class="schedule-card__value">
                <span v-if="loadingShows" class="skeleton-text skeleton-text--short"></span>
                <template v-else>{{ item.phone || 'Chưa có' }}</template>
              </span>
            </div>
            <!-- Thay thế bằng 2 Component Button Fancy -->
            <div class="schedule-card__actions">
              <ButtonDangKyShow_4
                :show-id="item.id"
                text="Đăng ký diễn"
                :disabled="loadingShows || !item.id"
              />
              <ButtonChiTiet_4
                :show-id="item.id"
                text="Chi tiết"
              />
            </div>
          </div>
        </article>
      </div>

      <!-- 2. DANH SÁCH ICON MENU -->
      <CacChuNang :is-admin="isAdmin" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS, SHOW_GANNHAT_SAPTOI_API } from '../config/api'
import { getUserField } from '../utils/auth'

// Import các Component nút Fancy & Danh sách chức năng
import ButtonChiTiet_4 from '../components/common/ButtonChiTiet.vue'
import ButtonDangKyShow_4 from '../components/common/ButtonDangKyShow.vue'
import CacChuNang from './CacChucNang.vue'

import logo from '../assets/logo 2008.jpg'

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
  if (fromAuth !== undefined && fromAuth !== null && String(fromAuth).trim() !== '') {
    return String(fromAuth).trim()
  }
  const direct = localStorage.getItem(key)
  return direct ? direct.trim() : ''
}

// ── USER & AUTH ──
const isAdmin = computed(() => {
  const role = readStorage('vai_tro') || readStorage('role')
  return role.toLowerCase() === 'admin'
})

const displayName = computed(() => {
  const name = readStorage('ten_ns') || readStorage('ten') || readStorage('name')
  return name || 'Đăng nhập'
})

const isLoggedIn = computed(() => {
  return displayName.value !== 'Đăng nhập' && displayName.value !== 'Chưa đăng nhập'
})

// Chuyển hướng sang trang /login khi bấm vào chữ "Đăng nhập"
const handleUserClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

// ── LOGIC CHẶN ZOOM MÀN HÌNH ──
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

const formatStatusLabel = (rawStatus: string): string => {
  const normalized = String(rawStatus || '').trim().toLowerCase()
  if (!normalized || normalized === 'chưa diễn') return 'Sắp diễn'
  return String(rawStatus).trim()
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
  status: formatStatusLabel(item?.trang_thai || ''),
})

const fetchUpcoming = async () => {
  loadingShows.value = true
  try {
    const endpoint =
      (API_ENDPOINTS as any).SHOW_GANNHAT_SAPTOI || SHOW_GANNHAT_SAPTOI_API
    const res = await fetch(endpoint)
    const result = await res.json()

    const isOk = result?.code === 200 || result?.success === true || result?.status === 'success'
    if (isOk && result?.data) {
      if (Array.isArray(result.data)) {
        upcomingShows.value = result.data.slice(0, 1).map((item: any, idx: number) => mapShow(item, idx))
      } else if (typeof result.data === 'object' && Object.keys(result.data).length > 0) {
        upcomingShows.value = [mapShow(result.data, 0)]
      } else {
        upcomingShows.value = []
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

  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchend', handleTouchEnd, { passive: false })
  document.addEventListener('gesturestart', handleGestureStart, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
  document.removeEventListener('gesturestart', handleGestureStart)
})
</script>

<style scoped>
/* Import CSS Loading từ src/styles/loading.css */
@import '../styles/loading.css';

/* KHUNG CHÍNH CỐ ĐỊNH KÍCH THƯỚC MÀN HÌNH, KHÔNG BỊ TRÀN TỰ DO */
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

/* ── HEADER ── */
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
  background: linear-gradient(135deg, #fef08a 0%, #eab308 50%, #ca8a04 100%);
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

/* ── PHẦN THÂN ── */
.home-bottom {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 14px 60px;
  overscroll-behavior-y: contain;
}

.section-title { max-width: 760px; margin: 0 auto 8px; font-size: 13px; font-weight: 800; color: #8f0000; }

/* ── CARD SHOW ── */
.upcoming-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.schedule-card {
  background: #ffffff;
  border-radius: 14px; padding: 10px 12px;
  border: 1px solid rgba(143, 0, 0, 0.12);
  box-shadow: 0 4px 14px rgba(143, 0, 0, 0.08);
  border-left: 5px solid #9ca3af;
}
.schedule-card--not-played { border-left-color: #facc15; }
.schedule-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.schedule-card__name { font-size: 16px; font-weight: 800; color: #8f0000; line-height: 1.2; flex: 1; }
.schedule-card__tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }
.schedule-card__content { display: flex; flex-direction: column; gap: 4px; }
.schedule-card__line { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.schedule-card__key { font-size: 13px; font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 10px; }
.schedule-card__value { font-size: 13px; font-weight: 500; color: #444; display: inline-flex; align-items: center; }
.schedule-card__actions { margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; align-items: center; }

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .home-header__logo { width: 38px; height: 38px; }
  .home-header__username { font-size: 14px; max-width: 160px; }
  .home-subtitle { font-size: 9px; padding-left: 12px; }
  .schedule-card { padding: 10px; }
  .schedule-card__name { font-size: 15px; }
  .schedule-card__key, .schedule-card__value { font-size: 12px; }
}
</style>