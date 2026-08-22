<template>
  <div class="detail-page">
    <section class="detail-page__header">
      <div class="detail-page__inner">
        <h2 class="detail-page__title">Chi tiết show</h2>
        <p class="detail-page__subtitle">Thông tin show và danh sách nhân sự tham gia</p>
      </div>
    </section>

    <section class="detail-page__content">
      <div v-if="loading" class="state-msg">Đang tải...</div>
      <div v-else-if="!show" class="state-msg state-msg--error">Không tìm thấy thông tin show.</div>

      <template v-else>
        <div class="detail-card">
          <div v-if="!editingDetail" class="detail-info">
            <div class="detail-info__row"><span class="detail-info__label">Mã show:</span><span class="detail-info__value">{{ show.ma_show || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">Tên show:</span><span class="detail-info__value">{{ show.ten_show || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">Loại show:</span><span class="detail-info__value">{{ show.ma_loai_show || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">Ngày:</span><span class="detail-info__value">{{ show.ngay || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">Giờ:</span><span class="detail-info__value">{{ show.gio || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">Địa điểm:</span><span class="detail-info__value">{{ show.diachi || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">Khách hàng:</span><span class="detail-info__value">{{ show.ten_khachhang || '—' }}</span></div>
            <div class="detail-info__row"><span class="detail-info__label">SĐT:</span><span class="detail-info__value">{{ show.sdt || '—' }}</span></div>
            <div class="detail-info__row">
              <span class="detail-info__label">Trạng thái:</span>
              <span class="detail-info__value">
                <span class="status-badge" :class="statusClass(show.trang_thai)">{{ show.trang_thai || '—' }}</span>
                <span v-if="editingLuong" class="status-arrow">
                  → <span class="status-badge status-badge--done">đã diễn</span>
                  <span class="status-pending-note">chưa lưu</span>
                </span>
              </span>
            </div>
          </div>

          <div v-else class="detail-edit-form">
            <div class="detail-edit-row"><span class="detail-info__label">Mã show:</span><span class="detail-info__value">{{ show.ma_show }}</span></div>
            <div class="detail-edit-row"><span class="detail-info__label">Tên show:</span><input class="detail-edit-input" v-model="editDetailForm.ten_show" type="text" /></div>
            <div class="detail-edit-row"><span class="detail-info__label">Loại show:</span><input class="detail-edit-input" v-model="editDetailForm.ma_loai_show" type="text" /></div>
            <div class="detail-edit-row"><span class="detail-info__label">Ngày:</span><input class="detail-edit-input" v-model="editDetailForm.ngay" type="text" placeholder="DD/MM/YYYY" /></div>
            <div class="detail-edit-row">
              <span class="detail-info__label">Giờ:</span>
              <div class="detail-edit-input-wrap">
                <input class="detail-edit-input" :class="{ 'detail-edit-input--error': gioError }"
                  v-model="editDetailForm.gio" type="text" placeholder="HH:MM" maxlength="5" @input="validateGio" />
                <span v-if="gioError" class="detail-edit-error">Phải đúng dạng HH:MM</span>
              </div>
            </div>
            <div class="detail-edit-row"><span class="detail-info__label">Địa điểm:</span><input class="detail-edit-input" v-model="editDetailForm.diachi" type="text" /></div>
            <div class="detail-edit-row"><span class="detail-info__label">Khách hàng:</span><input class="detail-edit-input" v-model="editDetailForm.ten_khachhang" type="text" /></div>
            <div class="detail-edit-row"><span class="detail-info__label">SĐT:</span><input class="detail-edit-input" v-model="editDetailForm.sdt" type="text" /></div>
            <div class="detail-edit-row"><span class="detail-info__label">Trạng thái:</span><span class="status-badge status-badge--done">đã diễn</span></div>
          </div>

          <div v-if="isAdmin" class="detail-actions">
            <template v-if="isDaDien">
              <template v-if="!editingDetail">
                <button class="btn btn--red" type="button" @click="openEditDetail">Cập nhật</button>
              </template>
              <template v-else>
                <button class="btn btn--green" :disabled="submitting || gioError" type="button" @click="submitEditDetail">
                  {{ submitting ? 'Đang lưu...' : '✓ Lưu' }}
                </button>
                <button class="btn btn--gray" :disabled="submitting" type="button" @click="cancelEditDetail">Hủy</button>
              </template>
            </template>
            <div v-if="!editingDetail" class="dropdown-wrap">
              <button class="btn btn--gray" type="button" @click.stop="dropdownOpen = !dropdownOpen">Đổi trạng thái</button>
              <div v-if="dropdownOpen" class="status-dropdown" @click.stop>
                <button v-if="currentStatus !== 'đã diễn'"   class="status-option status-option--done"    type="button" @click="onSelectStatus('đã diễn')">đã diễn</button>
                <button v-if="currentStatus !== 'chưa diễn'" class="status-option status-option--pending" type="button" @click="onSelectStatus('chưa diễn')">chưa diễn</button>
                <button v-if="currentStatus !== 'đã hủy'"    class="status-option status-option--cancel"  type="button" @click="onSelectStatus('đã hủy')">đã hủy</button>
              </div>
            </div>
          </div>
        </div>

        <!-- DANH SÁCH NHÂN SỰ -->
        <div class="staff-card">
          <h3 class="staff-card__title">Danh sách nhân sự tham gia</h3>
          <div v-if="loadingStaff" class="state-msg">Đang tải nhân sự...</div>
          <div v-else-if="staffList.length === 0 && !editingDetail" class="state-msg">Chưa có nhân sự đăng ký.</div>

          <template v-if="!editingLuong && !editingDetail">
            <div class="staff-table">
              <div class="staff-table__header">
                <span>STT</span><span>Tên</span><span>Vai trò</span><span>Mức lương</span><span>Ghi chú</span>
              </div>
              <div v-for="(staff, index) in staffList" :key="index" class="staff-table__row">
                <span>{{ index + 1 }}</span>
                <span>{{ staff.ten_ns || '—' }}</span>
                <span>{{ staff.vai_tro || '—' }}</span>
                <span>{{ staff.luong ? formatDisplay(String(staff.luong)) : '—' }}</span>
                <span>{{ staff.ghi_chu || '—' }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="editingLuong">
            <div class="staff-table">
              <div class="staff-table__header staff-table__header--edit">
                <span>STT</span><span>Tên</span><span>Vai trò</span><span>Mức lương</span><span>Ghi chú</span>
              </div>
              <div v-for="(row, index) in luongForm" :key="index" class="staff-table__row staff-table__row--edit">
                <span class="row-stt">{{ index + 1 }}</span>
                <span class="row-name">{{ row.ten_ns }}</span>
                <span class="row-vaitro">{{ row.vai_tro }}</span>
                <div class="row-luong">
                  <select class="cell-select" v-model="row.selectedOpt" @change="onSelectOpt(row)">
                    <option value="">0</option>
                    <option v-for="opt in luongOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <div v-if="row.selectedOpt === 'khac'" class="custom-luong-wrap">
                    <input class="cell-input" :class="{ 'cell-input--error': row.luongError }"
                      v-model="row.luongRaw" type="text" placeholder="VD: 300.000"
                      @input="onLuongInput(row)" @blur="onLuongBlur(row)" />
                    <span v-if="row.luongError" class="cell-error">{{ row.luongError }}</span>
                  </div>
                </div>
                <input class="cell-input" v-model="row.ghi_chu" type="text" placeholder="Ghi chú" />
              </div>
            </div>
            <div class="luong-save-bar">
              <button class="btn btn--green" :disabled="submitting || hasLuongError" type="button" @click="submitLuongAndStatus">
                {{ submitting ? 'Đang lưu...' : '✓ Lưu & Đổi trạng thái' }}
              </button>
              <button class="btn btn--gray" :disabled="submitting" type="button" @click="cancelEditLuong">Hủy</button>
            </div>
          </template>

          <!-- Chỉnh sửa chi tiết -->
          <template v-else-if="editingDetail">
            <div class="staff-edit-list">
              <div class="staff-edit-header">
                <span>STT</span><span>Tên NS</span><span>Vai trò</span><span>Mức lương</span><span>Ghi chú</span><span></span>
              </div>
              <div
                v-for="(row, index) in editDetailStaff" :key="index"
                class="staff-edit-row" :class="{ 'staff-edit-row--deleted': row.deleted }"
              >
                <span class="row-stt">{{ index + 1 }}</span>

                <template v-if="!row.deleted">
                  <!-- ✅ Tên NS: select + label tên đầy đủ bên dưới -->
                  <div class="ns-select-wrap">
                    <select class="cell-select" v-model="row.ten_ns">
                      <option value="">-- Chọn NS --</option>
                      <option v-for="ns in allNhanSu" :key="ns" :value="ns">{{ ns }}</option>
                    </select>
                    <span v-if="row.ten_ns" class="ns-selected-label">{{ row.ten_ns }}</span>
                  </div>

                  <select class="cell-select" v-model="row.vai_tro">
                    <option value="">-- Vai trò --</option>
                    <option v-for="vt in VAI_TRO_OPTIONS" :key="vt" :value="vt">{{ vt }}</option>
                  </select>

                  <div class="row-luong">
                    <select class="cell-select" v-model="row.selectedOpt" @change="onEditSelectOpt(row)">
                      <option value="">0</option>
                      <option v-for="opt in luongOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                    <div v-if="row.selectedOpt === 'khac'" class="custom-luong-wrap">
                      <input class="cell-input" :class="{ 'cell-input--error': row.luongError }"
                        v-model="row.luongRaw" type="text" placeholder="VD: 300.000"
                        @input="onEditLuongInput(row)" @blur="onEditLuongBlur(row)" />
                      <span v-if="row.luongError" class="cell-error">{{ row.luongError }}</span>
                    </div>
                  </div>

                  <input class="cell-input" v-model="row.ghi_chu" type="text" placeholder="Ghi chú" />
                  <button class="btn-remove" type="button" @click="markDelete(index)" title="Xóa">✕</button>
                </template>

                <template v-else>
                  <span class="deleted-name">{{ row.ten_ns || '(trống)' }}</span>
                  <span class="deleted-badge">Sẽ xóa</span>
                  <span></span><span></span>
                  <button class="btn-undo" type="button" @click="undoDelete(index)" title="Hoàn tác">↩</button>
                </template>
              </div>
            </div>
            <button class="btn-add-ns" type="button" @click="addEditRow">＋ Thêm nhân sự</button>
          </template>
        </div>
      </template>
    </section>

    <div v-if="dropdownOpen" class="dropdown-overlay" @click="dropdownOpen = false" />

    <div v-if="confirmModal.show" class="modal-overlay" @click="!submitting && closeConfirm()">
      <div class="confirm-box" @click.stop>
        <p class="confirm-msg">{{ confirmModal.message }}</p>
        <div class="confirm-actions">
          <button class="btn btn--red"  :disabled="submitting" type="button" @click="confirmAction">{{ submitting ? 'Đang xử lý...' : 'Xác nhận' }}</button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeConfirm">Hủy</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
      <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

const VAI_TRO_OPTIONS = [
  'Lân', 'Trống chính', 'Trống hội', 'Thần tài',
  'Xỏa', 'Lò', 'Rồng đơn', 'Rồng gậy', 'Rồng khúc',
  'Ngộ không', 'Bát giới', 'Ông địa', 'MC', 'Khác',
]

type ShowDetail = {
  ma_show: string; ten_show: string; ma_loai_show: string
  ngay: string; gio: string; diachi: string
  ten_khachhang: string; sdt: string; trang_thai: string
  [key: string]: string
}
type StaffItem = { ten_ns: string; vai_tro: string; luong: string; ghi_chu: string; rowIndex: number }
type LuongRow  = { ten_ns: string; vai_tro: string; selectedOpt: string; luongRaw: string; luong: string; luongError: string; ghi_chu: string }
type EditStaff = { ten_ns: string; vai_tro: string; selectedOpt: string; luongRaw: string; luong: string; luongError: string; ghi_chu: string; isNew: boolean; rowIndex: number; deleted: boolean }

const PRESET_VALUES = [50000, 100000, 150000, 200000, 250000]
const luongOptions  = [
  ...PRESET_VALUES.map(v => ({ value: String(v), label: formatNumber(v) })),
  { value: 'khac', label: 'Khác...' },
]

function formatNumber(n: number): string { return n.toLocaleString('vi-VN') }
function formatDisplay(raw: string): string {
  if (!raw) return '—'
  const n = parseVND(raw)
  return n !== null ? n.toLocaleString('vi-VN') + 'đ' : raw
}
function parseVND(raw: string): number | null {
  const cleaned = String(raw).replace(/[.,\s]/g, '').replace('đ', '').trim()
  if (!cleaned) return null
  const n = parseInt(cleaned, 10)
  return isNaN(n) || n <= 0 ? null : n
}
// ✅ Convert luong về số nguyên trước khi gửi API (không có dấu chấm)
function luongToRaw(luong: string): string {
  if (!luong) return ''
  const n = parseVND(luong)
  return n !== null ? String(n) : ''
}
function guessPreset(luong: string): string {
  if (!luong) return ''
  const n = parseVND(luong)
  if (n === null) return 'khac'
  return PRESET_VALUES.includes(n) ? String(n) : 'khac'
}
function luongFromOpt(opt: string): string {
  if (!opt || opt === 'khac') return ''
  const n = parseInt(opt)
  return isNaN(n) ? '' : formatNumber(n)
}
function mapStaffItem(item: any, idx: number): StaffItem {
  return {
    ten_ns:   String(item.ten_ns  || '').trim(),
    vai_tro:  String(item.vai_tro || '').trim(),
    luong:    item.luong !== undefined && item.luong !== '' ? String(item.luong) : '',
    ghi_chu:  String(item['ghi chu'] ?? item.ghi_chu ?? '').trim(),
    rowIndex: idx,
  }
}

const route           = useRoute()
const loading         = ref(false)
const loadingStaff    = ref(false)
const submitting      = ref(false)
const show            = ref<ShowDetail | null>(null)
const staffList       = ref<StaffItem[]>([])
const allNhanSu       = ref<string[]>([])
const dropdownOpen    = ref(false)
const editingLuong    = ref(false)
const editingDetail   = ref(false)
const luongForm       = ref<LuongRow[]>([])
const editDetailStaff = ref<EditStaff[]>([])
const confirmModal    = ref({ show: false, message: '', newStatus: '' })
const gioError        = ref(false)
const editDetailForm  = ref({ ten_show: '', ngay: '', gio: '', diachi: '', ten_khachhang: '', sdt: '', ma_loai_show: '' })

const hasLuongError = computed(() => luongForm.value.some(r => !!r.luongError))
const currentStatus = computed(() => (show.value?.trang_thai || '').trim().toLowerCase())
const isDaDien      = computed(() => currentStatus.value === 'đã diễn')

const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

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

const apiFetch = async (url: string): Promise<any | null> => {
  try {
    const res  = await fetch(url, { redirect: 'follow' })
    const text = await res.text()
    try { return JSON.parse(text) } catch { return null }
  } catch { return null }
}

const statusClass = (status: string) => {
  const s = (status || '').trim().toLowerCase()
  if (s === 'đã diễn')   return 'status-badge--done'
  if (s === 'chưa diễn') return 'status-badge--pending'
  if (s === 'đã hủy')    return 'status-badge--cancel'
  return ''
}

const validateGio = () => {
  const val = editDetailForm.value.gio.trim()
  gioError.value = val ? !/^\d{2}:\d{2}$/.test(val) : false
}

const onSelectOpt = (row: LuongRow) => {
  row.luongError = ''; row.luongRaw = ''
  row.luong = luongFromOpt(row.selectedOpt)
}
const onLuongInput = (row: LuongRow) => {
  row.luongError = ''; row.luong = ''
  if (!row.luongRaw.trim()) return
  const n = parseVND(row.luongRaw)
  if (n === null) { row.luongError = 'Không hợp lệ! VD: 300.000'; return }
  row.luong = formatNumber(n)
}
const onLuongBlur = (row: LuongRow) => {
  if (!row.luongRaw.trim()) return
  const n = parseVND(row.luongRaw)
  if (n === null) { row.luongError = 'Không hợp lệ!'; return }
  row.luongRaw = formatNumber(n); row.luong = formatNumber(n); row.luongError = ''
}
const onEditSelectOpt = (row: EditStaff) => {
  row.luongError = ''; row.luongRaw = ''
  row.luong = luongFromOpt(row.selectedOpt)
}
const onEditLuongInput = (row: EditStaff) => {
  row.luongError = ''; row.luong = ''
  if (!row.luongRaw.trim()) return
  const n = parseVND(row.luongRaw)
  if (n === null) { row.luongError = 'Không hợp lệ! VD: 300.000'; return }
  row.luong = formatNumber(n)
}
const onEditLuongBlur = (row: EditStaff) => {
  if (!row.luongRaw.trim()) return
  const n = parseVND(row.luongRaw)
  if (n === null) { row.luongError = 'Không hợp lệ!'; return }
  row.luongRaw = formatNumber(n); row.luong = formatNumber(n); row.luongError = ''
}

const fetchAllNhanSu = async () => {
  try {
    const res = await apiFetch(API_ENDPOINTS.GET_ALL_NHAN_SU)
    if (res && (res.code === 200 || res.status === 'success') && Array.isArray(res.data)) {
      allNhanSu.value = res.data
        .map((ns: any) => String(ns.ten_ns || ns.name || '').trim())
        .filter(Boolean).sort()
    }
  } catch {}
}

const addEditRow = () => {
  editDetailStaff.value.push({
    ten_ns: '', vai_tro: '', selectedOpt: '', luongRaw: '',
    luong: '', luongError: '', ghi_chu: '',
    isNew: true, rowIndex: -1, deleted: false,
  })
}
const markDelete  = (idx: number) => {
  const row = editDetailStaff.value[idx]
  if (row.isNew) { editDetailStaff.value.splice(idx, 1) }
  else           { row.deleted = true }
}
const undoDelete  = (idx: number) => { editDetailStaff.value[idx].deleted = false }

const openEditDetail = async () => {
  if (!show.value) return
  gioError.value = false
  editDetailForm.value = {
    ten_show: show.value.ten_show || '', ngay: show.value.ngay || '',
    gio: show.value.gio || '', diachi: show.value.diachi || '',
    ten_khachhang: show.value.ten_khachhang || '',
    sdt: show.value.sdt || '', ma_loai_show: show.value.ma_loai_show || '',
  }
  editDetailStaff.value = staffList.value.map(s => {
    const opt = guessPreset(s.luong)
    const n   = parseVND(s.luong)
    return {
      ten_ns: s.ten_ns, vai_tro: s.vai_tro,
      selectedOpt: opt,
      luongRaw: opt === 'khac' ? (n ? formatNumber(n) : s.luong) : '',
      luong: n ? formatNumber(n) : s.luong,
      luongError: '', ghi_chu: s.ghi_chu || '',
      isNew: false, rowIndex: s.rowIndex, deleted: false,
    }
  })
  if (allNhanSu.value.length === 0) await fetchAllNhanSu()
  editingDetail.value = true
}
const cancelEditDetail = () => { if (submitting.value) return; editingDetail.value = false }

const submitEditDetail = async () => {
  if (!show.value) return
  validateGio()
  if (gioError.value) return
  for (const row of editDetailStaff.value) {
    if (!row.deleted && row.selectedOpt === 'khac') {
      const n = parseVND(row.luongRaw)
      if (row.luongRaw.trim() && n === null) { row.luongError = 'Không hợp lệ!'; return }
    }
  }

  submitting.value = true
  const ngay = editDetailForm.value.ngay || show.value.ngay || ''
  let thang = '', nam = ''
  if (ngay.includes('/')) {
    const parts = ngay.split('/')
    if (parts.length === 3) { thang = parts[1]; nam = parts[2] }
  }

  try {
    // 1. Cập nhật thông tin show
    await apiFetch(API_ENDPOINTS.UPDATE_SHOW({
      ma_show: show.value.ma_show,
      ten_show: editDetailForm.value.ten_show, ngay: editDetailForm.value.ngay,
      gio: editDetailForm.value.gio, diachi: editDetailForm.value.diachi,
      ten_khachhang: editDetailForm.value.ten_khachhang,
      sdt: editDetailForm.value.sdt, ma_loai_show: editDetailForm.value.ma_loai_show,
    }))

    // 2. Xóa các dòng deleted — từ rowIndex lớn → nhỏ tránh lệch index
    const deletedRows = editDetailStaff.value
      .filter(r => r.deleted && !r.isNew && r.rowIndex >= 0)
      .sort((a, b) => b.rowIndex - a.rowIndex)
    for (const row of deletedRows) {
      await apiFetch(API_ENDPOINTS.XOA_NHAN_SU_KHOI_SHOW(show.value.ma_show, row.rowIndex))
    }

    // 3. Reload staffList để lấy rowIndex mới sau khi xóa
    if (deletedRows.length > 0) await fetchStaff(show.value.ma_show)

    // 4. Cập nhật dòng cũ + thêm dòng mới
    const activeRows = editDetailStaff.value.filter(r => !r.deleted)
    for (const row of activeRows) {
      if (row.isNew) {
        if (!row.ten_ns.trim()) continue
        await apiFetch(API_ENDPOINTS.THEM_NHAN_SU_VAO_SHOW({
          ma_show:  show.value.ma_show,
          ten_show: editDetailForm.value.ten_show || show.value.ten_show,
          ngay, ten_ns: row.ten_ns, vai_tro: row.vai_tro,
          luong: luongToRaw(row.luong),  // ✅ gửi số nguyên
          ghi_chu: row.ghi_chu, thang, nam,
        }))
      } else {
        await apiFetch(API_ENDPOINTS.CAPNHAT_CHAMCONG_THEO_INDEX({
          ma_show:   show.value.ma_show,
          row_index: row.rowIndex,
          ten_ns:    row.ten_ns,
          vai_tro:   row.vai_tro,
          luong:     luongToRaw(row.luong),  // ✅ gửi số nguyên
          ghi_chu:   row.ghi_chu,
        }))
      }
    }

    showToast('Cập nhật thành công!')
    editingDetail.value = false
    await fetchShow(show.value.ma_show)
    await fetchStaff(show.value.ma_show)
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally  { submitting.value = false }
}

const onSelectStatus = (status: string) => {
  dropdownOpen.value = false
  if (status === 'đã diễn') {
    luongForm.value = staffList.value.map(s => ({
      ten_ns: s.ten_ns, vai_tro: s.vai_tro,
      selectedOpt: '', luongRaw: '',
      luong: '', ghi_chu: s.ghi_chu || '', luongError: '',
    }))
    editingLuong.value = true
  } else {
    confirmModal.value = { show: true, message: `Đổi trạng thái → "${status}"?`, newStatus: status }
  }
}
const cancelEditLuong = () => { editingLuong.value = false }
const closeConfirm    = () => { if (submitting.value) return; confirmModal.value.show = false }

const submitLuongAndStatus = async () => {
  if (!show.value) return
  for (const row of luongForm.value) {
    if (row.selectedOpt === 'khac') {
      const n = parseVND(row.luongRaw)
      if (row.luongRaw.trim() && n === null) { row.luongError = 'Không hợp lệ!'; return }
    }
  }
  submitting.value = true
  const ngay = show.value.ngay || ''
  let thang = '', nam = ''
  if (ngay.includes('/')) {
    const parts = ngay.split('/')
    if (parts.length === 3) { thang = parts[1]; nam = parts[2] }
  }
  try {
    await Promise.all(
      luongForm.value.filter(r => r.ten_ns).map(row =>
        apiFetch(API_ENDPOINTS.CAPNHAT_LUONG_GHICHU_CHAMCONG({
          ma_show: show.value!.ma_show, ten_ns: row.ten_ns,
          luong: luongToRaw(row.luong),  // ✅ gửi số nguyên
          ghi_chu: row.ghi_chu, thang, nam,
        }))
      )
    )
    const res = await apiFetch(API_ENDPOINTS.UPDATE_TRANG_THAI_SHOW(show.value.ma_show, 'đã diễn'))
    if (!res || (res.code !== 200 && res.status !== 'success')) {
      showToast(res?.message || 'Đổi trạng thái thất bại!', 'error'); return
    }
    show.value.trang_thai = 'đã diễn'
    editingLuong.value = false
    showToast('Đã lưu lương và đổi trạng thái thành công!')
    await fetchStaff(show.value.ma_show)
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally  { submitting.value = false }
}

const confirmAction = async () => {
  if (!show.value) return
  submitting.value = true
  try {
    const res = await apiFetch(API_ENDPOINTS.UPDATE_TRANG_THAI_SHOW(show.value.ma_show, confirmModal.value.newStatus))
    if (!res) { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') {
      show.value.trang_thai = confirmModal.value.newStatus
      showToast(`Đã đổi trạng thái thành "${confirmModal.value.newStatus}"`)
      confirmModal.value.show = false
    } else { showToast(res.message || 'Cập nhật thất bại!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally  { submitting.value = false }
}

const fetchShow = async (maShow: string) => {
  loading.value = true
  try {
    const res = await apiFetch(API_ENDPOINTS.GET_DETAIL_SHOW_BY_MA_SHOW(maShow))
    if (!res) { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { show.value = res.data }
    else { showToast(res.message || 'Không tìm thấy show!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally  { loading.value = false }
}

const fetchStaff = async (maShow: string) => {
  loadingStaff.value = true
  try {
    const res = await apiFetch(API_ENDPOINTS.GET_VAI_TRO_BY_MA_SHOW(maShow))
    if (res && (res.code === 200 || res.status === 'success') && Array.isArray(res.data)) {
      staffList.value = res.data.map((item: any, idx: number) => mapStaffItem(item, idx))
    }
  } catch {}
  finally { loadingStaff.value = false }
}

onMounted(async () => {
  const maShow = String(route.params.id || '').trim()
  if (!maShow || maShow === 'default') { showToast('Không tìm thấy mã show!', 'error'); return }
  await fetchShow(maShow)
  await fetchStaff(maShow)
})
</script>

<style scoped>
.detail-page { min-height: 100vh; background: #f6f1f1; }
.detail-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.detail-page__inner    { max-width: 760px; margin: 0 auto; }
.detail-page__title    { margin: 0; text-align: center; font-size: 20px; font-weight: 800; color: #ffd700; }
.detail-page__subtitle { margin: 4px 0 0; text-align: center; font-size: 13px; color: rgba(255,255,255,.95); }
.detail-page__content  { max-width: 760px; margin: 0 auto; padding: 12px 12px 60px; }

.state-msg        { text-align: center; padding: 30px; font-weight: 700; color: #8f0000; font-size: 15px; }
.state-msg--error { color: #dc2626; }

.detail-card, .staff-card { background: #fff; border-radius: 14px; padding: 14px; margin-bottom: 12px; border: 1px solid #ececec; box-shadow: 0 4px 10px rgba(143,0,0,.04); }

.detail-info { display: flex; flex-direction: column; gap: 10px; }
.detail-info__row   { display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
.detail-info__label { min-width: 110px; color: #8f0000; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.detail-info__value { color: #333; font-size: 13px; font-weight: 500; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }

.detail-edit-form { display: flex; flex-direction: column; gap: 8px; }
.detail-edit-row  { display: flex; align-items: flex-start; gap: 8px; }
.detail-edit-input-wrap { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.detail-edit-input { flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 5px 9px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; width: 100%; box-sizing: border-box; }
.detail-edit-input:focus      { border-color: #2563eb; }
.detail-edit-input--error     { border-color: #dc2626 !important; }
.detail-edit-error            { font-size: 11px; font-weight: 600; color: #dc2626; }

.status-badge          { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.status-badge--done    { background: #dcfce7; color: #15803d; }
.status-badge--pending { background: #fffbea; color: #a16207; }
.status-badge--cancel  { background: #fee2e2; color: #b91c1c; }
.status-arrow        { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #64748b; }
.status-pending-note { font-size: 10px; font-weight: 600; color: #f59e0b; background: #fffbea; border-radius: 999px; padding: 1px 6px; border: 1px solid #fcd34d; }

.detail-actions  { margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px; align-items: center; flex-wrap: wrap; }
.dropdown-wrap   { position: relative; }
.status-dropdown { position: absolute; bottom: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.14); min-width: 155px; z-index: 100; display: flex; flex-direction: column; gap: 3px; }
.status-option { border: none; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; background: transparent; color: #1e293b; transition: background .12s; }
.status-option:hover          { background: #f1f5f9; }
.status-option--done:hover    { background: #dcfce7; color: #15803d; }
.status-option--pending:hover { background: #fef9c3; color: #a16207; }
.status-option--cancel:hover  { background: #fee2e2; color: #b91c1c; }
.dropdown-overlay { position: fixed; inset: 0; z-index: 99; }

.staff-card__title { margin: 0 0 10px; font-size: 15px; font-weight: 800; color: #8f0000; }
.staff-table { width: 100%; overflow-x: auto; }
.staff-table__header,
.staff-table__row { display: grid; grid-template-columns: 36px 1.2fr 1fr 1fr 1.1fr; gap: 6px; align-items: center; padding: 8px 6px; }
.staff-table__header { background: #f8eaea; color: #8f0000; font-size: 12px; font-weight: 800; border-radius: 10px; }
.staff-table__row    { border-bottom: 1px solid #f1f1f1; font-size: 13px; color: #333; }
.staff-table__row:last-child { border-bottom: none; }
.staff-table__header--edit,
.staff-table__row--edit { grid-template-columns: 32px 1fr 0.9fr 1.6fr 1.1fr; }
.staff-table__row--edit { align-items: flex-start; padding: 10px 6px; }

/* Staff edit */
.staff-edit-list { display: flex; flex-direction: column; overflow-x: auto; }
.staff-edit-header,
.staff-edit-row { display: grid; grid-template-columns: 24px 1.5fr 1fr 1.3fr 1fr 26px; gap: 5px; align-items: start; padding: 8px 4px; }
.staff-edit-header { background: #f8eaea; color: #8f0000; font-size: 11px; font-weight: 800; border-radius: 10px; margin-bottom: 2px; align-items: center; }
.staff-edit-row    { border-bottom: 1px solid #f1f1f1; padding: 8px 4px; }
.staff-edit-row:last-child { border-bottom: none; }
.staff-edit-row--deleted { background: #fff5f5; opacity: 0.75; }

/* Tên NS select + label */
.ns-select-wrap    { display: flex; flex-direction: column; gap: 2px; }
.ns-selected-label { font-size: 10px; font-weight: 700; color: #8f0000; padding-left: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.deleted-name  { font-size: 11px; color: #94a3b8; text-decoration: line-through; align-self: center; }
.deleted-badge { font-size: 10px; font-weight: 700; color: #dc2626; background: #fee2e2; border-radius: 999px; padding: 2px 7px; white-space: nowrap; align-self: center; }

.row-stt   { font-size: 12px; color: #64748b; text-align: center; padding-top: 6px; }
.row-luong { display: flex; flex-direction: column; gap: 4px; }

.cell-select { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 5px 4px; font-size: 11px; color: #1e293b; background: #fff; outline: none; cursor: pointer; width: 100%; transition: border-color .15s; }
.cell-select:focus { border-color: #8f0000; }
.custom-luong-wrap { display: flex; flex-direction: column; gap: 2px; }
.cell-input { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 5px 6px; font-size: 11px; color: #1e293b; outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s; }
.cell-input:focus    { border-color: #2563eb; }
.cell-input--error   { border-color: #dc2626 !important; }
.cell-error          { font-size: 10px; font-weight: 600; color: #dc2626; }

.btn-remove { border: none; background: #fee2e2; color: #dc2626; border-radius: 6px; width: 24px; height: 24px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; }
.btn-remove:hover { background: #fca5a5; }
.btn-undo   { border: none; background: #e0f2fe; color: #0369a1; border-radius: 6px; width: 24px; height: 24px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.btn-undo:hover { background: #bae6fd; }

.btn-add-ns { margin-top: 10px; width: 100%; border: 1.5px dashed #8f0000; background: #fff8f8; color: #8f0000; border-radius: 10px; padding: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .15s; }
.btn-add-ns:hover { background: #fef2f2; }

.luong-save-bar { margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end; }

.modal-overlay  { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.confirm-box    { background: #fff; border-radius: 14px; padding: 16px 14px; max-width: 280px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.18); text-align: center; }
.confirm-msg    { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 14px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; }
.confirm-actions .btn { flex: 1; padding: 8px 10px; }

.btn { border: none; border-radius: 999px; padding: 6px 13px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 300; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }

@media (max-width: 640px) {
  .detail-info__label { min-width: 90px; font-size: 12px; }
  .detail-info__value { font-size: 12px; }
  .detail-edit-input  { font-size: 12px; }
  .staff-table__header, .staff-table__row { grid-template-columns: 28px 1fr 0.8fr 1.4fr 0.9fr; font-size: 11px; }
  .staff-table__header--edit, .staff-table__row--edit { grid-template-columns: 24px 0.9fr 0.8fr 1.5fr 0.9fr; }
  .staff-edit-header, .staff-edit-row { grid-template-columns: 20px 1.3fr 0.9fr 1.2fr 0.9fr 22px; font-size: 10px; }
  .detail-page__title { font-size: 18px; }
}
</style>