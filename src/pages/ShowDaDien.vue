<template>
  <div class="schedule-page">
    <!-- MÀN HÌNH CHỜ LÀM MỜ KHÓA TOÀN BỘ THAO TÁC KHI XỬ LÝ API -->
    <transition name="fade">
      <div v-if="submitting" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Đang xử lý, vui lòng chờ...</p>
      </div>
    </transition>

    <!-- HEADER: CHỈ BẤM ICON NÚT < MỚI CHUYỂN TRANG -->
    <header class="schedule-page__header">
      <div class="schedule-page__inner header-content">
        <button class="back-btn" type="button" @click="goBack" aria-label="Quay lại">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="header-title">Danh sách các show đã diễn</span>
      </div>
    </header>

    <section class="schedule-page__content">
      <!-- THANH CÔNG CỤ TÌM KIẾM (IN HẲN VÀO NỀN TRẮNG) -->
      <div class="filter-bar-text">
        <div class="filter-row-left">
          <!-- 2. Ô Tìm Kiếm Dùng Component Chung -->
          <ThanhTimKiem
            v-model:keyword="searchForm.keyword"
            placeholder="Tìm tên, ngày, khách..."
          />
          <!-- 1. Ô Sắp Xếp Ngày Diễn -->
          <button class="sort-toggle-btn" type="button" @click="toggleSortOrder">
            <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M12 19l-4-4M12 19l4-4" />
              <template v-if="searchForm.sortOrder === 'asc'">
                <line x1="16" y1="6" x2="18" y2="6" />
                <line x1="16" y1="9.5" x2="19" y2="9.5" />
                <line x1="16" y1="13" x2="20" y2="13" />
                <line x1="16" y1="16.5" x2="21" y2="16.5" />
              </template>
              <template v-else>
                <line x1="16" y1="6" x2="21" y2="6" />
                <line x1="16" y1="9.5" x2="20" y2="9.5" />
                <line x1="16" y1="13" x2="19" y2="13" />
                <line x1="16" y1="16.5" x2="18" y2="16.5" />
              </template>
            </svg>
            <span class="sort-label">{{ searchForm.sortOrder === 'asc' ? 'Gần nhất' : 'Xa nhất' }}</span>
          </button>
        </div>
      </div>

      <!-- SKELETON LOADING -->
      <div v-if="loading && allSchedules.length === 0" class="schedule-list">
        <div v-for="n in 4" :key="n" class="schedule-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
      </div>

      <div v-else-if="errorMessage && allSchedules.length === 0" class="state-message state-message--error">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredSchedules.length === 0" class="state-message">
        Không tìm thấy show phù hợp với từ khóa tìm kiếm.
      </div>

      <!-- DANH SÁCH SHOW HIỂN THỊ -->
      <template v-else>
        <div class="schedule-list">
          <article
            v-for="item in filteredSchedules"
            :key="item.id"
            class="schedule-card"
            :class="`schedule-card--${item.statusClass}`"
          >
            <div class="schedule-card__top">
              <div class="schedule-card__name">{{ item.name }}</div>
              <div class="schedule-card__tag" :class="`schedule-card__tag--${item.statusClass}`">
                {{ item.status }}
              </div>
            </div>

            <div class="schedule-card__content">
              <div class="schedule-card__line">
                <span class="schedule-card__key">Loại show:</span>
                <span class="schedule-card__value">{{ item.type }}</span>
                <span class="schedule-card__key schedule-card__key--inline">Khách:</span>
                <span class="schedule-card__value">{{ item.rawKhachHang || 'Chưa cập nhật' }}</span>
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">Thời gian:</span>
                <span class="schedule-card__value">{{ item.date }} ({{ item.time }})</span>
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">Địa điểm:</span>
                <span class="schedule-card__value">{{ item.location }}</span>
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">SĐT:</span>
                <span class="schedule-card__value">{{ item.phone }}</span>
              </div>

              <!-- HÀNG NÚT BẤM CÔNG CỘNG DÙNG COMPONENT COMMON -->
              <div class="schedule-card__actions">
                <ButtonDangKyShow :show-id="item.id" />
                <ButtonChiTiet :show-id="item.id" />
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <!-- MODAL EDIT -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editForm.show" class="modal-overlay" @click="!submitting && closeEditForm()">
          <div class="edit-box" @click.stop>
            <h3 class="edit-title">Cập nhật show</h3>
            <div class="edit-fields">
              <div class="edit-field">
                <label class="edit-label">Tên show</label>
                <input class="edit-input" v-model="editForm.ten_show" type="text" placeholder="Tên show" />
              </div>

              <div class="edit-field">
                <label class="edit-label">Loại show</label>
                <select v-model="editForm.ma_loai_show" class="edit-input">
                  <option value="">-- Chọn loại show --</option>
                  <option v-for="t in loaiShowList" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div class="edit-row">
                <div class="edit-field">
                  <label class="edit-label">Ngày diễn</label>
                  <input class="edit-input" :value="formattedDateForModal" type="date" @change="onModalDateChange" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Giờ diễn</label>
                  <input
                    class="edit-input"
                    :class="{ 'edit-input--error': gioError }"
                    v-model="editForm.gio"
                    type="text"
                    placeholder="VD: 09:00"
                    maxlength="5"
                    @input="formatTimeInput"
                  />
                  <span v-if="gioError" class="edit-error">Phải đúng dạng HH:MM</span>
                </div>
              </div>

              <div class="edit-field">
                <label class="edit-label">Địa điểm</label>
                <input class="edit-input" v-model="editForm.diachi" type="text" placeholder="Địa điểm" />
              </div>

              <div class="edit-field">
                <label class="edit-label">Khách hàng</label>
                <input class="edit-input" v-model="editForm.ten_khachhang" type="text" placeholder="Tên khách hàng" />
              </div>

              <div class="edit-field">
                <label class="edit-label">SĐT</label>
                <input class="edit-input" v-model="editForm.sdt" type="tel" placeholder="SĐT" />
              </div>
            </div>

            <div class="edit-actions">
              <button class="btn btn--green" :disabled="submitting || gioError" type="button" @click="submitEditForm">
                {{ submitting ? 'Đang lưu...' : 'Lưu' }}
              </button>
              <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeEditForm">Hủy</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL CONFIRM DELETE -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="confirmModal.show" class="modal-overlay" @click="!submitting && closeConfirm()">
          <div class="confirm-box" @click.stop>
            <p class="confirm-msg">{{ confirmModal.message }}</p>
            <div class="confirm-actions">
              <button class="btn btn--red" :disabled="submitting" type="button" @click="confirmAction">
                {{ submitting ? 'Đang xử lý...' : 'Xác nhận' }}
              </button>
              <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeConfirm">Hủy</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TOAST -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
          <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import ButtonChiTiet from '../components/common/ButtonChiTiet.vue'
import ButtonDangKyShow from '../components/common/ButtonDangKyShow.vue'
import ThanhTimKiem from '../components/common/ThanhTimKiem.vue'

type Schedule = {
  id: string | number
  name: string; type: string; date: string; time: string
  location: string; phone: string; status: string
  statusClass: 'played' | 'not-played' | 'cancelled' | 'expired' | 'default'
  rawType: string; rawKhachHang: string
}

const loaiShowList = ['Khai trương','Động thổ','Khánh thành','Lễ Hội','Trung thu','Đám cưới','Mừng thọ','Xông đất','Sinh nhật','Khác']

const router       = useRouter()
const loading      = ref(false)
const submitting   = ref(false)
const errorMessage = ref('')
const allSchedules = ref<Schedule[]>([])

const goBack = () => {
  router.back()
}

// ── Search & Filter State ────────────────────────────────
const searchForm = ref({
  keyword: '',
  sortOrder: 'asc'
})

const toggleSortOrder = () => {
  searchForm.value.sortOrder = searchForm.value.sortOrder === 'asc' ? 'desc' : 'asc'
}

const parseDateToTimestamp = (dateStr: string): number => {
  if (!dateStr || dateStr === 'Chưa cập nhật' || !dateStr.includes('/')) return 0
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    return new Date(year, month, day).getTime()
  }
  return 0
}

const filteredSchedules = computed(() => {
  const result = allSchedules.value.filter(item => {
    if (searchForm.value.keyword.trim()) {
      const kw = searchForm.value.keyword.trim().toLowerCase()
      const matchName     = item.name.toLowerCase().includes(kw)
      const matchCustomer = item.rawKhachHang.toLowerCase().includes(kw)
      const matchDate     = item.date.toLowerCase().includes(kw)
      const matchTime     = item.time.toLowerCase().includes(kw)
      const matchLocation = item.location.toLowerCase().includes(kw)
      const matchPhone    = item.phone.toLowerCase().includes(kw)
      const matchType     = item.type.toLowerCase().includes(kw)

      if (!matchName && !matchCustomer && !matchDate && !matchTime && !matchLocation && !matchPhone && !matchType) {
        return false
      }
    }
    return true
  })

  return result.sort((a, b) => {
    const timeA = parseDateToTimestamp(a.date)
    const timeB = parseDateToTimestamp(b.date)
    return searchForm.value.sortOrder === 'asc' ? timeA - timeB : timeB - timeA
  })
})

// ── safeJson & Helper ────────────────────────────────────
const safeJson = async (res: Response): Promise<any | null> => {
  try {
    const text = await res.text()
    if (!text || text.trim() === '') return { success: true }
    try {
      return JSON.parse(text)
    } catch {
      return { success: true, rawText: text }
    }
  } catch {
    return null
  }
}

const isSuccessResponse = (res: any): boolean => {
  if (!res) return false
  if (res.code === 200 || res.status === 'success' || res.success === true) return true
  if (Array.isArray(res)) return true
  if (Array.isArray(res.data)) return true
  return false
}

// ── Edit Form Logic ───────────────────────────────────────
const editForm = ref({ show: false, ma_show: '', ten_show: '', ngay: '', gio: '', diachi: '', ten_khachhang: '', sdt: '', ma_loai_show: '' })
const gioError = ref(false)

const formattedDateForModal = computed(() => {
  const val = editForm.value.ngay?.trim() || ''
  if (val.includes('/')) {
    const [d, m, y] = val.split('/')
    return `${y}-${m?.padStart(2,'0')}-${d?.padStart(2,'0')}`
  }
  return val
})

const onModalDateChange = (e: Event) => {
  const v = (e.target as HTMLInputElement).value
  if (!v) return
  const [y, m, d] = v.split('-')
  if (y && m && d) editForm.value.ngay = `${d}/${m}/${y}`
}

const formatTimeInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/[^\d:]/g, '')
  if (val.includes(':')) {
    const [p1, p2 = ''] = val.split(':')
    let hh = p1.slice(0,2), mm = p2.slice(0,2)
    if (hh.length === 2 && parseInt(hh) > 23) hh = '23'
    if (mm.length === 2 && parseInt(mm) > 59) mm = '59'
    val = hh + ':' + mm
  } else {
    const digits = val.replace(/\D/g,'').slice(0,4)
    if (digits.length >= 3) {
      let hh = digits.slice(0,2), mm = digits.slice(2,4)
      if (parseInt(hh) > 23) hh = '23'
      val = hh + ':' + mm
    } else { val = digits }
  }
  editForm.value.gio = val
  input.value = val
  gioError.value = val !== '' && !/^\d{2}:\d{2}$/.test(val)
}

const closeEditForm = () => {
  if (submitting.value) return
  gioError.value = false
  editForm.value.show = false
}

const submitEditForm = async () => {
  if (!editForm.value.ma_show) return
  const gioVal = editForm.value.gio.trim()
  if (gioVal && !/^\d{2}:\d{2}$/.test(gioVal)) {
    gioError.value = true
    showToast('Giờ diễn phải đúng dạng HH:MM', 'error')
    return
  }
  gioError.value = false
  submitting.value = true
  try {
    const url = (API_ENDPOINTS as any).UPDATE_SHOW?.({
      ma_show: editForm.value.ma_show,
      ten_show: editForm.value.ten_show,
      ngay: editForm.value.ngay,
      gio: gioVal,
      diachi: editForm.value.diachi,
      ten_khachhang: editForm.value.ten_khachhang,
      sdt: editForm.value.sdt,
      ma_loai_show: editForm.value.ma_loai_show
    })
    if (!url) { showToast('API Cập nhật chưa được định nghĩa', 'error'); return }

    const res = await safeJson(await fetch(url))
    if (isSuccessResponse(res)) {
      showToast('Cập nhật show thành công!')
      editForm.value.show = false
      await fetchSchedules()
    } else {
      showToast(res?.message || 'Cập nhật thất bại!', 'error')
    }
  } catch (e) {
    console.error(e)
    showToast('Lỗi kết nối máy chủ!', 'error')
  } finally {
    submitting.value = false
  }
}

// ── Delete Confirm Modal ──────────────────────────────────
const confirmModal = ref<{ show: boolean; message: string; target: Schedule | null }>({
  show: false, message: '', target: null
})

const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const closeConfirm = () => { if (submitting.value) return; confirmModal.value.show = false }

const confirmAction = async () => {
  const { target } = confirmModal.value
  if (!target) return
  submitting.value = true
  try {
    const url = (API_ENDPOINTS as any).DELETE_SHOW?.(String(target.id))
    if (!url) { showToast('API Xóa chưa được định nghĩa', 'error'); return }
    const res = await safeJson(await fetch(url))

    if (isSuccessResponse(res)) {
      showToast(`Đã xóa show "${target.name}"`)
      confirmModal.value.show = false
      await fetchSchedules()
    } else {
      showToast(res?.message || 'Xóa thất bại!', 'error')
    }
  } catch (e) {
    console.error(e)
    showToast('Lỗi kết nối máy chủ!', 'error')
  } finally {
    submitting.value = false
  }
}

// ── Data Mapping & Fetching ──────────────────────────────
const getStatusClass = (s: string): Schedule['statusClass'] => {
  const v = (s || '').trim().toLowerCase()
  if (v === 'đã diễn')      return 'played'
  if (v === 'chưa diễn')    return 'not-played'
  if (v === 'đã hủy')       return 'cancelled'
  return 'default'
}

const mapItem = (item: any, index: number): Schedule => {
  const rawStatus = item.trang_thai || 'Đã diễn'
  const uniqueId = item.ma_show || item.id || `show-${index}`

  return {
    id:           uniqueId,
    name:         item.ten_show || 'Chưa có tên',
    type:         item.ma_loai_show || item.loai_show || item.ten_loai_show || 'Show diễn',
    date:         item.ngay     || 'Chưa cập nhật',
    time:         item.gio      || 'Chưa cập nhật',
    location:     item.diachi   || item.dia_chi || 'Chưa cập nhật',
    phone:        item.sdt      || 'Chưa cập nhật',
    status:       rawStatus,
    statusClass:  getStatusClass(rawStatus),
    rawType:      item.ma_loai_show || item.loai_show || item.ten_loai_show || '',
    rawKhachHang: item.ten_khachhang || '',
  }
}

const fetchSchedules = async () => {
  errorMessage.value = ''
  allSchedules.value = []
  loading.value = true

  try {
    const res = await fetch(API_ENDPOINTS.GET_SHOW_DA_DIEN, { method: 'GET', redirect: 'follow' }).then(safeJson)

    if (res && (res.success !== false || res.code === 200 || res.status === 'success')) {
      const rawData = Array.isArray(res) ? res : (res.data || [])
      const mappedData = rawData.map((item: any, idx: number) => mapItem(item, idx))

      allSchedules.value = mappedData

      if (allSchedules.value.length === 0) {
        errorMessage.value = 'Không có show nào ở trạng thái "Đã diễn".'
      }
    } else {
      errorMessage.value = res?.message || 'Không thể tải danh sách show.'
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách show đã diễn:', err)
    errorMessage.value = 'Không thể kết nối máy chủ. Vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSchedules()
})

onUnmounted(() => {
  allSchedules.value = []
})
</script>

<style scoped>
/* TRANG NỀN TRẮNG HOÀN TOÀN */
.schedule-page { 
  min-height: 100vh; 
  background: #ffffff; 
  position: relative; 
}

/* HEADER CỐ ĐỊNH */
.schedule-page__header { 
  background: #ffffff; 
  padding: 10px 14px; 
  border-bottom: none;
  box-shadow: none;
  position: relative; 
  z-index: 10;
}

.schedule-page__inner { 
  max-width: 760px; 
  margin: 0 auto; 
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* NÚT ICON QUAY LẠI RIÊNG BIỆT */
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

.schedule-page__content { padding: 6px 12px 40px; }

/* LOADING OVERLAY KHÓA TOÀN BỘ MÀN HÌNH */
.loading-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 99999; pointer-events: all;
}

.loading-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 10px; color: #ffffff;
  font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* CÔNG CỤ TÌM KIẾM VÀ LỌC IN HẲN VÀO NỀN TRẮNG */
.filter-bar-text {
  max-width: 760px;
  margin: 0 auto 12px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  position: relative; 
}
.filter-row-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  width: 100%;
}

/* Nút sắp xếp */
.sort-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.sort-icon {
  width: 15px;
  height: 15px;
  stroke: #475569;
  flex-shrink: 0;
}

.sort-label {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.state-message          { text-align: center; padding: 24px 15px; font-weight: 700; color: #8f0000; font-size: 14px; }
.state-message--error { color: #dc2626; }

/* DANH SÁCH SHOW */
.schedule-list { 
  max-width: 760px; 
  margin: 0 auto; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

/* THẺ SHOW CARD */
.schedule-card { 
  background: #fff; 
  border-radius: 10px; 
  padding: 12px 14px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); 
  border-left: 5px solid #9ca3af; 
}

.schedule-card--played     { border-left-color: #16a34a; }
.schedule-card--not-played { border-left-color: #facc15; }
.schedule-card--cancelled  { border-left-color: #dc2626; }
.schedule-card--expired    { border-left-color: #6b7280; }
.schedule-card--default    { border-left-color: #9ca3af; }

.schedule-card__top  { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.schedule-card__name { font-size: 15px; font-weight: 800; color: #8f0000; line-height: 1.3; }
.schedule-card__tag  { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--played     { color: #15803d; background: #ecfdf3; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }
.schedule-card__tag--cancelled  { color: #be123c; background: #fff1f2; }
.schedule-card__tag--expired    { color: #374151; background: #f3f4f6; }
.schedule-card__tag--default    { color: #4b5563; background: #f3f4f6; }

.schedule-card__content { display: flex; flex-direction: column; gap: 5px; }
.schedule-card__line    { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font-size: 12px; line-height: 1.4; }
.schedule-card__key      { font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 8px; }
.schedule-card__value   { font-weight: 500; color: #334155; }
.schedule-card__actions { margin-top: 6px; display: flex; justify-content: flex-end; gap: 8px; align-items: center; }

/* SKELETON ANIMATION */
.skeleton-card { border-left-color: #cbd5e1; height: 110px; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
.skeleton-line { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; }
.skeleton-title { height: 16px; width: 50%; }
.skeleton-text { height: 12px; width: 85%; }
.skeleton-text.short { width: 35%; }
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* NÚT BẤM DÙNG TRONG MODAL */
.btn { border: none; border-radius: 999px; padding: 6px 14px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }

.edit-box { background: #fff; border-radius: 12px; padding: 16px; width: 100%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
.edit-title  { margin: 0 0 12px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.edit-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.edit-field  { display: flex; flex-direction: column; gap: 3px; }
.edit-label  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input  { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; background: #f8fafc; }
.edit-input:focus  { border-color: #2563eb; background: #fff; }
.edit-input--error { border-color: #dc2626 !important; }
.edit-error        { font-size: 11px; font-weight: 600; color: #dc2626; }
.edit-actions      { margin-top: 12px; display: flex; gap: 8px; }
.edit-actions .btn { flex: 1; padding: 8px; font-size: 13px; }

.confirm-box { background: #fff; border-radius: 12px; padding: 16px; max-width: 280px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.18); text-align: center; }
.confirm-msg { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 12px; line-height: 1.4; }
.confirm-actions { display: flex; gap: 8px; }
.confirm-actions .btn { flex: 1; padding: 8px; }

.toast-pill { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 30000; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* RESPONSIVE LAYOUT */
@media (max-width: 639px) {
  .sort-label { font-size: 11px; }
  .schedule-card { padding: 10px 12px; }
  .schedule-card__name { font-size: 14px; }
  .schedule-card__line { font-size: 11px; }
  .btn { font-size: 11px; padding: 5px 12px; }
  .edit-row { grid-template-columns: 1fr; }
  .header-title { font-size: 15px; }
}
</style>