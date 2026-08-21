<template>
  <div class="register-show-page">
    <!-- TOAST -->
    <div v-if="successToast.show" class="success-toast">
      <span>✓</span> {{ successToast.message }}
    </div>

    <header class="register-show-page__header">
      <div class="register-show-page__inner">
        <h2 class="register-show-page__title">Đăng Ký Tham Gia Show</h2>
      </div>
    </header>

    <main class="register-show-page__content">
      <div v-if="loading" class="status-msg">Đang tải thông tin show...</div>
      <div v-else-if="errorMessage" class="status-msg status-msg--error">{{ errorMessage }}</div>

      <div v-else class="show-layout">
        <!-- THÔNG TIN CHI TIẾT SHOW -->
        <section v-if="showDetail" class="card show-detail-card">
          <div class="card__header">
            <h3 class="card__title">{{ showDetail.ten_show || 'Show không tên' }}</h3>
            <span class="info-row__tag">{{ showDetail.trang_thai || 'Chưa diễn' }}</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-item__label">Loại show</span>
              <span class="info-item__value text-red">{{ showDetail.ma_loai_show || showDetail.loai_show || '' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Khách hàng</span>
              <span class="info-item__value text-red">{{ showDetail.ten_khachhang || '' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Ngày diễn</span>
              <span class="info-item__value text-red">{{ showDetail.ngay || showDetail.ngay_dien || '' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Giờ diễn</span>
              <span class="info-item__value text-red">{{ showDetail.gio || showDetail.gio_dien || '' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Địa điểm</span>
              <span class="info-item__value text-red">{{ showDetail.diachi || 'Chưa cập nhật' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">SĐT</span>
              <span class="info-item__value text-red">{{ showDetail.sdt || '' }}</span>
            </div>
          </div>
        </section>

        <!-- DANH SÁCH VAI TRÒ -->
        <section class="card role-card">
          <div class="card__header">
            <h3 class="card__title">Danh Sách Vai Trò</h3>
          </div>

          <div v-if="roles.length === 0" class="status-msg status-msg--empty">
            Show này chưa phân bổ vai trò.
          </div>

          <div v-else class="role-list">
            <div
              v-for="(role, index) in roles"
              :key="index"
              class="role-item"
              :class="{
                'role-item--selected': selectedRoleIndex === index,
                'role-item--dimmed': isCanceling && !isMyRole(role),
                'role-item--disabled': !isCanceling && isRoleTaken(role)
              }"
              @click="handleRoleClick(index, role)"
            >
              <div class="role-item__left">
                <span class="role-name">{{ getRoleDisplayName(role) }}</span>
                <span v-if="role.luong" class="role-salary">{{ role.luong }}</span>
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
                    <span class="assignee-name">{{ role.ten_ns }}</span>
                  </template>
                </template>

                <!-- CHẾ ĐỘ BÌNH THƯỜNG -->
                <template v-else>
                  <template v-if="isRoleTaken(role)">
                    <span class="assignee-name" :class="{ 'assignee-name--me': isMyRole(role) }">
                      {{ role.ten_ns }}{{ isMyRole(role) ? ' (Bạn)' : '' }}
                    </span>
                  </template>
                  <template v-else>
                    <input
                      type="checkbox"
                      class="role-checkbox"
                      :checked="selectedRoleIndex === index"
                      @click.stop
                      @change="handleSelectRole(index)"
                    />
                  </template>
                </template>
              </div>
            </div>
          </div>

          <div class="action-footer">
            <!-- Nút Đăng ký -->
            <button
              v-if="!isCanceling && selectedRoleIndex !== null"
              type="button"
              class="submit-btn"
              :disabled="submitting"
              @click="submitRegistration"
            >
              {{ submitting ? 'Đang gửi...' : 'Đăng Ký Tham Gia' }}
            </button>

            <!-- Nút Hủy Đăng Ký: chỉ hiện khi có vai trò của mình VÀ còn trong thời hạn hủy -->
            <button
              v-if="!isCanceling && hasMyRole && canCancelRegistration"
              type="button"
              class="cancel-btn"
              :disabled="submitting"
              @click="startCancelProcess"
            >
              Hủy Đăng Ký
            </button>

            <!-- Thông báo hết hạn hủy (đã đăng ký nhưng quá 24h) -->
            <p v-if="!isCanceling && hasMyRole && !canCancelRegistration" class="cancel-expired-note">
              ⛔ Đã qua thời hạn hủy đăng ký (trước show 24h)
            </p>

            <!-- Nhóm nút trong chế độ hủy -->
            <template v-if="isCanceling">
              <button
                type="button"
                class="confirm-cancel-btn"
                :disabled="submitting || !hasUncheckedRoles"
                @click="confirmCancelSelection"
              >
                {{ submitting ? 'Đang xử lý...' : 'Xác Nhận Hủy' }}
              </button>
              <button
                type="button"
                class="exit-cancel-btn"
                :disabled="submitting"
                @click="exitCancelProcess"
              >
                Quay Lại
              </button>
            </template>
          </div>
        </section>
      </div>
    </main>

    <!-- MODAL -->
    <div v-if="customModal.show" class="custom-modal-overlay" @click="closeModal">
      <div class="custom-modal-box" @click.stop>
        <div class="custom-modal-icon">⚠️</div>
        <p class="custom-modal-message">{{ customModal.message }}</p>
        <button type="button" class="custom-modal-btn" @click="closeModal">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

interface ShowDetail {
  ma_show?: string
  ten_show?: string
  ngay?: string
  ngay_dien?: string
  gio?: string
  gio_dien?: string
  diachi?: string
  ten_khachhang?: string
  sdt?: string
  ma_loai_show?: string
  loai_show?: string
  trang_thai?: string
  [key: string]: any
}

interface RoleItem {
  ma_show?: string
  ten_show?: string
  ten_ns?: string
  vai_tro?: string
  vai_tro_ten?: string
  ten_vai_tro?: string
  luong?: string
  [key: string]: any
}

const route = useRoute()
const maShow = computed(() => String(route.params.id || route.query.ma_show || ''))

const loading    = ref<boolean>(false)
const submitting = ref<boolean>(false)
const errorMessage = ref<string>('')

const showDetail = ref<ShowDetail | null>(null)
const roles      = ref<RoleItem[]>([])
const selectedRoleIndex = ref<number | null>(null)

const isCanceling      = ref<boolean>(false)
const cancelCheckboxes = ref<Record<number, boolean>>({})

const getRoleDisplayName = (role: RoleItem): string =>
  role.vai_tro || role.vai_tro_ten || role.ten_vai_tro || ''

const currentUserName = computed(() => {
  let tenNS = getUserField('ten_ns')
  if (!tenNS) {
    const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
    if (raw) {
      try {
        const p = JSON.parse(raw)
        tenNS = p.ten_ns || p.ten_nhansu || p.username || p.name || ''
      } catch {}
    }
  }
  return (tenNS || '').toString().trim()
})

// ✅ Chỉ true khi danh sách roles CÓ ít nhất 1 dòng mang tên mình
const hasMyRole = computed(() =>
  !!currentUserName.value && roles.value.some((r) => isMyRole(r))
)

const hasUncheckedRoles = computed(() =>
  roles.value.some((role, idx) => isMyRole(role) && cancelCheckboxes.value[idx] === false)
)

// ✅ Cho phép hủy nếu: có tên mình trong danh sách VÀ còn trước show > 24h
const canCancelRegistration = computed(() => {
  if (!showDetail.value || !hasMyRole.value) return false

  const dateStr = showDetail.value.ngay || showDetail.value.ngay_dien || ''
  const timeStr = showDetail.value.gio  || showDetail.value.gio_dien  || '00:00'
  if (!dateStr) return false

  let formattedDate = dateStr
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
  }

  const showDateTime = new Date(`${formattedDate}T${timeStr}`)
  if (isNaN(showDateTime.getTime())) return false

  return (showDateTime.getTime() - Date.now()) / 3_600_000 > 24
})

const customModal   = ref({ show: false, message: '' })
const successToast  = ref({ show: false, message: '' })

const showErrorModal  = (msg: string) => { customModal.value = { show: true, message: msg } }
const closeModal      = () => { customModal.value.show = false }
const showSuccessToast = (msg: string) => {
  successToast.value = { show: true, message: msg }
  setTimeout(() => { successToast.value.show = false }, 3000)
}

const isRoleTaken = (role: RoleItem) => Boolean(role.ten_ns && role.ten_ns.trim())
const isMyRole    = (role: RoleItem) => {
  if (!role.ten_ns || !currentUserName.value) return false
  return role.ten_ns.trim().toLowerCase() === currentUserName.value.toLowerCase()
}

const startCancelProcess = () => {
  isCanceling.value = true
  selectedRoleIndex.value = null
  const init: Record<number, boolean> = {}
  roles.value.forEach((role, idx) => { if (isMyRole(role)) init[idx] = true })
  cancelCheckboxes.value = init
}

const toggleCancelCheckbox = (index: number) => {
  cancelCheckboxes.value[index] = !cancelCheckboxes.value[index]
}

const exitCancelProcess = () => {
  isCanceling.value = false
  cancelCheckboxes.value = {}
}

const handleRoleClick = (index: number, role: RoleItem) => {
  if (isCanceling.value) {
    if (isMyRole(role)) toggleCancelCheckbox(index)
    return
  }
  if (isRoleTaken(role)) return
  handleSelectRole(index)
}

const handleSelectRole = (index: number) => {
  selectedRoleIndex.value = selectedRoleIndex.value === index ? null : index
}

const confirmCancelSelection = async () => {
  const currentName   = currentUserName.value.trim()
  const currentMaShow = maShow.value.trim()

  if (!currentName)   { showErrorModal('Không xác định được tên tài khoản! Vui lòng đăng nhập lại.'); return }
  if (!currentMaShow) { showErrorModal('Không tìm thấy Mã Show!'); return }

  const rolesToCancel = roles.value.filter(
    (role, idx) => isMyRole(role) && cancelCheckboxes.value[idx] === false
  )
  if (rolesToCancel.length === 0) {
    showErrorModal('Vui lòng bỏ chọn ít nhất 1 vị trí bạn muốn hủy!')
    return
  }

  submitting.value = true
  let successCount = 0

  try {
    for (const role of rolesToCancel) {
      const roleName = getRoleDisplayName(role)
      const url = API_ENDPOINTS.HUY_DANG_KY_SHOW(currentMaShow, roleName, currentName)
      const res = await fetch(url).then((r) => r.json())

      if (res.status === 'success' || res.code === 200) {
        successCount++
      } else {
        throw new Error(res.message || `Không thể hủy vị trí ${roleName}`)
      }
    }

    if (successCount > 0) {
      showSuccessToast(`Đã hủy đăng ký thành công ${successCount} vị trí!`)
      isCanceling.value = false
      cancelCheckboxes.value = {}
      await fetchData()
    }
  } catch (err: any) {
    showErrorModal(err.message || 'Lỗi kết nối máy chủ!')
  } finally {
    submitting.value = false
  }
}

const fetchData = async () => {
  if (!maShow.value) { errorMessage.value = 'Mã show không hợp lệ.'; return }

  loading.value = true
  errorMessage.value = ''

  try {
    const [resDetail, resRoles] = await Promise.all([
      fetch(API_ENDPOINTS.GET_DETAIL_SHOW_BY_MA_SHOW(maShow.value)).then((r) => r.json()),
      fetch(API_ENDPOINTS.GET_VAI_TRO_BY_MA_SHOW(maShow.value)).then((r) => r.json()),
    ])

    showDetail.value = (resDetail.status === 'success' || resDetail.code === 200)
      ? resDetail.data
      : null
    if (!showDetail.value) errorMessage.value = resDetail.message || 'Không tìm thấy chi tiết show.'

    roles.value = (resRoles.status === 'success' || resRoles.code === 200) && Array.isArray(resRoles.data)
      ? resRoles.data
      : []
  } catch {
    errorMessage.value = 'Lỗi kết nối máy chủ.'
  } finally {
    loading.value = false
  }
}

const submitRegistration = async () => {
  if (selectedRoleIndex.value === null) { showErrorModal('Vui lòng chọn 1 vị trí!'); return }
  if (!currentUserName.value) { showErrorModal('Không tìm thấy tên nhân sự. Vui lòng đăng nhập lại!'); return }

  submitting.value = true
  try {
    const selectedRole = roles.value[selectedRoleIndex.value]
    const roleName = getRoleDisplayName(selectedRole)
    const res = await fetch(API_ENDPOINTS.DANG_KY_SHOW(maShow.value, roleName, currentUserName.value)).then((r) => r.json())

    if (res.status === 'success' || res.code === 200) {
      showSuccessToast('Đăng ký tham gia show thành công!')
      selectedRoleIndex.value = null
      await fetchData()
    } else {
      showErrorModal(res.message || 'Đăng ký thất bại!')
    }
  } catch {
    showErrorModal('Không thể kết nối đến máy chủ!')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────── */
.register-show-page { min-height: 100vh; background: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
.register-show-page__header { background: linear-gradient(135deg, #8f0000 0%, #b91c1c 100%); padding: 10px 16px; }
.register-show-page__inner  { max-width: 960px; margin: 0 auto; }
.register-show-page__title  { margin: 0; font-size: 16px; font-weight: 700; color: #fef08a; text-align: center; }
.register-show-page__content { max-width: 960px; margin: 0 auto; padding: 10px; }

.show-layout { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 640px) { .show-layout { grid-template-columns: 1fr 1fr; align-items: start; } }

/* ── Card ────────────────────────────────────────────────── */
.card { background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }
.card__title  { margin: 0; font-size: 14px; font-weight: 700; color: #8f0000; }

/* ── Info grid ───────────────────────────────────────────── */
.info-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 10px; }
.info-item  { display: flex; flex-direction: column; gap: 1px; }
.info-item__label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }
.info-item__value { font-size: 12px; font-weight: 600; word-break: break-word; }
.text-red   { color: #b91c1c; }
.info-row__tag { font-size: 10px; font-weight: 700; color: #854d0e; background: #fef9c3; padding: 2px 6px; border-radius: 4px; }

/* ── Role list ───────────────────────────────────────────── */
.role-list { display: flex; flex-direction: column; gap: 5px; }
.role-item  {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; background: #f8fafc;
  border: 1.5px solid #e2e8f0; border-radius: 7px;
  cursor: pointer; transition: all .15s ease;
}
.role-item--selected { border-color: #16a34a; background: #f0fdf4; }
.role-item--disabled { opacity: .7; background: #f8fafc !important; border-color: #e2e8f0 !important; cursor: not-allowed !important; }
.role-item--dimmed   { opacity: .3 !important; pointer-events: none !important; filter: grayscale(100%); }

.role-item__left  { display: flex; align-items: center; gap: 6px; }
.role-item__right { display: flex; align-items: center; }
.role-name   { font-size: 13px; font-weight: 600; color: #0f172a; }
.role-salary { font-size: 11px; font-weight: 600; color: #16a34a; }

.assignee-name     { font-size: 11px; font-weight: 600; color: #991b1b; background: #fee2e2; padding: 2px 7px; border-radius: 4px; }
.assignee-name--me { color: #15803d; background: #dcfce7; }

.role-checkbox       { width: 16px; height: 16px; accent-color: #16a34a; cursor: pointer; margin: 0; }
.role-checkbox--cancel { accent-color: #dc2626; }

/* ── Action footer ───────────────────────────────────────── */
.action-footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 6px; }

.submit-btn, .cancel-btn, .confirm-cancel-btn, .exit-cancel-btn {
  border: none; padding: 9px; border-radius: 8px;
  font-size: 13px; font-weight: 700; cursor: pointer; width: 100%;
}
.submit-btn          { background: #16a34a; color: #fff; }
.submit-btn:hover    { background: #15803d; }
.cancel-btn          { background: #dc2626; color: #fff; }
.cancel-btn:hover    { background: #b91c1c; }
.confirm-cancel-btn  { background: #dc2626; color: #fff; }
.confirm-cancel-btn:hover { background: #b91c1c; }
.exit-cancel-btn     { background: #64748b; color: #fff; }
.exit-cancel-btn:hover { background: #475569; }
.submit-btn:disabled, .cancel-btn:disabled,
.confirm-cancel-btn:disabled, .exit-cancel-btn:disabled { background: #94a3b8; cursor: not-allowed; }

/* Thông báo hết hạn hủy */
.cancel-expired-note { margin: 0; font-size: 11px; font-weight: 600; color: #92400e; background: #fef3c7; padding: 6px 10px; border-radius: 6px; text-align: center; }

/* ── Status messages ─────────────────────────────────────── */
.status-msg       { text-align: center; padding: 16px; font-weight: 600; color: #8f0000; font-size: 13px; }
.status-msg--error { color: #dc2626; }
.status-msg--empty { font-size: 12px; color: #64748b; padding: 8px 0; }

/* ── Toast (nhỏ gọn) ─────────────────────────────────────── */
.success-toast {
  position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
  background: #15803d; color: #fff;
  padding: 7px 16px; border-radius: 20px;
  font-size: 12px; font-weight: 700;
  box-shadow: 0 3px 10px rgba(0,0,0,.18);
  z-index: 10000; display: flex; align-items: center; gap: 5px;
  white-space: nowrap;
}

/* ── Modal ───────────────────────────────────────────────── */
.custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
.custom-modal-box     { background: #fff; width: 100%; max-width: 300px; border-radius: 12px; padding: 18px 14px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,.18); border-top: 4px solid #dc2626; }
.custom-modal-icon    { font-size: 22px; margin-bottom: 5px; }
.custom-modal-message { font-size: 13px; font-weight: 700; color: #dc2626; margin: 0 0 14px; line-height: 1.4; word-break: break-word; }
.custom-modal-btn     { background: #dc2626; color: #fff; border: none; width: 100%; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
</style>