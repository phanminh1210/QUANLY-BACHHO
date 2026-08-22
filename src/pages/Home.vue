<template>
  <div class="home-page">
    <section class="home-top">
      <div class="home-top__inner">
        <p class="home-subtitle">Hệ thống quản lý LSR BẠCH HỔ ĐƯỜNG</p>
        <div class="home-menu">
          <router-link class="home-menu__item" to="/tat-ca-lich-dien">Tất cả lịch diễn</router-link>
          <router-link class="home-menu__item" to="/show-chua-dien">Show chưa diễn</router-link>
          <router-link class="home-menu__item" to="/show-da-dien">Show đã diễn</router-link>
          <router-link class="home-menu__item" to="/cham-cong">Danh sách chấm công</router-link>
          <!-- Chỉ admin -->
          <router-link v-if="isAdmin" class="home-menu__item" to="/nhan-su">Thông tin nhân sự</router-link>
          <router-link v-if="isAdmin" class="home-menu__item" to="/khach-hang">Thông tin khách hàng</router-link>
        </div>
      </div>
    </section>

    <section class="home-bottom">
      <div class="section-title">📅 Lịch diễn sắp tới</div>

      <div v-if="loadingShows" class="state-msg">Đang tải lịch diễn...</div>
      <div v-else-if="upcomingShows.length === 0" class="state-msg">Không có show nào sắp diễn.</div>

      <div v-else class="upcoming-list">
        <article
          v-for="item in upcomingShows"
          :key="item.id"
          class="schedule-card schedule-card--not-played"
        >
          <div class="schedule-card__top">
            <div class="schedule-card__name">{{ item.name }}</div>
            <div class="schedule-card__tag schedule-card__tag--not-played">Sắp diễn</div>
          </div>
          <div class="schedule-card__content">
            <div class="schedule-card__line">
              <span class="schedule-card__key">Ngày:</span>
              <span class="schedule-card__value">{{ item.date || 'Chưa xếp' }}</span>
              <span class="schedule-card__key schedule-card__key--inline">Giờ:</span>
              <span class="schedule-card__value">{{ item.time || 'Chưa xếp' }}</span>
            </div>
            <div class="schedule-card__line">
              <span class="schedule-card__key">Địa điểm:</span>
              <span class="schedule-card__value">{{ item.location || 'Chưa cập nhật' }}</span>
            </div>
            <div class="schedule-card__line">
              <span class="schedule-card__key">SĐT:</span>
              <span class="schedule-card__value">{{ item.phone || 'Chưa có' }}</span>
            </div>
            <div class="schedule-card__actions">
              <button class="btn btn--green" type="button" @click="goToRegister(item)">Đăng ký diễn</button>
              <button class="btn btn--red"   type="button" @click="goToDetail(item.id)">Chi tiết</button>
            </div>
          </div>
        </article>
      </div>

      <div class="section-title">📊 Thống kê show {{ currentYear }}</div>

      <div v-if="loadingStats" class="state-msg">Đang tải thống kê...</div>

      <div v-else class="stats-grid">
        <div class="stats-card stats-card--red">
          <div class="stats-title-row">
            <span class="stats-title-icon">🎪</span>
            <span class="stats-label">Show cả năm {{ currentYear }}</span>
          </div>
          <strong class="stats-value">{{ stats.totalYear }}<span class="stats-unit"> show</span></strong>
          <span class="stats-note">Tổng số show trong năm {{ currentYear }}</span>
        </div>

        <div class="stats-card stats-card--gold">
          <div class="stats-title-row">
            <span class="stats-title-icon">📆</span>
            <span class="stats-label">Show tháng {{ currentMonth }}</span>
          </div>
          <strong class="stats-value">{{ stats.totalMonth }}<span class="stats-unit"> show</span></strong>
          <span class="stats-note">Tổng số show tháng {{ currentMonth }}/{{ currentYear }}</span>
        </div>

        <div class="stats-card stats-card--soft">
          <div class="stats-title-row">
            <span class="stats-title-icon">✅</span>
            <span class="stats-label">Đã diễn tháng {{ currentMonth }}</span>
          </div>
          <strong class="stats-value">{{ stats.doneMonth }}<span class="stats-unit"> show</span></strong>
          <span class="stats-note">Show đã diễn trong tháng này</span>
        </div>

        <div class="stats-card stats-card--dark">
          <div class="stats-title-row">
            <span class="stats-title-icon">⏳</span>
            <span class="stats-label">Chưa diễn tháng {{ currentMonth }}</span>
          </div>
          <strong class="stats-value">{{ stats.pendingMonth }}<span class="stats-unit"> show</span></strong>
          <span class="stats-note">Show chưa diễn trong tháng này</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

type ShowItem = {
  id: string | number
  name: string
  date: string
  time: string
  location: string
  phone: string
  rawDate: Date | null
}

const router       = useRouter()
const now          = new Date()
const currentYear  = now.getFullYear()
const currentMonth = now.getMonth() + 1

const loadingShows  = ref(false)
const loadingStats  = ref(false)
const upcomingShows = ref<ShowItem[]>([])
const stats = ref({ totalYear: 0, totalMonth: 0, doneMonth: 0, pendingMonth: 0 })

// ── Admin check ───────────────────────────────────────────
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

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    if (d && m && y) return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`)
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

const mapShow = (item: any, idx: number): ShowItem => ({
  id:       item.ma_show || item.id || `UNKNOWN_${idx}`,
  name:     item.ten_show || 'Chưa có tên',
  date:     item.ngay    || '',
  time:     item.gio     || '',
  location: item.diachi  || item.dia_chi || '',
  phone:    item.sdt     || '',
  rawDate:  parseDate(item.ngay || ''),
})

const fetchUpcoming = async () => {
  loadingShows.value = true
  try {
    const res    = await fetch(API_ENDPOINTS.GET_SHOW_CHUA_DIEN)
    const result = await res.json()
    if ((result.status === 'success' || result.code === 200) && Array.isArray(result.data)) {
      upcomingShows.value = result.data
        .map((item: any, idx: number) => mapShow(item, idx))
        .filter((s: ShowItem) => s.rawDate !== null)
        .sort((a: ShowItem, b: ShowItem) => (a.rawDate as Date).getTime() - (b.rawDate as Date).getTime())
        .slice(0, 1)
    }
  } catch (e) { console.error('Lỗi tải show sắp tới:', e) }
  finally { loadingShows.value = false }
}

const fetchStats = async () => {
  loadingStats.value = true
  try {
    const res    = await fetch(API_ENDPOINTS.GET_ALL_SHOW)
    const result = await res.json()
    if ((result.status === 'success' || result.code === 200) && Array.isArray(result.data)) {
      let totalYear = 0, totalMonth = 0, doneMonth = 0, pendingMonth = 0
      for (const item of result.data) {
        const d = parseDate(item.ngay || '')
        if (!d) continue
        const y      = d.getFullYear()
        const m      = d.getMonth() + 1
        const status = (item.trang_thai || '').trim().toLowerCase()
        if (y === currentYear) {
          totalYear++
          if (m === currentMonth) {
            totalMonth++
            if (status === 'đã diễn')   doneMonth++
            if (status === 'chưa diễn') pendingMonth++
          }
        }
      }
      stats.value = { totalYear, totalMonth, doneMonth, pendingMonth }
    }
  } catch (e) { console.error('Lỗi tải thống kê:', e) }
  finally { loadingStats.value = false }
}

onMounted(() => { fetchUpcoming(); fetchStats() })

const goToDetail   = (id: string | number) => router.push({ name: 'ChiTietShow', params: { id: id || 'default' } })
const goToRegister = (item: ShowItem)      => router.push({ name: 'DangKyShow',  params: { id: item.id || 'default' }, query: { showName: item.name } })
</script>

<style scoped>
.home-page { min-height: 100vh; display: flex; flex-direction: column; background: #f6f1f1; }

/* ── Header ── */
.home-top { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px 16px; }
.home-top__inner { max-width: 760px; margin: 0 auto; }
.home-subtitle   { margin: 0; text-align: center; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.95); }

.home-menu { margin-top: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.home-menu__item {
  border: none; border-radius: 999px; padding: 9px 10px;
  font-size: 13px; font-weight: 700; color: #8f0000; background: #fff;
  cursor: pointer; text-decoration: none;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.home-menu__item:hover { background: #ffd700; }

/* ── Bottom ── */
.home-bottom { flex: 1; padding: 14px 14px 60px; }
.section-title { max-width: 760px; margin: 0 auto 8px; font-size: 13px; font-weight: 800; color: #8f0000; }
.state-msg     { text-align: center; padding: 14px; font-size: 13px; font-weight: 600; color: #8f0000; }

/* ── Upcoming ── */
.upcoming-list { max-width: 760px; margin: 0 auto 18px; display: flex; flex-direction: column; gap: 8px; }

.schedule-card {
  background: #fff; border-radius: 14px; padding: 10px 12px;
  border: 1px solid #ececec;
  box-shadow: 0 4px 10px rgba(143,0,0,.04);
  border-left: 5px solid #9ca3af;
}
.schedule-card--not-played { border-left-color: #facc15; }

.schedule-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.schedule-card__name { font-size: 16px; font-weight: 800; color: #8f0000; line-height: 1.2; }
.schedule-card__tag  { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }

.schedule-card__content { display: flex; flex-direction: column; gap: 4px; }
.schedule-card__line    { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.schedule-card__key     { font-size: 13px; font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 10px; }
.schedule-card__value   { font-size: 13px; font-weight: 500; color: #444; }
.schedule-card__actions { margin-top: 6px; display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }

.btn { border: none; border-radius: 999px; padding: 6px 13px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn--green { background: #16a34a; } .btn--green:hover { background: #15803d; }
.btn--red   { background: #8f0000; } .btn--red:hover   { background: #a50000; }

/* ── Stats ── */
.stats-grid { max-width: 760px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.stats-card {
  position: relative; overflow: hidden;
  border-radius: 14px; padding: 10px 12px 9px;
  color: #fff; box-shadow: 0 8px 16px rgba(143,0,0,.10); min-height: 84px;
}
.stats-card::before {
  content: ''; position: absolute; top: -18px; right: -16px;
  width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.12);
}
.stats-card--gold { background: linear-gradient(135deg, #8f0000 0%, #a50000 100%); }
.stats-card--red  { background: linear-gradient(135deg, #6f0000 0%, #8f0000 100%); }
.stats-card--soft { background: linear-gradient(135deg, #a50000 0%, #cf0000 100%); }
.stats-card--dark { background: linear-gradient(135deg, #5d0000 0%, #8f0000 100%); }

.stats-title-row  { position: relative; z-index: 1; display: flex; align-items: center; gap: 6px; }
.stats-title-icon { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; background: rgba(255,255,255,.16); flex-shrink: 0; }
.stats-label      { font-size: 11px; font-weight: 800; color: rgba(255,215,0,.95); line-height: 1.2; }
.stats-value      { position: relative; z-index: 1; display: block; margin-top: 8px; font-size: 22px; font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.15); }
.stats-unit       { font-size: 13px; font-weight: 600; }
.stats-note       { position: relative; z-index: 1; margin-top: 4px; display: block; font-size: 10px; color: rgba(255,255,255,.85); line-height: 1.35; }

@media (max-width: 640px) {
  .home-menu { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats-card { min-height: 80px; padding: 9px 10px 8px; }
  .stats-label { font-size: 10px; }
  .stats-value { font-size: 20px; }
  .schedule-card { padding: 10px; }
  .schedule-card__name { font-size: 15px; }
  .schedule-card__key, .schedule-card__value { font-size: 12px; }
  .btn { font-size: 11px; padding: 5px 10px; }
}
</style>