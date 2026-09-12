<template>
  <div class="nhansu-page">
    <!-- TOAST THÔNG BÁO GÓC TRÊN BÊN PHẢI -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast-item"
          :class="'toast-item--' + toast.type"
        >
          <span class="toast-icon">
            {{ toast.type === 'success' ? '✓' : '✕' }}
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- HEADER: SỬ DỤNG COMPONENT CHUNG -->
    <div class="header-wrapper">
      <HeaderQuayLai title="DANH SÁCH NHÂN SỰ" />
      <button class="add-btn" type="button" @click="openAddModal" aria-label="Thêm nhân sự">
        <svg class="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <section class="nhansu-page__content">
      <div v-if="loading" class="state-msg">Đang tải dữ liệu nhân sự...</div>
      <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

      <div v-else-if="staffList.length === 0" class="empty-card">
        Không có dữ liệu nhân sự
      </div>

      <!-- DANH SÁCH NHÂN SỰ -->
      <div v-else class="staff-list">
        <div 
          v-for="item in staffList" 
          :key="item.ma_ns" 
          class="staff-bar"
          :class="isAdminRole(item.vai_tro) ? 'staff-bar--admin' : 'staff-bar--default'"
          @click="onViewDetail(item)"
        >
          <div class="avatar-wrapper">
            <img :src="defaultAvatar" class="avatar-img" alt="Avatar" />
          </div>

          <span class="status-dot"></span>

          <div class="staff-info">
            <span class="staff-name">{{ item.ten_ns || '-' }}</span>
            <!-- Chỉ hiển thị SĐT -->
            <span class="staff-meta" v-if="item.sdt">
              {{ item.sdt }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- POPUP CHI TIẾT NHÂN SỰ -->
    <div v-if="detailVisible" class="popup-backdrop" @click.self="closeDetail">
      <div class="popup-card">
        <div class="popup-card__header">
          <h3 class="popup-card__title">Chi Tiết Nhân Sự</h3>
          <button class="popup-card__close" type="button" @click="closeDetail">×</button>
        </div>

        <div class="popup-card__body" v-if="selectedStaff">
          <div class="detail-row"><span class="detail-key">Mã NS:</span><span class="detail-value">{{ selectedStaff.ma_ns || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Tên nhân sự:</span><span class="detail-value font-bold">{{ selectedStaff.ten_ns || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Năm sinh:</span><span class="detail-value">{{ selectedStaff.nam_sinh || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Địa chỉ:</span><span class="detail-value">{{ selectedStaff.dia_chi || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">SĐT:</span><span class="detail-value">{{ selectedStaff.sdt || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Ghi chú:</span><span class="detail-value">{{ selectedStaff.ghi_chu || '-' }}</span></div>

          <hr class="sep" />

          <div class="detail-row"><span class="detail-key">Tài khoản:</span><span class="detail-value">{{ selectedStaff.tai_khoan || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Mật khẩu:</span><span class="detail-value">{{ selectedStaff.mat_khau || '-' }}</span></div>
          <div class="detail-row">
            <span class="detail-key">Ảnh đại diện:</span>
            <span class="detail-value">
              <img :src="defaultAvatar" class="avatar-preview" alt="Avatar" />
            </span>
          </div>
          <div class="detail-row"><span class="detail-key">Vai trò:</span><span class="detail-value">{{ selectedStaff.vai_tro || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Quyền:</span><span class="detail-value">{{ selectedStaff.quyen || '-' }}</span></div>
        </div>

        <div class="popup-card__actions">
          <button class="action-btn action-btn--edit" type="button" @click="openEditModal(selectedStaff)">
            Sửa
          </button>
          <button class="close-btn" type="button" @click="closeDetail">Đóng</button>
        </div>
      </div>
    </div>

    <!-- POPUP THÊM / CẬP NHẬT NHÂN SỰ -->
    <div v-if="addVisible || editVisible" class="popup-backdrop" @click.self="closeFormModal">
      <div class="popup-card relative-card">

        <!-- OVERLAY LOADING KHOÁ MÀN HÌNH -->
        <div v-if="submitting" class="loading-overlay">
          <div class="spinner"></div>
          <span class="loading-text">{{ isEditMode ? 'Đang cập nhật dữ liệu...' : 'Đang thêm nhân sự mới...' }}</span>
        </div>

        <div class="popup-card__header">
          <h3 class="popup-card__title">{{ isEditMode ? 'Cập Nhật Nhân Sự' : 'Thêm Nhân Sự Mới' }}</h3>
          <button class="popup-card__close" type="button" :disabled="submitting" @click="closeFormModal">×</button>
        </div>

        <form @submit.prevent="handleSubmitForm" class="popup-card__body">
          <fieldset :disabled="submitting" class="form-fieldset">
            <div v-if="isEditMode" class="form-group">
              <label class="form-label">Mã Nhân Sự</label>
              <input v-model="formData.ma_ns" type="text" class="form-input disabled-input" disabled />
            </div>

            <!-- TÊN NHÂN SỰ: Làm mờ và khoá chỉnh sửa khi isEditMode = true -->
            <div class="form-group">
              <label class="form-label">Tên nhân sự <span v-if="!isEditMode" class="req">*</span></label>
              <input 
                v-model="formData.ten_ns" 
                type="text" 
                class="form-input" 
                :class="{ 'disabled-input': isEditMode }"
                :disabled="isEditMode"
                placeholder="Nhập họ tên" 
                required 
              />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Năm sinh <span class="req">*</span></label>
                <input v-model="formData.nam_sinh" type="text" class="form-input" placeholder="VD: 1998" required />
              </div>
              <div class="form-group">
                <label class="form-label">Số điện thoại</label>
                <input v-model="formData.sdt" type="text" class="form-input" placeholder="VD: 0912345678" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Địa chỉ <span class="req">*</span></label>
              <input v-model="formData.dia_chi" type="text" class="form-input" placeholder="Nhập địa chỉ" required />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Tài khoản <span class="req">*</span></label>
                <input v-model="formData.tai_khoan" type="text" class="form-input" placeholder="Tên đăng nhập" required />
              </div>
              <div class="form-group">
                <label class="form-label">Mật khẩu <span class="req">*</span></label>
                <input 
                  v-model="formData.mat_khau" 
                  type="password" 
                  class="form-input" 
                  placeholder="Tối thiểu 6 ký tự" 
                  minlength="6"
                  required 
                />
                <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Vai trò <span class="req">*</span></label>
                <select v-model="formData.vai_tro" class="form-input" @change="handleRoleChange" required>
                  <option value="NV">NV</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Quyền <span class="req">*</span></label>
                <select v-model="formData.quyen" class="form-input" :disabled="formData.vai_tro === 'Admin'" required>
                  <option v-if="formData.vai_tro === 'Admin'" value="ALL">Toàn quyền (ALL)</option>
                  <template v-else>
                    <option value="XEM">Chỉ xem</option>
                    <option value="XEM_SUA">Xem và sửa</option>
                  </template>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Ghi chú</label>
              <textarea v-model="formData.ghi_chu" class="form-input form-textarea" rows="2" placeholder="Ghi chú thêm..."></textarea>
            </div>
          </fieldset>

          <div class="popup-card__actions">
            <button class="action-btn action-btn--submit" type="submit" :disabled="submitting">
              {{ submitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới') }}
            </button>
            <button class="close-btn" type="button" :disabled="submitting" @click="closeFormModal">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { API_ENDPOINTS } from '../config/api'
import defaultAvatar from '../assets/lan.webp'
import HeaderQuayLai from '../components/common/HeaderQuayLai.vue'

type StaffItem = {
  ma_ns: string
  ten_ns: string
  nam_sinh: string | number
  dia_chi: string
  sdt: string
  tai_khoan: string
  mat_khau: string
  anh_dai_dien: string
  vai_tro: string
  quyen: string
  ghi_chu: string
}

type ToastItem = {
  id: number
  message: string
  type: 'success' | 'error'
}

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const passwordError = ref('')
const staffList = ref<StaffItem[]>([])

const detailVisible = ref(false)
const selectedStaff = ref<StaffItem | null>(null)

const addVisible = ref(false)
const editVisible = ref(false)
const isEditMode = ref(false)

const toasts = ref<ToastItem[]>([])
let toastIdCounter = 0

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const id = ++toastIdCounter
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 3500)
}

// Kiểm tra xem nhân sự có phải Admin hay không
const isAdminRole = (role?: string) => {
  if (!role) return false
  return role.trim().toUpperCase().includes('ADMIN')
}

const formData = reactive({
  ma_ns: '',
  ten_ns: '',
  nam_sinh: '',
  dia_chi: '',
  sdt: '',
  tai_khoan: '',
  mat_khau: '',
  vai_tro: 'NV',
  quyen: 'XEM',
  ghi_chu: ''
})

const handleRoleChange = () => {
  if (formData.vai_tro === 'Admin') {
    formData.quyen = 'ALL'
  } else if (formData.quyen === 'ALL') {
    formData.quyen = 'XEM'
  }
}

const resetForm = () => {
  formData.ma_ns = ''
  formData.ten_ns = ''
  formData.nam_sinh = ''
  formData.dia_chi = ''
  formData.sdt = ''
  formData.tai_khoan = ''
  formData.mat_khau = ''
  formData.vai_tro = 'NV'
  formData.quyen = 'XEM'
  formData.ghi_chu = ''
  passwordError.value = ''
}

const safeFetch = async (url: string) => {
  const res = await fetch(url, { method: 'GET', redirect: 'follow' })
  const textData = await res.text()
  
  try {
    return JSON.parse(textData)
  } catch (e) {
    if (textData.includes('Google') || textData.includes('Redirecting')) {
      return { code: 200, status: 'success' }
    }
    throw new Error('Không thể phân tích dữ liệu phản hồi từ máy chủ')
  }
}

const fetchStaff = async () => {
  loading.value = true
  error.value = ''
  try {
    const json = await safeFetch(API_ENDPOINTS.GET_ALL_NHAN_SU)
    const ok = json?.code === 200 || json?.status === 'success'
    if (!ok) throw new Error(json?.message || 'Không lấy được danh sách nhân sự')

    staffList.value = Array.isArray(json?.data) ? json.data : []
  } catch (e: any) {
    error.value = e?.message || 'Lỗi tải danh sách nhân sự'
    staffList.value = []
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  resetForm()
  isEditMode.value = false
  addVisible.value = true
}

const openEditModal = (item: StaffItem | null) => {
  if (!item) return
  passwordError.value = ''
  isEditMode.value = true

  formData.ma_ns = String(item.ma_ns || '').trim()
  formData.ten_ns = String(item.ten_ns || '').trim()
  formData.nam_sinh = String(item.nam_sinh || '').trim()
  formData.dia_chi = String(item.dia_chi || '').trim()
  formData.sdt = String(item.sdt || '').trim()
  formData.tai_khoan = String(item.tai_khoan || '').trim()
  formData.mat_khau = String(item.mat_khau || '').trim()
  formData.ghi_chu = String(item.ghi_chu || '').trim()

  const rawRole = String(item.vai_tro || '').trim().toUpperCase()
  if (rawRole.includes('ADMIN')) {
    formData.vai_tro = 'Admin'
  } else {
    formData.vai_tro = 'NV'
  }

  const rawQuyen = String(item.quyen || '').trim().toUpperCase()
  if (formData.vai_tro === 'Admin') {
    formData.quyen = 'ALL'
  } else {
    if (rawQuyen.includes('SUA') || rawQuyen.includes('EDIT') || rawQuyen === 'XEM_SUA') {
      formData.quyen = 'XEM_SUA'
    } else {
      formData.quyen = 'XEM'
    }
  }

  detailVisible.value = false
  editVisible.value = true
}

const closeFormModal = () => {
  if (submitting.value) return
  addVisible.value = false
  editVisible.value = false
}

const handleSubmitForm = async () => {
  passwordError.value = ''

  if (!formData.tai_khoan || !formData.tai_khoan.trim()) {
    showToast('Vui lòng nhập tài khoản', 'error')
    return
  }

  if (!formData.mat_khau || formData.mat_khau.trim().length < 6) {
    passwordError.value = 'Mật khẩu phải từ 6 ký tự trở lên'
    showToast('Mật khẩu quá ngắn', 'error')
    return
  }

  submitting.value = true
  try {
    const payload = {
      ma_ns: String(formData.ma_ns || '').trim(),
      ten_ns: String(formData.ten_ns || '').trim(),
      nam_sinh: String(formData.nam_sinh || '').trim(),
      dia_chi: String(formData.dia_chi || '').trim(),
      sdt: String(formData.sdt || '').trim(),
      tai_khoan: String(formData.tai_khoan || '').trim(),
      mat_khau: String(formData.mat_khau || '').trim(),
      vai_tro: String(formData.vai_tro || 'NV').trim(),
      quyen: String(formData.quyen || 'XEM').trim(),
      ghi_chu: String(formData.ghi_chu || '').trim()
    }

    const url = isEditMode.value
      ? API_ENDPOINTS.CAP_NHAT_NHAN_SU_ADMIN(payload as any)
      : API_ENDPOINTS.THEM_NHAN_SU(payload as any)

    const json = await safeFetch(url)

    const isEmptyObject = json && typeof json === 'object' && Object.keys(json).length === 0
    const isSuccess = isEmptyObject || json?.code === 200 || json?.status === 'success' || json?.result === 'success'

    if (isSuccess) {
      showToast(isEditMode.value ? 'Cập nhật nhân sự thành công!' : 'Thêm nhân sự mới thành công!', 'success')
      closeFormModal()
      closeDetail()
      await fetchStaff()
    } else {
      throw new Error(json?.message || (isEditMode.value ? 'Cập nhật thất bại' : 'Thêm mới thất bại'))
    }
  } catch (e: any) {
    showToast(e?.message || 'Có lỗi xảy ra khi xử lý', 'error')
  } finally {
    submitting.value = false
  }
}

const onViewDetail = (item: StaffItem) => {
  selectedStaff.value = item
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
  selectedStaff.value = null
}

onMounted(fetchStaff)
</script>

<style scoped>
.nhansu-page { min-height: 100vh; background: #ffffff; padding-bottom: 30px; position: relative; }

/* WRAPPER BỌC HEADER VÀ NÚT THÊM MỚI */
.header-wrapper {
  position: relative;
  max-width: 760px;
  margin: 0 auto;
}

.add-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  z-index: 11;
}

.add-btn:hover { background-color: #f1f5f9; }

.add-icon {
  width: 22px;
  height: 22px;
  stroke: #8f0000;
  flex-shrink: 0;
}

.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.toast-item--success { background-color: #10b981; }
.toast-item--error { background-color: #ef4444; }

.toast-icon { font-size: 15px; font-weight: 900; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(50px); }
.toast-leave-to { opacity: 0; transform: translateY(-20px); }

.nhansu-page__content { max-width: 600px; margin: 0 auto; padding: 12px; }

.state-msg { text-align: center; font-size: 13px; padding: 20px; color: #8f0000; font-weight: 700; }
.state-msg--error { color: #dc2626; }
.empty-card { text-align: center; padding: 20px; color: #666; font-style: italic; }

.staff-list { display: flex; flex-direction: column; gap: 14px; }

/* BASE BAR STYLES */
.staff-bar {
  display: flex;
  align-items: center;
  border-radius: 0 50px 50px 0;
  padding: 6px 16px 6px 8px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.staff-bar:hover { transform: translateX(4px); }

/* MÀU VÀNG ĐỒNG CHO ADMIN */
.staff-bar--admin {
  background: linear-gradient(180deg, #ffe359 0%, #eab308 50%, #ca8a04 100%);
  box-shadow: 0 4px 10px rgba(180, 83, 9, 0.25);
}

.staff-bar--admin .staff-name { color: #450a0a; }
.staff-bar--admin .staff-meta { color: #78350f; font-weight: 600; }

/* MÀU XÁM TRẮNG CHO NHÂN VIÊN THƯỜNG */
.staff-bar--default {
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.staff-bar--default .staff-name { color: #1e293b; }
.staff-bar--default .staff-meta { color: #64748b; font-weight: 500; }

.avatar-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ffffff;
  flex-shrink: 0;
  background: #fff;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.status-dot {
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border-radius: 50%;
  border: 2px solid #ffffff;
  margin-left: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}

.staff-info { display: flex; flex-direction: column; overflow: hidden; }

.staff-name {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.staff-meta { font-size: 12px; }

.popup-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.popup-card {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.relative-card { position: relative; }

.popup-card__header {
  background: #8f0000;
  color: #ffffff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-card__title { font-size: 16px; font-weight: 700; margin: 0; }

.popup-card__close {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}

.popup-card__body {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row { display: flex; justify-content: space-between; font-size: 13px; }
.detail-key { color: #666; font-weight: 500; }
.detail-value { color: #111; font-weight: 600; text-align: right; }
.font-bold { font-weight: 700; color: #8f0000; }

.avatar-preview { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.sep { border: none; border-top: 1px dashed #e2e8f0; margin: 4px 0; }

.form-fieldset { border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.form-label { font-size: 12px; font-weight: 600; color: #334155; }
.req { color: #dc2626; }

.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus { border-color: #8f0000; }
.disabled-input { background-color: #f1f5f9; color: #64748b; cursor: not-allowed; }
.form-textarea { resize: vertical; }

.field-error { font-size: 11px; color: #ef4444; font-weight: 500; }

.popup-card__actions {
  padding: 12px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn, .close-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.action-btn--edit { background: #8f0000; color: #ffffff; }
.action-btn--submit { background: #8f0000; color: #ffffff; }
.close-btn { background: #94a3b8; color: #ffffff; }

.action-btn:disabled, .close-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  gap: 10px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8f0000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text { font-size: 13px; font-weight: 600; color: #8f0000; }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>