<template>
  <div class="schedule-page">
    <section class="schedule-page__header">
      <div class="schedule-page__inner">
        <h2 class="schedule-page__title">Các Show chưa diễn</h2>
        <p class="schedule-page__subtitle">Danh sách các lịch diễn sắp tới của hệ thống</p>
      </div>
    </section>

    <section class="schedule-page__content">
      <div v-if="loading && schedules.length === 0" class="schedule-status-msg">Đang tải danh sách show...</div>
      <div v-else-if="!loading && schedules.length === 0" class="schedule-status-msg">Không có show nào ở trạng thái "Chưa diễn".</div>

      <template v-else>
        <div class="schedule-list">
          <article v-for="(item, index) in schedules" :key="item.id || index" class="schedule-card schedule-card--not-played">
            <div class="schedule-card__top">
              <div class="schedule-card__name">{{ item.name }}</div>
              <div class="schedule-card__tag schedule-card__tag--not-played">{{ item.status }}</div>
            </div>
            <div class="schedule-card__content">
              <div class="schedule-card__line">
                <span class="schedule-card__key">Loại show:</span>
                <span class="schedule-card__value">{{ item.type }}</span>
              </div>
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
                <button class="btn btn--green" type="button" @click.prevent.stop="goToRegisterShow(item)">Đăng ký diễn</button>
                <button class="btn btn--red"   type="button" @click.prevent.stop="goToDetail(item.id)">Chi tiết</button>
                <div v-if="isAdmin" class="dropdown-wrap">
                  <button class="btn btn--gray" type="button" @click.stop="toggleDropdown(item.id)">Đổi trạng thái</button>
                  <div v-if="openDropdownId === item.id" class="status-dropdown" @click.stop>
                    <button class="status-option status-option--done"    type="button" @click="changeStatus(item, 'đã diễn')">đã diễn</button>
                    <button class="status-option status-option--pending" type="button" @click="changeStatus(item, 'chưa diễn')">chưa diễn</button>
                    <button class="status-option status-option--cancel"  type="button" @click="changeStatus(item, 'đã hủy')">đã hủy</button>
                    <div class="status-divider"></div>
                    <button class="status-option status-option--delete"  type="button" @click="deleteShow(item)">Xóa show</button>
                  </div>
                </div>
                <button v-if="isAdmin" class="btn btn--blue" type="button" @click.stop="openEditForm(item)">Cập nhật</button>
              </div>
            </div>
          </article>
        </div>

        <div ref="sentinel" class="sentinel">
          <span v-if="loading" class="loading-more">Đang tải thêm...</span>
          <span v-else-if="allLoaded" class="all-loaded">✓ Đã hiển thị tất cả {{ schedules.length }} show</span>
        </div>
      </template>
    </section>

    <div v-if="openDropdownId !== null" class="dropdown-overlay" @click="closeDropdown" />

    <!-- FORM CẬP NHẬT -->
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
              <input class="edit-input" :class="{ 'edit-input--error': gioError }" v-model="editForm.gio"
                type="text" placeholder="VD: 09:00" maxlength="5" @input="validateGio" />
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

    <!-- CONFIRM -->
    <div v-if="confirmModal.show" class="modal-overlay" @click="!submitting && closeConfirm()">
      <div class="confirm-box" @click.stop>
        <p class="confirm-msg">{{ confirmModal.message }}</p>
        <div class="confirm-actions">
          <button class="btn btn--red"  :disabled="submitting" type="button" @click="confirmAction">
            {{ submitting ? 'Đang xử lý...' : 'Xác nhận' }}
          </button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeConfirm">Hủy</button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
      <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

type Schedule = {
  id: string | number
  name: string; type: string; date: string; time: string
  location: string; phone: string; status: string
  rawType: string; rawKhachHang: string
}

const router     = useRouter()
const BATCH_SIZE = 10
const loading        = ref(false)
const submitting     = ref(false)
const allLoaded      = ref(false)
const schedules      = ref<Schedule[]>([])
const sentinel       = ref<HTMLElement | null>(null)
const openDropdownId = ref<string | number | null>(null)
let allRawData: any[] = []
let loadedCount = 0

// ── safeJson ──────────────────────────────────────────────
const safeJson = async (res: Response): Promise<any | null> => {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return null }
}

// ── Admin ─────────────────────────────────────────────────
const isAdmin = computed(() => {
  const role = getUserField('vai_tro') || getUserField('role')
  if (role) return String(role).trim().toLowerCase() === 'admin'
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try { const p = JSON.parse(raw); return String(p.vai_tro || p.role || '').trim().toLowerCase() === 'admin' }
    catch {}
  }
  return false
})

// ── Edit form ─────────────────────────────────────────────
const editForm = ref({ show: false, ma_show: '', ten_show: '', ngay: '', gio: '', diachi: '', ten_khachhang: '', sdt: '', ma_loai_show: '' })
const gioError = ref(false)

const validateGio = () => {
  const val = editForm.value.gio.trim()
  if (!val) { gioError.value = false; return }
  gioError.value = !/^\d{2}:\d{2}$/.test(val)
}
const openEditForm = (item: Schedule) => {
  gioError.value = false
  editForm.value = { show: true, ma_show: String(item.id), ten_show: item.name, ngay: item.date, gio: item.time, diachi: item.location, ten_khachhang: item.rawKhachHang, sdt: item.phone, ma_loai_show: item.rawType }
}
const closeEditForm = () => { if (submitting.value) return; gioError.value = false; editForm.value.show = false }

const submitEditForm = async () => {
  if (!editForm.value.ma_show) return
  const gioVal = editForm.value.gio.trim()
  if (gioVal && !/^\d{2}:\d{2}$/.test(gioVal)) { gioError.value = true; showToast('Giờ diễn phải đúng dạng HH:MM', 'error'); return }
  gioError.value = false
  submitting.value = true
  try {
    // API_ENDPOINTS.UPDATE_SHOW trả string URL → fetch GET
    const url = API_ENDPOINTS.UPDATE_SHOW({
      ma_show: editForm.value.ma_show, ten_show: editForm.value.ten_show,
      ngay: editForm.value.ngay, gio: gioVal, diachi: editForm.value.diachi,
      ten_khachhang: editForm.value.ten_khachhang, sdt: editForm.value.sdt,
      ma_loai_show: editForm.value.ma_loai_show,
    })
    const res = await safeJson(await fetch(url))
    if (!res)                                        { showToast('Server lỗi không xác định!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { showToast('Cập nhật show thành công!'); editForm.value.show = false; await reloadData() }
    else                                              { showToast(res.message || 'Cập nhật thất bại!', 'error') }
  } catch (e) { console.error(e); showToast('Lỗi kết nối máy chủ!', 'error') }
  finally     { submitting.value = false }
}

// ── Confirm ───────────────────────────────────────────────
const confirmModal = ref<{ show: boolean; message: string; type: 'status' | 'delete'; target: Schedule | null; newStatus: string }>
  ({ show: false, message: '', type: 'status', target: null, newStatus: '' })

const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const toggleDropdown = (id: string | number) => { openDropdownId.value = openDropdownId.value === id ? null : id }
const closeDropdown  = () => { openDropdownId.value = null }
const changeStatus   = (item: Schedule, newStatus: string) => { closeDropdown(); confirmModal.value = { show: true, message: `Đổi "${item.name}" → "${newStatus}"?`, type: 'status', target: item, newStatus } }
const deleteShow     = (item: Schedule) => { closeDropdown(); confirmModal.value = { show: true, message: `Xóa show "${item.name}"? Không thể hoàn tác!`, type: 'delete', target: item, newStatus: '' } }
const closeConfirm   = () => { if (submitting.value) return; confirmModal.value.show = false }

const confirmAction = async () => {
  const { type, target, newStatus } = confirmModal.value
  if (!target) return
  submitting.value = true
  try {
    if (type === 'delete') {
      // trả string URL → fetch GET
      const url = API_ENDPOINTS.DELETE_SHOW(String(target.id))
      const res = await safeJson(await fetch(url))
      if (!res)                                        { showToast('Server lỗi không xác định!', 'error'); return }
      if (res.code === 200 || res.status === 'success') { showToast(`Đã xóa show "${target.name}"`, 'error'); confirmModal.value.show = false; await reloadData() }
      else                                              { showToast(res.message || 'Xóa thất bại!', 'error') }
    } else {
      const url = API_ENDPOINTS.UPDATE_TRANG_THAI_SHOW(String(target.id), newStatus)
      const res = await safeJson(await fetch(url))
      if (!res)                                        { showToast('Server lỗi không xác định!', 'error'); return }
      if (res.code === 200 || res.status === 'success') { showToast(`Đã đổi trạng thái thành "${newStatus}"`); confirmModal.value.show = false; await reloadData() }
      else                                              { showToast(res.message || 'Cập nhật thất bại!', 'error') }
    }
  } catch (e) { console.error(e); showToast('Lỗi kết nối máy chủ!', 'error') }
  finally     { submitting.value = false }
}

// ── Fetch & batch ─────────────────────────────────────────
const mapItem = (item: any, idx: number): Schedule => ({
  id: item.ma_show || item.id || `UNKNOWN_${idx + 1}`,
  name: item.ten_show || 'Chưa có tên',
  type: item.ma_loai_show || item.loai_show || item.ten_loai_show || 'Show diễn',
  date: item.ngay || '', time: item.gio || '',
  location: item.diachi || item.dia_chi || '',
  phone: item.sdt || '', status: item.trang_thai || 'Chưa diễn',
  rawType: item.ma_loai_show || item.loai_show || item.ten_loai_show || '',
  rawKhachHang: item.ten_khachhang || '',
})

const loadNextBatch = () => {
  if (loading.value || allLoaded.value) return
  const slice = allRawData.slice(loadedCount, loadedCount + BATCH_SIZE)
  if (slice.length === 0) { allLoaded.value = true; return }
  schedules.value.push(...slice.map((item, i) => mapItem(item, loadedCount + i)))
  loadedCount += slice.length
  if (loadedCount >= allRawData.length) allLoaded.value = true
}

const reloadData = async () => {
  allRawData = []; loadedCount = 0; allLoaded.value = false; schedules.value = []
  await fetchAllShows()
}

const fetchAllShows = async () => {
  loading.value = true
  try {
    const res    = await fetch(API_ENDPOINTS.GET_SHOW_CHUA_DIEN)
    const result = await safeJson(res)
    if (result && result.status === 'success' && Array.isArray(result.data)) allRawData = result.data
  } catch (e) { console.error('Lỗi tải show:', e) }
  finally { loading.value = false; loadNextBatch() }
}

let observer: IntersectionObserver | null = null
const setupObserver = () => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting && !allLoaded.value && !loading.value) loadNextBatch() },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
}

onMounted(async () => { await fetchAllShows(); setupObserver() })
onUnmounted(() => observer?.disconnect())

const goToDetail       = (id: string | number) => router.push({ name: 'ChiTietShow', params: { id: id || 'default' } })
const goToRegisterShow = (item: Schedule)      => router.push({ name: 'DangKyShow',  params: { id: item.id || 'default' }, query: { showName: item.name } })
</script>

<style scoped>
.schedule-page { min-height: 100vh; background: #f6f1f1; }
.schedule-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.schedule-page__inner    { max-width: 760px; margin: 0 auto; }
.schedule-page__title    { margin: 0; font-size: 22px; font-weight: 800; color: #ffd700; text-align: center; }
.schedule-page__subtitle { margin: 5px 0 0; text-align: center; font-size: 14px; color: rgba(255,255,255,.95); }
.schedule-page__content  { padding: 10px 12px 60px; }
.schedule-status-msg     { text-align: center; padding: 30px 15px; font-weight: 700; color: #8f0000; font-size: 16px; }
.schedule-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }

.schedule-card { background: #fff; border-radius: 14px; padding: 10px 12px; border: 1px solid #ececec; box-shadow: 0 4px 10px rgba(143,0,0,.04); border-left: 5px solid #facc15; }
.schedule-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.schedule-card__name { font-size: 16px; font-weight: 800; color: #8f0000; line-height: 1.2; }
.schedule-card__tag  { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }
.schedule-card__content { display: flex; flex-direction: column; gap: 4px; }
.schedule-card__line    { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.schedule-card__key     { font-size: 13px; font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 10px; }
.schedule-card__value   { font-size: 13px; font-weight: 500; color: #444; }
.schedule-card__actions { margin-top: 6px; display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; align-items: center; }

.btn { border: none; border-radius: 999px; padding: 6px 13px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--blue  { background: #2563eb; } .btn--blue:hover:not(:disabled)  { background: #1d4ed8; }

.dropdown-wrap { position: relative; }
.status-dropdown { position: absolute; bottom: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.14); min-width: 155px; z-index: 100; display: flex; flex-direction: column; gap: 3px; }
.status-option { border: none; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; background: transparent; color: #1e293b; transition: background .12s; }
.status-option:hover          { background: #f1f5f9; }
.status-option--done:hover    { background: #dcfce7; color: #15803d; }
.status-option--pending:hover { background: #fef9c3; color: #a16207; }
.status-option--cancel:hover  { background: #fee2e2; color: #b91c1c; }
.status-option--delete        { color: #dc2626; }
.status-option--delete:hover  { background: #fee2e2; }
.status-divider   { height: 1px; background: #e2e8f0; margin: 3px 0; }
.dropdown-overlay { position: fixed; inset: 0; z-index: 99; }

.sentinel     { max-width: 760px; margin: 16px auto; text-align: center; min-height: 32px; }
.loading-more { font-size: 13px; font-weight: 600; color: #8f0000; }
.all-loaded   { font-size: 12px; font-weight: 600; color: #64748b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }

.edit-box { background: #fff; border-radius: 16px; padding: 18px 16px; width: 100%; max-width: 360px; box-shadow: 0 10px 30px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
.edit-title  { margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.edit-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.edit-field  { display: flex; flex-direction: column; gap: 3px; }
.edit-label  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input  { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; }
.edit-input:focus  { border-color: #2563eb; }
.edit-input--error { border-color: #dc2626 !important; }
.edit-error        { font-size: 11px; font-weight: 600; color: #dc2626; }
.edit-actions      { margin-top: 14px; display: flex; gap: 8px; }
.edit-actions .btn { flex: 1; padding: 9px; font-size: 13px; }

.confirm-box { background: #fff; border-radius: 14px; padding: 16px 14px; max-width: 280px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.18); text-align: center; }
.confirm-msg { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 14px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; }
.confirm-actions .btn { flex: 1; padding: 8px 10px; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 300; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }

@media (max-width: 640px) {
  .schedule-card { padding: 10px; } .schedule-page__title { font-size: 19px; }
  .schedule-card__name { font-size: 15px; } .schedule-card__key, .schedule-card__value { font-size: 12px; }
  .btn { font-size: 11px; padding: 5px 10px; } .status-dropdown { right: 0; } .edit-row { grid-template-columns: 1fr; }
}
</style>