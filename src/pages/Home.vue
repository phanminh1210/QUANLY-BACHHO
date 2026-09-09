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
            <div class="schedule-card__tag schedule-card__tag--not-played">Sắp diễn</div>
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
      <div class="section-title margin-top-lg">Các chức năng hệ thống</div>
      <div class="home-menu">
        <router-link class="home-menu__item" to="/tat-ca-lich-dien">
          <img :src="iconTatCaShow" alt="Icon" class="menu-icon" />
          <span>Tất cả lịch diễn</span>
        </router-link>

        <router-link class="home-menu__item" to="/show-chua-dien">
          <img :src="iconchuadien" alt="Icon" class="menu-icon" />
          <span>Show chưa diễn</span>
        </router-link>

        <router-link class="home-menu__item" to="/show-da-dien">
          <img :src="iconDaDien" alt="Icon" class="menu-icon" />
          <span>Show đã diễn</span>
        </router-link>

        <router-link class="home-menu__item" to="/cham-cong">
          <img :src="iconChamCong" alt="Icon" class="menu-icon" />
          <span>Danh sách chấm công</span>
        </router-link>

        <router-link v-if="isAdmin" class="home-menu__item" to="/nhan-su">
          <img :src="iconNhanSu" alt="Icon" class="menu-icon" />
          <span>Nhân sự</span>
        </router-link>

        <router-link v-if="isAdmin" class="home-menu__item" to="/khach-hang">
          <img :src="iconKhachHang" alt="Icon" class="menu-icon" />
          <span>Khách hàng</span>
        </router-link>

        <router-link class="home-menu__item" to="/tien-ung">
          <img :src="iconTienUng" alt="Icon" class="menu-icon" />
          <span>Lịch sử ứng tiền</span>
        </router-link>

        <!-- Nút mới: Ứng tiền cho NS (Chỉ dành cho Admin) -->
        <router-link v-if="isAdmin" class="home-menu__item" to="/add-ung-tien-cho-ns">
          <img :src="iconUngTienChoNS" alt="Icon" class="menu-icon" />
          <span>Ứng tiền cho NS</span>
        </router-link>
      </div>

      <!-- 3. BIỂU ĐỒ & THỐNG KÊ -->
      <div class="chart-card margin-top-xxl">
        <div class="chart-header">
          <span class="chart-title">📊 Biểu đồ tăng trưởng show năm {{ currentYear }}</span>
        </div>
        <div class="chart-body">
          <div class="chart-container">
            <div v-for="(val, idx) in monthlyData" :key="idx" class="chart-col">
              <span class="chart-value" v-if="!loadingStats && val > 0">{{ val }}</span>
              <span class="chart-value chart-value--zero" v-else>&nbsp;</span>
              <div
                class="chart-bar"
                :style="{ height: loadingStats ? '30%' : getBarHeight(val) }"
                :class="{
                  'skeleton-bar': loadingStats,
                  'chart-bar--current': !loadingStats && (idx + 1) === currentMonth,
                  'chart-bar--has-value': !loadingStats && val > 0 && (idx + 1) !== currentMonth
                }"
              ></div>
              <span
                class="chart-label"
                :class="{ 'chart-label--current': (idx + 1) === currentMonth }"
              >T{{ idx + 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stats-card stats-card--red">
          <div class="stats-title-row">
            <span class="stats-title-icon">🎪</span>
            <span class="stats-label">Tổng Show cả năm {{ currentYear }}</span>
          </div>
          <strong class="stats-value">
            <span v-if="loadingStats" class="skeleton-text skeleton-text--number"></span>
            <template v-else>{{ totalYear }}</template>
            <span class="stats-unit"> show</span>
          </strong>
          <span class="stats-note">Tổng số show trong năm {{ currentYear }}</span>
        </div>

        <div class="stats-card stats-card--gold">
          <div class="stats-title-row">
            <span class="stats-title-icon">📆</span>
            <span class="stats-label">Tổng Show tháng {{ currentMonth }}</span>
          </div>
          <strong class="stats-value">
            <span v-if="loadingStats" class="skeleton-text skeleton-text--number"></span>
            <template v-else>{{ totalMonth }}</template>
            <span class="stats-unit"> show</span>
          </strong>
          <span class="stats-note">Tổng số show tháng {{ currentMonth }}/{{ currentYear }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

// Import các Component nút Fancy
import ButtonChiTiet_4 from '../components/common/ButtonChiTiet.vue'
import ButtonDangKyShow_4 from '../components/common/ButtonDangKyShow.vue'

import logo from '../assets/logo 2008.jpg'
import iconDaDien from '../assets/icondadien.jpg'
import iconchuadien from '../assets/iconchuadien.jpg'
import iconChamCong from '../assets/chamcong.jpg'
import iconTatCaShow from '../assets/tatcashow.jpg'
import iconNhanSu from '../assets/nhansu.jpg'
import iconKhachHang from '../assets/khachhang.jpg'
import iconTienUng from '../assets/tienung.png'
import iconUngTienChoNS from '../assets/ungtienchons.png'

type ShowItem = {
  id: string | number
  name: string
  date: string
  time: string
  location: string
  phone: string
  rawDate: Date | null
}

const router = useRouter()
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const loadingShows = ref(true)
const loadingStats = ref(true)
const upcomingShows = ref<ShowItem[]>([])
const totalYear = ref(0)
const totalMonth = ref(0)
const monthlyData = ref<number[]>(Array(12).fill(0))

// ── USER & AUTH ──
const isAdmin = computed(() => {
  const role = getUserField('vai_tro') || getUserField('role')
  if (role) return String(role).trim().toLowerCase() === 'admin'
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try {
      const p = JSON.parse(raw)
      return String(p.vai_tro || p.role || '').trim().toLowerCase() === 'admin'
    } catch {}
  }
  return false
})

const displayName = computed(() => {
  const name = getUserField('ten_ns') || getUserField('ten') || getUserField('name') || getUserField('tai_khoan')
  if (name) return String(name).trim()
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try {
      const p = JSON.parse(raw)
      return String(p.ten_ns || p.ten || p.name || p.tai_khoan || 'Đăng nhập').trim()
    } catch {}
  }
  return 'Đăng nhập'
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
  const now = Date.now()
  if (now - lastTouchEnd <= 300) {
    e.preventDefault()
  }
  lastTouchEnd = now
}

const handleGestureStart = (e: Event) => {
  e.preventDefault()
}

const parseDateTime = (dateStr: string, timeStr = ''): Date | null => {
  if (!dateStr) return null
  let y = 0, m = 0, d = 0
  if (dateStr.includes('/')) {
    const p = dateStr.split('/')
    if (p.length === 3) { d = +p[0]; m = +p[1] - 1; y = +p[2] }
  } else if (dateStr.includes('-')) {
    const p = dateStr.split('-')
    if (p.length === 3) { y = +p[0]; m = +p[1] - 1; d = +p[2] }
  }
  if (!y || isNaN(d) || isNaN(m)) {
    const dt = new Date(dateStr)
    return isNaN(dt.getTime()) ? null : dt
  }
  let hh = 0, mm = 0
  if (timeStr?.includes(':')) {
    const tp = timeStr.split(':')
    hh = parseInt(tp[0]) || 0
    mm = parseInt(tp[1]) || 0
  }
  return new Date(y, m, d, hh, mm)
}

const mapShow = (item: any, idx: number): ShowItem => ({
  id: item.ma_show || item.id || `UNKNOWN_${idx}`,
  name: item.ten_show || 'Chưa có tên',
  date: item.ngay || '',
  time: item.gio || '',
  location: item.diachi || item.dia_chi || '',
  phone: item.sdt || '',
  rawDate: parseDateTime(item.ngay || '', item.gio || ''),
})

const fetchUpcoming = async () => {
  loadingShows.value = true
  try {
    const res = await fetch(API_ENDPOINTS.GET_SHOW_CHUA_DIEN)
    const result = await res.json()

    if (result.success === true && Array.isArray(result.data)) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const mapped = result.data
        .map((item: any, idx: number) => mapShow(item, idx))
        .filter((s: ShowItem) => s.rawDate !== null)

      const future = mapped
        .filter((s: ShowItem) => (s.rawDate as Date) >= today)
        .sort((a: ShowItem, b: ShowItem) =>
          (a.rawDate as Date).getTime() - (b.rawDate as Date).getTime()
        )

      if (future.length > 0) {
        upcomingShows.value = future.slice(0, 1)
      } else {
        mapped.sort((a: ShowItem, b: ShowItem) =>
          (b.rawDate as Date).getTime() - (a.rawDate as Date).getTime()
        )
        upcomingShows.value = mapped.slice(0, 1)
      }
    }
  } catch (e) {
    console.error('Lỗi tải show sắp tới:', e)
  } finally {
    loadingShows.value = false
  }
}

const fetchStats = async () => {
  loadingStats.value = true
  try {
    const res = await fetch(API_ENDPOINTS.THONG_KE_SHOW_NAM_NAY)
    const result = await res.json()
    const payload = result?.data
    if (!payload) return
    totalYear.value = Number(payload.tong_show_nam_nay) || 0
    totalMonth.value = Number(payload.tong_show_thang_nay) || 0
    if (Array.isArray(payload.monthly_data) && payload.monthly_data.length === 12) {
      monthlyData.value = payload.monthly_data.map((v: any) => Number(v) || 0)
    }
  } catch (e) {
    console.error('Lỗi tải thống kê:', e)
  } finally {
    loadingStats.value = false
  }
}

const getBarHeight = (val: number): string => {
  if (val <= 0) return '8px'
  const max = Math.max(...monthlyData.value, 1)
  const pct = Math.round((val / max) * 100)
  return `${Math.max(pct, 18)}%`
}

onMounted(() => {
  fetchUpcoming()
  fetchStats()

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
.margin-top-lg { margin-top: 26px; }

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

/* ── MENU ICON ── */
.home-menu {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  justify-content: start;
  gap: 12px 8px;
  padding: 4px 0;
}
.home-menu__item {
  background: transparent;
  border: none;
  padding: 4px 2px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  text-align: center;
  transition: transform .15s;
}
.home-menu__item:hover {
  transform: translateY(-2px);
}
.home-menu__item span {
  font-size: 11px;
  font-weight: 700;
  color: #8f0000;
  line-height: 1.25;
  word-break: break-word;
}
.menu-icon {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* ── BIỂU ĐỒ ── */
.chart-card {
  max-width: 760px; 
  margin: 55px auto 12px auto;
  background: #ffffff;
  border-radius: 14px; 
  padding: 12px 12px 8px; 
  border: 1px solid rgba(143, 0, 0, 0.12);
  box-shadow: 0 4px 14px rgba(143, 0, 0, 0.08);
}
.chart-header { margin-bottom: 10px; }
.chart-title { font-size: 12px; font-weight: 800; color: #8f0000; }

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 130px;
  gap: 3px;
}
.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}
.chart-value {
  font-size: 9px;
  font-weight: 800;
  color: #8f0000;
  line-height: 1;
  margin-bottom: 2px;
  min-height: 11px;
  display: block;
  text-align: center;
}
.chart-value--zero { visibility: hidden; }

.chart-bar {
  width: 70%;
  max-width: 18px;
  background: #f0e6e6;
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease;
  min-height: 8px;
}
.chart-bar--has-value {
  background: linear-gradient(180deg, #e87070 0%, #c04040 100%);
}
.chart-bar--current {
  background: linear-gradient(180deg, #ff2525 0%, #8f0000 100%);
  box-shadow: 0 -2px 8px rgba(143,0,0,.3);
}
.chart-label { font-size: 10px; font-weight: 600; color: #6b7280; margin-top: 5px; white-space: nowrap; }
.chart-label--current { color: #8f0000; font-weight: 800; }

/* ── THỐNG KÊ ── */
.stats-grid { max-width: 760px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.stats-card {
  position: relative; overflow: hidden;
  border-radius: 14px; padding: 10px 12px 9px;
  color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,.08); min-height: 84px;
}
.stats-card::before {
  content: ''; position: absolute; top: -18px; right: -16px;
  width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.12);
}

.stats-card--red { 
  background: linear-gradient(135deg, #8f0000 0%, #6f0000 100%); 
}

.stats-card--gold { 
  background: linear-gradient(135deg, #ad0404 0%, #6f0000 100%); 
}

.stats-title-row { position: relative; z-index: 1; display: flex; align-items: center; gap: 6px; }
.stats-title-icon { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; background: rgba(255,255,255,.2); flex-shrink: 0; }

.stats-label { font-size: 11px; font-weight: 800; color: #ffffff; line-height: 1.2; }

.stats-value { position: relative; z-index: 1; display: flex; align-items: baseline; gap: 4px; margin-top: 8px; font-size: 22px; font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.15); }
.stats-unit { font-size: 13px; font-weight: 600; }
.stats-note { position: relative; z-index: 1; margin-top: 4px; display: block; font-size: 10px; color: rgba(255,255,255,.9); line-height: 1.35; }

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .home-header__logo { width: 38px; height: 38px; }
  .home-header__username { font-size: 14px; max-width: 160px; }
  .home-subtitle { font-size: 9px; padding-left: 12px; }
  .menu-icon { width: 38px; height: 38px; }
  .home-menu__item span { font-size: 10px; }
  .stats-card { min-height: 80px; padding: 9px 10px 8px; }
  .stats-label { font-size: 10px; }
  .stats-value { font-size: 20px; }
  .schedule-card { padding: 10px; }
  .schedule-card__name { font-size: 15px; }
  .schedule-card__key, .schedule-card__value { font-size: 12px; }
  .chart-bar { max-width: 12px; }
  .chart-value { font-size: 8px; }
  .chart-label { font-size: 9px; }
}
</style>