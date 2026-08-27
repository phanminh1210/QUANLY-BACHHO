<template>
  <div class="schedule-page">
    <section class="schedule-page__header">
      <div class="schedule-page__inner">
        <p class="schedule-page__subtitle">Danh sách các show sắp tới</p>
      </div>
    </section>

    <section class="schedule-page__content">
      <!-- THANH TÌM KIẾM ĐƠN NGUYÊN BẢN (TÌM THEO TẤT CẢ TRƯỜNG) -->
      <div class="search-box">
        <div class="search-field">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="Tìm kiếm theo tên, ngày, khách hàng, địa điểm, SĐT..."
          />
          <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">✕</button>
        </div>
      </div>

      <!-- LOADING SPINNER -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Đang tải dữ liệu...</p>
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
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">Khách hàng:</span>
                <span class="schedule-card__value">{{ item.rawKhachHang || 'Chưa cập nhật' }}</span>
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">Ngày:</span>
                <span class="schedule-card__value">{{ item.date }}</span>
                <span class="schedule-card__key schedule-card__key--inline">Giờ:</span>
                <span class="schedule-card__value">{{ item.time }}</span>
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">Địa điểm:</span>
                <span class="schedule-card__value">{{ item.location }}</span>
              </div>
              <div class="schedule-card__line">
                <span class="schedule-card__key">SĐT:</span>
                <span class="schedule-card__value">{{ item.phone }}</span>
              </div>

              <div class="schedule-card__actions">
                <button class="btn btn--green" type="button" @click="goToRegister(item)">Đăng ký show</button>
                <button class="btn btn--red" type="button" @click="goToDetail(item.id)">Chi tiết</button>
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
              <div class="edit-row">
                <div class="edit-field">
                  <label class="edit-label">Ngày diễn</label>
                  <input class="edit-input" v-model="editForm.ngay" type="text" placeholder="VD: 20/08/2026" />
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
                    @input="validateGio"
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
              <div class="edit-row">
                <div class="edit-field">
                  <label class="edit-label">SĐT</label>
                  <input class="edit-input" v-model="editForm.sdt" type="text" placeholder="SĐT" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Loại show</label>
                  <input class="edit-input" v-model="editForm.ma_loai_show" type="text" placeholder="Loại show" />
                </div>
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
      <Transition name="slide-down">
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

type Schedule = {
  id: string | number
  name: string; type: string; date: string; time: string
  location: string; phone: string; status: string
  statusClass: 'played' | 'not-played' | 'cancelled' | 'expired' | 'default'
  rawType: string; rawKhachHang: string
}

const router       = useRouter()
const loading      = ref(false)
const submitting   = ref(false)
const errorMessage = ref('')
const allSchedules = ref<Schedule[]>([])

// ── Search State (Dùng 1 ô duy nhất) ──────────────────────
const searchKeyword = ref('')

const parseDateToTimestamp = (dateStr: string): number => {
  if (!dateStr || dateStr === 'Chưa cập nhật') return 0
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts.map(p => parseInt(p, 10))
    return new Date(year, month - 1, day).getTime()
  }
  return 0
}

// Lọc dữ liệu khớp với BẤT KỲ trường nào trong show
const filteredSchedules = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) {
    return [...allSchedules.value].sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date))
  }

  return allSchedules.value
    .filter(item => {
      return (
        item.name.toLowerCase().includes(kw) ||
        item.type.toLowerCase().includes(kw) ||
        item.rawKhachHang.toLowerCase().includes(kw) ||
        item.date.toLowerCase().includes(kw) ||
        item.time.toLowerCase().includes(kw) ||
        item.location.toLowerCase().includes(kw) ||
        item.phone.toLowerCase().includes(kw) ||
        item.status.toLowerCase().includes(kw)
      )
    })
    .sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date))
})

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

const editForm = ref({ show: false, ma_show: '', ten_show: '', ngay: '', gio: '', diachi: '', ten_khachhang: '', sdt: '', ma_loai_show: '' })
const gioError = ref(false)

const validateGio = () => {
  const val = editForm.value.gio.trim()
  if (!val) { gioError.value = false; return }
  gioError.value = !/^\d{2}:\d{2}$/.test(val)
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

const getStatusClass = (s: string): Schedule['statusClass'] => {
  const v = (s || '').trim().toLowerCase()
  if (v === 'đã diễn')       return 'played'
  if (v === 'chưa diễn')     return 'not-played'
  if (v === 'đã hủy')        return 'cancelled'
  return 'default'
}

const mapItem = (item: any, index: number): Schedule => {
  const rawStatus = item.trang_thai || 'Chưa diễn'
  const uniqueId = item.ma_show || item.id || `show-${index}`

  return {
    id:           uniqueId,
    name:         item.ten_show || 'Chưa có tên',
    type:         item.ma_loai_show || item.loai_show || item.ten_loai_show || 'Show diễn',
    date:         item.ngay   || 'Chưa cập nhật',
    time:         item.gio    || 'Chưa cập nhật',
    location:     item.diachi || item.dia_chi || 'Chưa cập nhật',
    phone:        item.sdt    || 'Chưa cập nhật',
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
    const res = await fetch(API_ENDPOINTS.GET_SHOW_CHUA_DIEN, { method: 'GET', redirect: 'follow' }).then(safeJson)

    if (res && (res.success !== false || res.code === 200 || res.status === 'success')) {
      const rawData = Array.isArray(res) ? res : (res.data || [])
      const mappedData = rawData.map((item: any, idx: number) => mapItem(item, idx))

      allSchedules.value = mappedData

      if (allSchedules.value.length === 0) {
        errorMessage.value = 'Không có show nào ở trạng thái "Chưa diễn".'
      }
    } else {
      errorMessage.value = res?.message || 'Không thể tải danh sách show.'
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách show chưa diễn:', err)
    errorMessage.value = 'Không thể kết nối máy chủ. Vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}

const goToDetail = (id: string | number) => router.push({ name: 'ChiTietShow', params: { id } })

const goToRegister = (item: Schedule) => {
  router.push({ name: 'DangKyShow', params: { id: item.id || 'default' }, query: { showName: item.name } })
}

onMounted(() => {
  fetchSchedules()
})

onUnmounted(() => {
  allSchedules.value = []
  searchKeyword.value = ''
})
</script>

<style scoped>
.schedule-page { min-height: 100vh; background: #f6f1f1; }
.schedule-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.schedule-page__inner   { max-width: 760px; margin: 0 auto; }
.schedule-page__subtitle { margin: 5px 0 0; text-align: center; font-size: 14px; color: rgba(255,255,255,.95); }
.schedule-page__content { padding: 12px 10px 60px; }

/* BỘ LỌC 1 Ô TÌM KIẾM DUY NHẤT */
.search-box {
  max-width: 760px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
}

.search-field {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-icon {
  font-size: 14px;
  margin-right: 8px;
  color: #64748b;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  height: 38px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  min-width: 0;
}

.clear-btn {
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  padding: 0 4px;
  flex-shrink: 0;
}

.clear-btn:hover { color: #dc2626; }

/* LOADING STATE */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 15px;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3.5px solid rgba(143, 0, 0, 0.15);
  border-top-color: #8f0000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 600;
  color: #8f0000;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-message         { text-align: center; padding: 30px 15px; font-weight: 700; color: #8f0000; font-size: 15px; }
.state-message--error { color: #dc2626; }
.schedule-list         { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }

/* CARD SHOW */
.schedule-card {
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid #ececec;
  box-shadow: 0 4px 10px rgba(143,0,0,.04);
  border-left: 5px solid #9ca3af;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(143, 0, 0, 0.08);
}

.schedule-card--played     { border-left-color: #16a34a; }
.schedule-card--not-played { border-left-color: #facc15; }
.schedule-card--cancelled  { border-left-color: #dc2626; }
.schedule-card--expired    { border-left-color: #6b7280; }
.schedule-card--default    { border-left-color: #9ca3af; }

.schedule-card__top  { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.schedule-card__name { font-size: 16px; font-weight: 800; color: #8f0000; line-height: 1.2; }
.schedule-card__tag  { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--played     { color: #15803d; background: #ecfdf3; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }
.schedule-card__tag--cancelled  { color: #be123c; background: #fff1f2; }
.schedule-card__tag--expired    { color: #374151; background: #f3f4f6; }
.schedule-card__tag--default    { color: #4b5563; background: #f3f4f6; }

.schedule-card__content { display: flex; flex-direction: column; gap: 4px; }
.schedule-card__line    { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.schedule-card__key     { font-size: 13px; font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 10px; }
.schedule-card__value   { font-size: 13px; font-weight: 500; color: #444; }
.schedule-card__actions { margin-top: 4px; display: flex; justify-content: flex-end; gap: 8px; align-items: center; }

/* BUTTONS */
.btn {
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:active:not(:disabled) { transform: scale(0.95); }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }

/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }

.edit-box { background: #fff; border-radius: 16px; padding: 18px 16px; width: 100%; max-width: 360px; box-shadow: 0 10px 30px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
.edit-title  { margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.edit-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.edit-field  { display: flex; flex-direction: column; gap: 3px; }
.edit-label  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input  { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; }
.edit-input:focus    { border-color: #2563eb; }
.edit-input--error   { border-color: #dc2626 !important; }
.edit-error          { font-size: 11px; font-weight: 600; color: #dc2626; }
.edit-actions        { margin-top: 14px; display: flex; gap: 8px; }
.edit-actions .btn   { flex: 1; padding: 9px; font-size: 13px; }

.confirm-box { background: #fff; border-radius: 14px; padding: 16px 14px; max-width: 280px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.18); text-align: center; }
.confirm-msg { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 14px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; }
.confirm-actions .btn { flex: 1; padding: 8px 10px; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 300; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -20px); }

@media (max-width: 640px) {
  .search-input, .edit-input { font-size: 16px !important; }
  .schedule-card { padding: 10px; }
  .schedule-card__name { font-size: 15px; }
  .schedule-card__key, .schedule-card__value { font-size: 12px; }
  .btn { font-size: 11px; padding: 5px 11px; }
  .edit-row { grid-template-columns: 1fr; }
}
</style>