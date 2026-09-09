<template>
  <div class="page">

    <transition name="toast">
      <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
        <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
      </div>
    </transition>

    <transition name="fade">
      <div v-if="submitting" class="submitting-overlay">
        <div class="submitting-spinner">
          <span class="spinner"></span>
          <span class="submitting-text">Đang xử lý...</span>
        </div>
      </div>
    </transition>

    <!-- HEADER NỀN TRẮNG -->
    <header class="account-page__header">
      <div class="account-page__inner header-content">
        <button class="back-btn" type="button" @click="goBack" aria-label="Quay lại">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="header-title">Đăng Ký Tham Gia Show</span>
      </div>
    </header>

    <main class="page__content">
      <div v-if="loading" class="state-msg">Đang tải...</div>
      <div v-else-if="errorMessage" class="state-msg state-msg--error">{{ errorMessage }}</div>

      <div v-else class="layout">

        <!-- THÔNG TIN SHOW -->
        <section class="card">
          <div class="card__header">
            <h3 class="card__title">{{ showDetail?.ten_show || '—' }}</h3>
            <span class="tag">{{ showDetail?.trang_thai || '—' }}</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-item__label">Loại show</span>
              <span class="info-item__value">{{ showDetail?.ma_loai_show || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Khách hàng</span>
              <span class="info-item__value">{{ showDetail?.ten_khachhang || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Ngày diễn</span>
              <span class="info-item__value">{{ showDetail?.ngay || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Giờ diễn</span>
              <span class="info-item__value">{{ showDetail?.gio || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Địa điểm</span>
              <span class="info-item__value">{{ showDetail?.diachi || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">SĐT</span>
              <span class="info-item__value">{{ showDetail?.sdt || '—' }}</span>
            </div>
          </div>
        </section>

        <!-- DANH SÁCH VAI TRÒ -->
        <section class="card">
          <div class="card__header">
            <h3 class="card__title">Danh Sách Vai Trò</h3>
            <div class="card__header-actions">

              <!-- Nút đăng ký -->
              <button
                v-if="!isCanceling && selectedRoleIndexes.length > 0"
                type="button" class="btn-inline btn-inline--green"
                :disabled="submitting"
                @click="submitRegistration"
              >
                {{ submitting ? '...' : `Đăng Ký (${selectedRoleIndexes.length})` }}
              </button>

              <!-- Nút hủy đăng ký -->
              <button
                v-if="!isCanceling && hasMyRole && canCancelRegistration"
                type="button" class="btn-inline btn-inline--red"
                :disabled="submitting"
                @click="startCancelProcess"
              >
                Hủy Đăng Ký
              </button>

              <!-- Chế độ hủy -->
              <template v-if="isCanceling">
                <button
                  type="button" class="btn-inline btn-inline--red"
                  :disabled="submitting || !hasUncheckedRoles"
                  @click="confirmCancelSelection"
                >
                  {{ submitting ? '...' : 'Xác Nhận' }}
                </button>
                <button
                  type="button" class="btn-inline btn-inline--gray"
                  :disabled="submitting"
                  @click="exitCancelProcess"
                >
                  Quay Lại
                </button>
              </template>
            </div>
          </div>

          <!-- Quá hạn hủy -->
          <p v-if="!isCanceling && hasMyRole && !canCancelRegistration" class="cancel-expired-note">
            ⛔ Sắp tới giờ diễn không được hủy đăng ký phải báo thầy Tư
          </p>

          <div v-if="roles.length === 0" class="state-msg state-msg--empty">
            Show này chưa phân bổ vai trò.
          </div>

          <div v-else class="role-list">
            <div
              v-for="(role, index) in roles"
              :key="index"
              class="role-item"
              :class="{
                'role-item--selected': selectedRoleIndexes.includes(index),
                'role-item--dimmed':   isCanceling && !isMyRole(role),
                'role-item--disabled': !isCanceling && (isRoleTaken(role) || disabledByVaiTro.has(index)),
              }"
              @click="handleRoleClick(index, role)"
            >
              <div class="role-item__left">
                <span class="role-name">{{ role.vai_tro || '—' }}</span>
                <span v-if="role.luong && role.luong !== '0'" class="role-salary">
                  {{ formatLuong(role.luong) }}
                </span>
              </div>

              <div class="role-item__right">
                <!-- CHẾ ĐỘ HỦY -->
                <template v-if="isCanceling">
                  <template v-if="isMyRole(role)">
                    <input
                      type="checkbox"
                      class="role-checkbox role-checkbox--cancel"
                      :checked="cancelCheckboxes[index] !== false"
                      @click.stop
                      @change="toggleCancelCheckbox(index)"
                    />
                  </template>
                  <template v-else>
                    <span v-if="role.ten_ns" class="assignee-name">{{ role.ten_ns }}</span>
                  </template>
                </template>

                <!-- CHẾ ĐỘ BÌNH THƯỜNG -->
                <template v-else>
                  <template v-if="isRoleTaken(role)">
                    <span class="assignee-name" :class="{ 'assignee-name--me': isMyRole(role) }">
                      {{ role.ten_ns }}{{ isMyRole(role) ? ' (Bạn)' : '' }}
                    </span>
                  </template>
                  <template v-else-if="!disabledByVaiTro.has(index)">
                    <input
                      type="checkbox"
                      class="role-checkbox"
                      :checked="selectedRoleIndexes.includes(index)"
                      @click.stop
                      @change="handleSelectRole(index)"
                    />
                  </template>
                </template>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- MODAL LỖI -->
    <div v-if="modal.show" class="modal-overlay" @click="modal.show = false">
      <div class="modal-box" @click.stop>
        <div class="modal-icon">⚠️</div>
        <p class="modal-message">{{ modal.message }}</p>
        <button type="button" class="btn btn--red" style="width:100%" @click="modal.show = false">Đóng</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

interface ShowDetail {
  ma_show: string; ten_show: string; ngay: string; gio: string
  diachi: string; ten_khachhang: string; sdt: string
  ma_loai_show: string; trang_thai: string
}
interface RoleItem {
  ma_show: string; ten_show: string; ten_ns: string
  vai_tro: string; luong: string; ghi_chu: string; rowIndex: number
}

const route  = useRoute()
const router = useRouter()
const maShow = computed(() => String(route.params.id || route.query.ma_show || '').trim())

const loading      = ref(false)
const submitting   = ref(false)
const errorMessage = ref('')
const showDetail   = ref<ShowDetail | null>(null)
const roles        = ref<RoleItem[]>([])

const selectedRoleIndexes = ref<number[]>([])
const isCanceling         = ref(false)
const cancelCheckboxes    = ref<Record<number, boolean>>({})

// ── NAVIGATION ──
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// ── TOAST ──
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// ── MODAL ──
const modal = ref({ show: false, message: '' })
const showModal = (msg: string) => { modal.value = { show: true, message: msg } }

// ── USER ──
const currentUserName = computed(() => {
  let name = getUserField('ten_ns')
  if (!name) {
    const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
    if (raw) {
      try {
        const p = JSON.parse(raw)
        name = p.ten_ns || p.ten_nhansu || p.username || p.name || ''
      } catch {}
    }
  }
  return (name || '').toString().trim()
})

// ── HELPERS ──
const clean = (v: any): string =>
  (v !== undefined && v !== null && String(v) !== 'undefined' && String(v) !== 'null')
    ? String(v).trim() : ''

const formatLuong = (raw: string): string => {
  const n = parseInt(raw.replace(/[.,\s]/g, '').replace(/đ/gi, '').trim(), 10)
  return (!isNaN(n) && n > 0) ? n.toLocaleString('vi-VN') + 'đ' : raw
}

const isRoleTaken = (role: RoleItem) => Boolean(role.ten_ns && role.ten_ns.trim())
const isMyRole    = (role: RoleItem) => {
  if (!role.ten_ns || !currentUserName.value) return false
  return role.ten_ns.trim().toLowerCase() === currentUserName.value.toLowerCase()
}

const hasMyRole = computed(() =>
  !!currentUserName.value && roles.value.some(r => isMyRole(r))
)
const hasUncheckedRoles = computed(() =>
  roles.value.some((r, idx) => isMyRole(r) && cancelCheckboxes.value[idx] === false)
)

const selectedVaiTro = computed(() =>
  new Set(selectedRoleIndexes.value.map(i => roles.value[i]?.vai_tro).filter(Boolean))
)

const disabledByVaiTro = computed(() =>
  new Set(
    roles.value
      .map((r, i) => ({ i, r }))
      .filter(({ i, r }) => {
        if (selectedRoleIndexes.value.includes(i)) return false
        if (selectedVaiTro.value.has(r.vai_tro)) return true
        if (isMyRole(r)) return true
        const myVaiTroTaken = roles.value.some(
          other => other.vai_tro === r.vai_tro && isMyRole(other)
        )
        if (myVaiTroTaken) return true
        return false
      })
      .map(({ i }) => i)
  )
)

const canCancelRegistration = computed(() => {
  if (!showDetail.value || !hasMyRole.value) return false
  const dateStr = showDetail.value.ngay || ''
  const timeStr = showDetail.value.gio  || '00:00'
  if (!dateStr) return false
  let iso = dateStr
  if (dateStr.includes('/')) {
    const p = dateStr.split('/')
    if (p.length === 3) iso = `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
  }
  const dt = new Date(`${iso}T${timeStr}`)
  if (isNaN(dt.getTime())) return false
  return (dt.getTime() - Date.now()) / 3_600_000 > 24
})

// ── FETCH ──
const apiFetch = async (url: string): Promise<any> => {
  try {
    const res  = await fetch(url, { redirect: 'follow' })
    const text = await res.text()
    try { return JSON.parse(text) } catch { return null }
  } catch { return null }
}

const fetchData = async () => {
  if (!maShow.value) { errorMessage.value = 'Mã show không hợp lệ.'; return }
  loading.value = true
  errorMessage.value = ''
  try {
    const [resDetail, resRoles] = await Promise.all([
      apiFetch(API_ENDPOINTS.GET_DETAIL_SHOW_BY_MA_SHOW(maShow.value)),
      apiFetch(API_ENDPOINTS.GET_VAI_TRO_BY_MA_SHOW(maShow.value)),
    ])

    if (resDetail && (resDetail.success === true || resDetail.code === 200 || resDetail.status === 'success')) {
      const d = resDetail.data || {}
      showDetail.value = {
        ma_show:       clean(d.ma_show),
        ten_show:      clean(d.ten_show),
        ngay:          clean(d.ngay),
        gio:           clean(d.gio),
        diachi:        clean(d.diachi),
        ten_khachhang: clean(d.ten_khachhang),
        sdt:           clean(d.sdt),
        ma_loai_show:  clean(d.ma_loai_show),
        trang_thai:    clean(d.trang_thai),
      }
    } else {
      errorMessage.value = resDetail?.message || 'Không tìm thấy chi tiết show.'
    }

    if (resRoles && (resRoles.success === true || resRoles.code === 200 || resRoles.status === 'success') && Array.isArray(resRoles.data)) {
      roles.value = resRoles.data.map((item: any) => ({
        ma_show:  clean(item.ma_show),
        ten_show: clean(item.ten_show),
        ten_ns:   clean(item.ten_ns),
        vai_tro:  clean(item.vai_tro),
        luong:    clean(item.luong),
        ghi_chu:  clean(item.ghi_chu),
        rowIndex: Number(item.rowIndex ?? 0),
      }))
    } else {
      roles.value = []
    }
  } catch {
    errorMessage.value = 'Lỗi kết nối máy chủ.'
  } finally {
    loading.value = false
  }
}

// ── CHỌN VAI TRÒ ──
const handleSelectRole = (index: number) => {
  const existing = selectedRoleIndexes.value.indexOf(index)
  if (existing !== -1) {
    selectedRoleIndexes.value.splice(existing, 1)
  } else {
    selectedRoleIndexes.value.push(index)
  }
}
const handleRoleClick = (index: number, role: RoleItem) => {
  if (isCanceling.value) { if (isMyRole(role)) toggleCancelCheckbox(index); return }
  if (isRoleTaken(role)) return
  if (disabledByVaiTro.value.has(index)) return
  handleSelectRole(index)
}

// ── ĐĂNG KÝ ──
const submitRegistration = async () => {
  if (selectedRoleIndexes.value.length === 0) { showModal('Vui lòng chọn ít nhất 1 vị trí!'); return }
  if (!currentUserName.value) { showModal('Không tìm thấy tên nhân sự. Vui lòng đăng nhập lại!'); return }
  submitting.value = true
  try {
    for (const idx of selectedRoleIndexes.value) {
      const role = roles.value[idx]
      const res  = await apiFetch(API_ENDPOINTS.DANG_KY_SHOW(maShow.value, role.vai_tro, currentUserName.value))
      if (!res || !(res.status === 'success' || res.code === 200 || res.success === true)) {
        showModal(res?.message || `Đăng ký "${role.vai_tro}" thất bại!`)
        return
      }
    }
    showToast(`Đăng ký thành công ${selectedRoleIndexes.value.length} vị trí!`)
    selectedRoleIndexes.value = []
    await fetchData()
  } catch {
    showModal('Không thể kết nối đến máy chủ!')
  } finally {
    submitting.value = false
  }
}

// ── HỦY ĐĂNG KÝ ──
const startCancelProcess = () => {
  isCanceling.value = true
  selectedRoleIndexes.value = []
  const init: Record<number, boolean> = {}
  roles.value.forEach((r, idx) => { if (isMyRole(r)) init[idx] = true })
  cancelCheckboxes.value = init
}
const toggleCancelCheckbox = (index: number) => {
  cancelCheckboxes.value[index] = !cancelCheckboxes.value[index]
}
const exitCancelProcess = () => {
  isCanceling.value = false
  cancelCheckboxes.value = {}
}
const confirmCancelSelection = async () => {
  if (!currentUserName.value) { showModal('Không xác định được tài khoản!'); return }
  if (!maShow.value)           { showModal('Không tìm thấy Mã Show!'); return }
  const toCancel = roles.value.filter((r, idx) => isMyRole(r) && cancelCheckboxes.value[idx] === false)
  if (toCancel.length === 0) { showModal('Vui lòng bỏ chọn ít nhất 1 vị trí muốn hủy!'); return }
  submitting.value = true
  let count = 0
  try {
    for (const role of toCancel) {
      const res = await apiFetch(API_ENDPOINTS.HUY_DANG_KY_SHOW(maShow.value, role.vai_tro, currentUserName.value))
      if (res && (res.status === 'success' || res.code === 200 || res.success === true)) {
        count++
      } else {
        throw new Error(res?.message || `Không thể hủy vị trí ${role.vai_tro}`)
      }
    }
    if (count > 0) {
      showToast(`Đã hủy thành công ${count} vị trí!`)
      isCanceling.value = false
      cancelCheckboxes.value = {}
      await fetchData()
    }
  } catch (err: any) {
    showModal(err.message || 'Lỗi kết nối máy chủ!')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* Đồng bộ toàn bộ background về màu trắng #ffffff */
.page { 
  min-height: 100vh; 
  background: #ffffff; 
  font-family: system-ui, -apple-system, sans-serif; 
}

/* Header: Nền trắng, nổi nhẹ bằng shadow bên dưới */
.account-page__header {
  background: #ffffff;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 960px;
  margin: 0 auto;
}
.back-btn {
  background: #ffffff;
  border: none;
  color: #8f0000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s, box-shadow 0.2s;
}
.back-btn:hover {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(143, 0, 0, 0.15);
}
.back-icon {
  width: 22px;
  height: 22px;
}
.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #8f0000;
  white-space: nowrap;
}

.page__content { 
  max-width: 960px; 
  margin: 0 auto; 
  padding: 12px; 
}

.layout { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 12px; 
}
@media (min-width: 640px) { 
  .layout { grid-template-columns: 1fr 1fr; align-items: start; } 
}

/* Card: Nền trắng, đổ bóng nổi bật để tách lớp */
.card { 
  background: #ffffff; 
  border-radius: 12px; 
  padding: 14px; 
  border: 1px solid #f1f5f9; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
}
.card__header {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  margin-bottom: 10px; 
  padding-bottom: 8px;
  border-bottom: 1px solid #f8fafc; 
  gap: 6px; 
  flex-wrap: wrap;
}
.card__title { 
  margin: 0; 
  font-size: 14px; 
  font-weight: 700; 
  color: #8f0000; 
  flex-shrink: 0; 
}
.card__header-actions { 
  display: flex; 
  align-items: center; 
  gap: 5px; 
  flex-wrap: wrap; 
  margin-left: auto; 
}

.tag { 
  font-size: 10px; 
  font-weight: 700; 
  color: #854d0e; 
  background: #ffffff; 
  border: 1px solid #fef08a;
  box-shadow: 0 1px 4px rgba(234, 179, 8, 0.12);
  padding: 2px 7px; 
  border-radius: 4px; 
  white-space: nowrap; 
  flex-shrink: 0; 
}

.btn-inline { 
  border: none; 
  padding: 5px 12px; 
  border-radius: 6px; 
  font-size: 11px; 
  font-weight: 700; 
  cursor: pointer; 
  white-space: nowrap; 
  transition: all .15s; 
}

/* NÚT ĐĂNG KÝ: NỀN XANH CÓ ĐIỀU CHỈNH */
.btn-inline--green { 
  background: #16a34a !important; 
  color: #ffffff !important; 
  border: 1px solid #16a34a !important;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.2);
} 
.btn-inline--green:hover { 
  background: #15803d !important; 
  box-shadow: 0 3px 8px rgba(22, 163, 74, 0.3);
}

/* NÚT HỦY ĐĂNG KÝ & XÁC NHẬN: NỀN ĐỎ CÓ ĐIỀU CHỈNH */
.btn-inline--red { 
  background: #dc2626 !important; 
  color: #ffffff !important; 
  border: 1px solid #dc2626 !important;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.2);
} 
.btn-inline--red:hover { 
  background: #b91c1c !important; 
  box-shadow: 0 3px 8px rgba(220, 38, 38, 0.3);
}

.btn-inline--gray { 
  background: #ffffff; 
  color: #64748b; 
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(100, 116, 139, 0.1);
} 
.btn-inline--gray:hover { 
  background: #ffffff; 
  box-shadow: 0 3px 8px rgba(100, 116, 139, 0.18);
}

.btn-inline:disabled { 
  background: #cbd5e1 !important; 
  color: #ffffff !important;
  border-color: #cbd5e1 !important;
  box-shadow: none !important;
  cursor: not-allowed; 
}

.info-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 8px 10px; 
}
.info-item { 
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
}
.info-item__label { 
  font-size: 10px; 
  font-weight: 600; 
  color: #64748b; 
  text-transform: uppercase; 
}
.info-item__value { 
  font-size: 12px; 
  font-weight: 600; 
  color: #b91c1c; 
  word-break: break-word; 
}

.cancel-expired-note { 
  margin: 0 0 10px; 
  font-size: 11px; 
  font-weight: 600; 
  color: #92400e; 
  background: #ffffff; 
  border: 1px solid #fef08a;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.12);
  padding: 6px 10px; 
  border-radius: 6px; 
  text-align: center; 
}

.role-list { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}
/* Role Item: Nền trắng hoàn toàn, phân biệt bằng border & shadow nhẹ */
.role-item {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 8px 12px; 
  background: #ffffff;
  border: 1px solid #e2e8f0; 
  border-radius: 8px;
  cursor: pointer; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  transition: all .15s ease-in-out;
}
.role-item:hover:not(.role-item--disabled):not(.role-item--dimmed) { 
  border-color: #cbd5e1; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07);
}
.role-item--selected { 
  border-color: #16a34a !important; 
  background: #ffffff !important;
  box-shadow: 0 3px 8px rgba(22, 163, 74, 0.15) !important;
}
.role-item--disabled { 
  opacity: .45; 
  cursor: not-allowed !important; 
  pointer-events: none; 
  box-shadow: none;
}
.role-item--dimmed { 
  opacity: .3 !important; 
  pointer-events: none !important; 
  filter: grayscale(100%); 
  box-shadow: none;
}

.role-item__left { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
}
.role-item__right { 
  display: flex; 
  align-items: center; 
  flex-shrink: 0; 
}
.role-name { 
  font-size: 13px; 
  font-weight: 600; 
  color: #0f172a; 
}
.role-salary { 
  font-size: 11px; 
  font-weight: 600; 
  color: #16a34a; 
}

.assignee-name { 
  font-size: 11px; 
  font-weight: 600; 
  color: #dc2626; 
  background: #ffffff; 
  border: 1px solid #fecaca;
  box-shadow: 0 1px 4px rgba(220, 38, 38, 0.12);
  padding: 2px 7px; 
  border-radius: 4px; 
}
.assignee-name--me { 
  color: #16a34a !important; 
  border-color: #bbf7d0 !important;
  box-shadow: 0 1px 4px rgba(22, 163, 74, 0.12) !important;
}
.role-checkbox { 
  width: 16px; 
  height: 16px; 
  accent-color: #16a34a; 
  cursor: pointer; 
  margin: 0; 
}
.role-checkbox--cancel { 
  accent-color: #dc2626; 
}

.state-msg { 
  text-align: center; 
  padding: 20px; 
  font-weight: 600; 
  color: #8f0000; 
  font-size: 13px; 
}
.state-msg--error { 
  color: #dc2626; 
}
.state-msg--empty { 
  font-size: 12px; 
  color: #64748b; 
  padding: 8px 0; 
}

/* Overlay & Modals: Nền trắng nổi bằng shadow sâu hơn */
.submitting-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.2); 
  z-index: 9998; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.submitting-spinner { 
  background: #ffffff; 
  border-radius: 12px; 
  padding: 20px 28px; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12); 
  border: 1px solid #f1f5f9;
}
.spinner { 
  width: 20px; 
  height: 20px; 
  border: 3px solid #f1f5f9; 
  border-top-color: #8f0000; 
  border-radius: 50%; 
  animation: spin .7s linear infinite; 
  flex-shrink: 0; 
}
.submitting-text { 
  font-size: 13px; 
  font-weight: 700; 
  color: #8f0000; 
}
@keyframes spin { to { transform: rotate(360deg); } }

.toast-pill { 
  position: fixed; 
  top: 12px; 
  left: 50%; 
  transform: translateX(-50%); 
  padding: 8px 18px; 
  border-radius: 20px; 
  font-size: 12px; 
  font-weight: 700; 
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12); 
  z-index: 10000; 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  white-space: nowrap; 
}
.toast-pill--success { 
  color: #16a34a; 
  border: 1px solid #bbf7d0;
}
.toast-pill--error { 
  color: #dc2626; 
  border: 1px solid #fecaca;
}
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-6px); }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.3); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 9999; 
  padding: 16px; 
}
.modal-box { 
  background: #ffffff; 
  width: 100%; 
  max-width: 300px; 
  border-radius: 12px; 
  padding: 18px 14px; 
  text-align: center; 
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15); 
  border: 1px solid #f1f5f9;
  border-top: 4px solid #dc2626; 
}
.modal-icon { font-size: 22px; margin-bottom: 5px; }
.modal-message { font-size: 13px; font-weight: 700; color: #dc2626; margin: 0 0 14px; line-height: 1.4; word-break: break-word; }
.btn { border: none; padding: 9px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .15s, box-shadow .15s; }
.btn--red { 
  background: #dc2626; 
  color: #ffffff; 
  border: 1px solid #dc2626;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.2);
} 
.btn--red:hover { 
  background: #b91c1c; 
  box-shadow: 0 3px 8px rgba(220, 38, 38, 0.3);
}
</style>