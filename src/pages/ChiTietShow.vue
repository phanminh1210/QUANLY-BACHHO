<template>
  <div class="detail-page">
    <!-- Màn hình chờ làm mờ (Loading Overlay) khóa toàn bộ thao tác -->
    <transition name="fade">
      <div v-if="isSavingGlobal || savingStatus" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Đang lưu dữ liệu, vui lòng chờ...</p>
      </div>
    </transition>

    <section class="detail-page__header">
      <div class="detail-page__inner">
        <p class="detail-page__subtitle">Thông tin show và danh sách nhân sự tham gia</p>
      </div>
    </section>

    <section class="detail-page__content">
      <div v-if="loading" class="state-msg">Đang tải...</div>
      <div v-else-if="!show" class="state-msg state-msg--error">Không tìm thấy thông tin show.</div>

      <template v-else>
        <div class="detail-card">
          <div class="detail-info">
            <div class="detail-info__row">
              <span class="detail-info__label">Mã show:</span>
              <span class="detail-info__value">{{ show.ma_show || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">Tên show:</span>
              <input v-if="isEditing" v-model="editForm.ten_show" class="edit-input" type="text" placeholder="Tên show" />
              <span v-else class="detail-info__value">{{ show.ten_show || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">Loại show:</span>
              <select v-if="isEditing" v-model="editForm.ma_loai_show" class="edit-input">
                <option value="">-- Chọn loại show --</option>
                <option v-for="t in loaiShowList" :key="t" :value="t">{{ t }}</option>
              </select>
              <span v-else class="detail-info__value">{{ show.ma_loai_show || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">Ngày:</span>
              <input v-if="isEditing" :value="formattedDateForInput" class="edit-input" type="date" @change="onDateChange" />
              <span v-else class="detail-info__value">{{ show.ngay || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">Giờ:</span>
              <input v-if="isEditing" v-model="editForm.gio" type="text" class="edit-input" placeholder="VD: 19:30" maxlength="5" @input="formatTimeInput" />
              <span v-else class="detail-info__value">{{ show.gio || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">Địa điểm:</span>
              <input v-if="isEditing" v-model="editForm.diachi" class="edit-input" type="text" placeholder="Địa điểm" />
              <span v-else class="detail-info__value">{{ show.diachi || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">Khách hàng:</span>
              <input v-if="isEditing" v-model="editForm.ten_khachhang" class="edit-input" type="text" placeholder="Khách hàng" />
              <span v-else class="detail-info__value">{{ show.ten_khachhang || '—' }}</span>
            </div>
            <div class="detail-info__row">
              <span class="detail-info__label">SĐT:</span>
              <input v-if="isEditing" v-model="editForm.sdt" class="edit-input" type="tel" placeholder="Số điện thoại" />
              <span v-else class="detail-info__value">{{ show.sdt || '—' }}</span>
            </div>

            <!-- Trạng thái + Nút bấm -->
            <div class="detail-info__row">
              <span class="detail-info__label">Trạng thái:</span>
              <span class="status-badge" :class="statusClass(pendingStatus || show.trang_thai)">
                {{ pendingStatus || show.trang_thai || '—' }}
              </span>

              <template v-if="isAdmin">
                <template v-if="!isEditing">
                  <div class="status-dropdown-wrapper" ref="statusDropdownRef">
                    <button type="button" class="footer-btn footer-btn--outline" :disabled="savingStatus || isSavingGlobal" @click.stop="toggleStatusMenu">
                      Đổi trạng thái
                    </button>
                    <div v-if="showStatusMenu" class="status-menu">
                      <button v-for="st in availableStatuses" :key="st" type="button"
                        class="status-menu__item" :class="statusMenuItemClass(st)" @click="selectStatus(st)">
                        <span class="status-dot"></span>{{ st }}
                      </button>
                    </div>
                  </div>
                  
                  <button v-if="!isDaDienPendingSave" type="button" class="footer-btn footer-btn--primary" @click="enableEdit">Cập nhật</button>
                </template>
                <template v-else>
                  <button type="button" class="footer-btn footer-btn--outline" :disabled="isSavingGlobal" @click="handleCancelEdit">Hủy</button>
                  <button type="button" class="footer-btn footer-btn--primary" :disabled="isSavingGlobal" @click="handleSave">Lưu</button>
                </template>
              </template>
            </div>
          </div>
        </div>

        <ShowStaffSection
          v-model:staff-list="staffList"
          :loading-staff="loadingStaff"
          :is-editing="isEditing"
          :is-da-dien-pending-save="isDaDienPendingSave"
          :is-saving-staff="isSavingGlobal || savingStatus"
          @save-staff="handleSaveStaffOnly"
        />
      </template>
    </section>

    <transition name="toast">
      <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
        <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import ShowStaffSection from '../pages/FormNhanSuTheoShow.vue'

type ShowDetail = {
  ma_show: string; ten_show: string; ma_loai_show: string
  ngay: string; gio: string; diachi: string
  ten_khachhang: string; sdt: string; trang_thai: string
  [key: string]: string
}
type StaffItem = {
  ten_ns: string; vai_tro: string; luong: string; ghi_chu: string
  rowIndex?: number; isNew?: boolean
}

const loaiShowList = ['Khai trương','Động thổ','Khánh thành','Lễ Hội','Trung thu','Đám cưới','Mừng thọ','Xông đất','Sinh nhật','Khác']
const allStatuses   = ['chưa diễn', 'đã diễn', 'đã hủy']

const route          = useRoute()
const loading        = ref(false)
const loadingStaff   = ref(false)
const isSavingGlobal = ref(false)
const savingStatus   = ref(false)
const isAdmin        = ref(false)
const isEditing      = ref(false)
const showStatusMenu = ref(false)
const statusDropdownRef = ref<HTMLElement | null>(null)

const pendingStatus = ref<string | null>(null)
const isDaDienPendingSave = ref(false)

const show      = ref<ShowDetail | null>(null)
const editForm  = ref<ShowDetail>({ ma_show:'', ten_show:'', ma_loai_show:'', ngay:'', gio:'', diachi:'', ten_khachhang:'', sdt:'', trang_thai:'' })
const staffList = ref<StaffItem[]>([])
const originalShowData  = ref<ShowDetail | null>(null)
const originalStaffList = ref<StaffItem[]>([])

const availableStatuses = computed(() => {
  const cur = ((pendingStatus.value || show.value?.trang_thai) || '').trim().toLowerCase()
  return allStatuses.filter(s => s !== cur)
})

// ── TOAST ──
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3500)
}

// ── HELPERS ──
const clean = (v: any): string =>
  (v !== undefined && v !== null && v !== 'undefined' && v !== 'null') ? String(v).trim() : ''

const apiFetch = async (url: string, options?: RequestInit): Promise<any | null> => {
  try {
    const res  = await fetch(url, { redirect: 'follow', ...options })
    const text = await res.text()
    try { return JSON.parse(text) } catch { return null }
  } catch { return null }
}

const checkAdminRole = () => {
  try {
    const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
    if (raw) { const p = JSON.parse(raw); isAdmin.value = (p.vai_tro || '').toLowerCase() === 'admin'; return }
  } catch {}
  isAdmin.value = (localStorage.getItem('vai_tro') || '').toLowerCase() === 'admin'
}

// ── STATUS BADGES ──
const statusClass = (s: string) => {
  const v = (s || '').trim().toLowerCase()
  if (v === 'đã diễn')   return 'status-badge--done'
  if (v === 'chưa diễn') return 'status-badge--pending'
  if (v === 'đã hủy')    return 'status-badge--cancel'
  return ''
}
const statusMenuItemClass = (s: string) => {
  const v = s.trim().toLowerCase()
  if (v === 'đã diễn')   return 'status-menu__item--done'
  if (v === 'chưa diễn') return 'status-menu__item--pending'
  if (v === 'đã hủy')    return 'status-menu__item--cancel'
  return ''
}

const toggleStatusMenu = () => { showStatusMenu.value = !showStatusMenu.value }
const handleClickOutside = (e: MouseEvent) => {
  if (statusDropdownRef.value && !statusDropdownRef.value.contains(e.target as Node)) showStatusMenu.value = false
}

// CHỌN TRẠNG THÁI
const selectStatus = async (newStatus: string) => {
  if (!show.value) return
  const curStatus = (show.value.trang_thai || '').trim().toLowerCase()
  const targetStatus = newStatus.trim().toLowerCase()

  showStatusMenu.value = false

  // Trường hợp: "chưa diễn" -> "đã diễn"
  if (curStatus === 'chưa diễn' && targetStatus === 'đã diễn') {
    pendingStatus.value = newStatus
    isDaDienPendingSave.value = true
  } else {
    // Các trường hợp còn lại: Bật Màn hình chờ khóa thao tác -> Gọi API
    savingStatus.value = true
    try {
      const res = await apiFetch(API_ENDPOINTS.UPDATE_TRANG_THAI_SHOW(show.value.ma_show, newStatus))
      if (res && (res.status === 'success' || res.code === 200)) {
        show.value.trang_thai = newStatus
        pendingStatus.value = null
        isDaDienPendingSave.value = false
        showToast(`Đã chuyển: ${newStatus}`)
      } else {
        showToast(res?.message || 'Thất bại!', 'error')
      }
    } catch {
      showToast('Lỗi kết nối!', 'error')
    } finally {
      savingStatus.value = false
    }
  }
}

// ── DATE / TIME INPUT ──
const formattedDateForInput = computed(() => {
  const val = editForm.value.ngay?.trim() || ''
  if (val.includes('/')) {
    const [d, m, y] = val.split('/')
    return `${y}-${m?.padStart(2,'0')}-${d?.padStart(2,'0')}`
  }
  return val
})
const onDateChange = (e: Event) => {
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
    if (mm.length === 2 && parseInt(mm) > 59)  mm = '59'
    val = hh + ':' + mm
  } else {
    const digits = val.replace(/\D/g,'').slice(0,4)
    if (digits.length >= 3) {
      let hh = digits.slice(0,2), mm = digits.slice(2,4)
      if (parseInt(hh) > 23) hh = '23'
      val = hh + ':' + mm
    } else { val = digits }
  }
  editForm.value.gio = val; input.value = val
}

// ── EDITING & SAVING LOGIC ──
const enableEdit = () => {
  if (!show.value) return
  editForm.value = { ...show.value }
  originalShowData.value  = { ...show.value }
  originalStaffList.value = JSON.parse(JSON.stringify(staffList.value))
  isEditing.value = true
}

const handleCancelEdit = () => {
  if (originalShowData.value) show.value = { ...originalShowData.value }
  staffList.value = JSON.parse(JSON.stringify(originalStaffList.value))
  pendingStatus.value = null
  isDaDienPendingSave.value = false
  isEditing.value = false
}

const saveStaffBatch = async (maShow: string, tenShow: string, ngay: string) => {
  if (!maShow || maShow === 'undefined') return null
  const dataJson = JSON.stringify(staffList.value)
  const url = API_ENDPOINTS.CAP_NHAT_TAT_CA_NHAN_SU(maShow, tenShow || '', ngay || '', dataJson)
  return await apiFetch(url)
}

const handleSaveStaffOnly = async () => {
  if (!show.value) return
  const maShow = show.value.ma_show || (route.params.id as string)

  isSavingGlobal.value = true

  try {
    const targetStatus = pendingStatus.value || show.value.trang_thai

    const [resStatus, resStaff] = await Promise.all([
      pendingStatus.value ? apiFetch(API_ENDPOINTS.UPDATE_TRANG_THAI_SHOW(maShow, targetStatus)) : Promise.resolve({ status: 'success' }),
      saveStaffBatch(maShow, show.value.ten_show, show.value.ngay)
    ])

    const isStatusOk = resStatus && (resStatus.status === 'success' || resStatus.code === 200)
    const isStaffOk  = resStaff && (resStaff.status === 'success' || resStaff.code === 200)

    if (isStatusOk && isStaffOk) {
      show.value.trang_thai = targetStatus
      pendingStatus.value = null
      isDaDienPendingSave.value = false
      showToast('Lưu trạng thái và nhân sự thành công!')
    } else {
      showToast('Cập nhật thất bại, vui lòng kiểm tra lại!', 'error')
    }
  } catch {
    showToast('Lỗi kết nối mạng!', 'error')
  } finally {
    isSavingGlobal.value = false
  }
}

const handleSave = async () => {
  if (!show.value) return
  const maShow = show.value.ma_show || (route.params.id as string)

  isSavingGlobal.value = true

  try {
    const targetStatus = pendingStatus.value || editForm.value.trang_thai

    const [resShow, resStaff] = await Promise.all([
      apiFetch(API_ENDPOINTS.UPDATE_SHOW({
        ma_show:       maShow,
        ten_show:      editForm.value.ten_show,
        ma_loai_show:  editForm.value.ma_loai_show,
        ngay:          editForm.value.ngay,
        gio:           editForm.value.gio,
        diachi:        editForm.value.diachi,
        ten_khachhang: editForm.value.ten_khachhang,
        sdt:           editForm.value.sdt,
        trang_thai:    targetStatus,
      })),
      saveStaffBatch(maShow, editForm.value.ten_show || '', editForm.value.ngay || '')
    ])

    const isShowOk  = resShow && (resShow.status === 'success' || resShow.code === 200)
    const isStaffOk = resStaff && (resStaff.status === 'success' || resStaff.code === 200)

    if (isShowOk && isStaffOk) {
      show.value = { ...editForm.value, trang_thai: targetStatus }
      pendingStatus.value = null
      isEditing.value = false
      isDaDienPendingSave.value = false
      showToast('Cập nhật thành công!')
    } else {
      showToast('Cập nhật thất bại, vui lòng kiểm tra lại!', 'error')
    }
  } catch {
    showToast('Lỗi kết nối mạng!', 'error')
  } finally {
    isSavingGlobal.value = false
  }
}

// ── FETCH DATA ──
const fetchShow = async (maShow: string) => {
  loading.value = true
  try {
    const res = await apiFetch(API_ENDPOINTS.GET_DETAIL_SHOW_BY_MA_SHOW(maShow))
    if (res && (res.status === 'success' || res.code === 200)) {
      const d = res.data || {}
      show.value = {
        ma_show:       clean(d.ma_show),
        ten_show:      clean(d.ten_show),
        ma_loai_show:  clean(d.ma_loai_show),
        ngay:          clean(d.ngay),
        gio:           clean(d.gio),
        diachi:        clean(d.diachi),
        ten_khachhang: clean(d.ten_khachhang),
        sdt:           clean(d.sdt),
        trang_thai:    clean(d.trang_thai),
      }
    } else { showToast(res?.message || 'Không tìm thấy show!', 'error') }
  } catch { showToast('Lỗi kết nối!', 'error') }
  finally { loading.value = false }
}

const fetchStaff = async (maShow: string) => {
  loadingStaff.value = true
  try {
    const res = await apiFetch(API_ENDPOINTS.GET_VAI_TRO_BY_MA_SHOW(maShow))
    if (res && (res.status === 'success' || res.code === 200) && Array.isArray(res.data)) {
      staffList.value = res.data.map((item: any, idx: number) => ({
        ten_ns:  clean(item.ten_ns),
        vai_tro: clean(item.vai_tro),
        luong:   clean(item.luong),
        ghi_chu: clean(item.ghi_chu),
        rowIndex: idx,
      }))
    }
  } catch {}
  finally { loadingStaff.value = false }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  checkAdminRole()
  const maShow = String(route.params.id || '').trim()
  if (!maShow || maShow === 'undefined' || maShow === 'default') { showToast('Không tìm thấy mã show!', 'error'); return }
  await fetchShow(maShow)
  await fetchStaff(maShow)
})
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
.detail-page { position: relative; min-height: 100vh; background: #f6f1f1; }
.detail-page__header   { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.detail-page__inner    { max-width: 760px; margin: 0 auto; }
.detail-page__subtitle { margin: 0; text-align: center; font-size: 13px; color: rgba(255,255,255,.95); }
.detail-page__content  { max-width: 760px; margin: 0 auto; padding: 12px 12px 60px; }

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
  width: 42px; height: 42px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  margin-top: 14px; color: #ffffff;
  font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.state-msg        { text-align: center; padding: 30px; font-weight: 700; color: #8f0000; }
.state-msg--error { color: #dc2626; }

.detail-card { background: #fff; border-radius: 14px; padding: 14px; margin-bottom: 12px; border: 1px solid #ececec; box-shadow: 0 4px 10px rgba(143,0,0,.04); }

.detail-info        { display: flex; flex-direction: column; gap: 4px; }
.detail-info__row   { display: flex; align-items: center; gap: 6px; min-height: 22px; flex-wrap: nowrap; }
.detail-info__label { min-width: 80px; color: #8f0000; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.detail-info__value { color: #333; font-size: 13px; font-weight: 500; }

.edit-input {
  flex: 1; min-width: 0;
  font-size: 16px;
  transform: scale(0.8125);
  transform-origin: left center;
  width: calc(100% / 0.8125);
  padding: 4px 8px;
  border: 1px solid #d1d5db; border-radius: 7px;
  outline: none; background: #f8fafc; color: #1e293b;
  box-sizing: border-box;
}
.edit-input:focus { border-color: #8f0000; background: #fff; }

.status-badge          { display: inline-block; padding: 3px 11px; border-radius: 999px; font-size: 11px; font-weight: 700; flex-shrink: 0; white-space: nowrap; }
.status-badge--done    { background: #dcfce7; color: #15803d; }
.status-badge--pending { background: #fffbea; color: #a16207; }
.status-badge--cancel  { background: #fee2e2; color: #b91c1c; }

.status-dropdown-wrapper { position: relative; flex-shrink: 0; margin-left: auto; }
.status-menu {
  position: absolute; bottom: calc(100% + 6px); left: 0;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.12); z-index: 200;
  min-width: 130px; padding: 5px; display: flex; flex-direction: column; gap: 3px;
}
.status-menu__item {
  display: flex; align-items: center; gap: 7px; width: 100%; border: none;
  border-radius: 7px; padding: 8px 11px; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all .12s; box-sizing: border-box;
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-menu__item--done    { background: #f0fdf4; color: #15803d; }
.status-menu__item--done .status-dot { background: #16a34a; }
.status-menu__item--done:hover { background: #16a34a; color: #fff; }
.status-menu__item--done:hover .status-dot { background: #fff; }
.status-menu__item--pending { background: #fefce8; color: #a16207; }
.status-menu__item--pending .status-dot { background: #eab308; }
.status-menu__item--pending:hover { background: #eab308; color: #fff; }
.status-menu__item--pending:hover .status-dot { background: #fff; }
.status-menu__item--cancel  { background: #fef2f2; color: #b91c1c; }
.status-menu__item--cancel .status-dot { background: #ef4444; }
.status-menu__item--cancel:hover { background: #ef4444; color: #fff; }
.status-menu__item--cancel:hover .status-dot { background: #fff; }

.footer-btn {
  border: none; border-radius: 999px;
  padding: 4px 10px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all .15s; white-space: nowrap; flex-shrink: 0;
}
.footer-btn--outline { background: #fff; color: #334155; border: 1.5px solid #cbd5e1; }
.footer-btn--outline:hover { background: #f1f5f9; }
.footer-btn--primary { background: #8f0000; color: #fff; border: 1.5px solid #8f0000; }
.footer-btn--primary:hover { background: #b91c1c; }
.footer-btn:disabled { opacity: .6; cursor: not-allowed; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 10000; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }
</style>