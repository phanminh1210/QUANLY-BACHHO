<template>
  <div v-if="visible" class="popup-backdrop" @click.self="closePopup">
    <div class="popup-card">
      <div class="popup-card__header">
        <h3 class="popup-card__title">Thêm Nhân sự mới</h3>
        <button class="popup-card__close" type="button" @click="closePopup">×</button>
      </div>

      <form class="popup-form" @submit.prevent="submitForm">
        <label class="popup-form__field">
          <span class="popup-form__label">Tên nhân sự <span class="popup-form__required">*</span></span>
          <input v-model.trim="form.name" type="text" class="popup-form__input" :class="{ 'popup-form__input--error': errors.name }" />
          <span v-if="errors.name" class="popup-form__error">{{ errors.name }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Năm sinh <span class="popup-form__required">*</span></span>
          <input v-model.trim="form.birthYear" type="text" inputmode="numeric" maxlength="4" class="popup-form__input" :class="{ 'popup-form__input--error': errors.birthYear }" />
          <span v-if="errors.birthYear" class="popup-form__error">{{ errors.birthYear }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Địa chỉ <span class="popup-form__required">*</span></span>
          <input v-model.trim="form.address" type="text" class="popup-form__input" :class="{ 'popup-form__input--error': errors.address }" />
          <span v-if="errors.address" class="popup-form__error">{{ errors.address }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Số điện thoại</span>
          <input v-model.trim="form.phone" type="tel" class="popup-form__input" :class="{ 'popup-form__input--error': errors.phone }" />
          <span v-if="errors.phone" class="popup-form__error">{{ errors.phone }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Tài khoản</span>
          <input v-model.trim="form.tai_khoan" type="text" class="popup-form__input" />
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Mật khẩu</span>
          <input v-model.trim="form.mat_khau" type="text" class="popup-form__input" />
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Vai trò</span>
          <div class="select-wrap">
            <select v-model="form.vai_tro" class="popup-form__input popup-form__select">
              <option value="" disabled>Chọn vai trò</option>
              <option value="admin">admin</option>
              <option value="nv">nv</option>
            </select>
            <span class="select-arrow">⌄</span>
          </div>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Quyền</span>
          <div class="select-wrap">
            <select v-model="form.quyen" class="popup-form__input popup-form__select" :disabled="isRoleAdmin">
              <option value="" disabled>Chọn quyền</option>
              <option value="xem">xem</option>
              <option value="chỉnh sửa cơ bản">chỉnh sửa cơ bản</option>
              <option value="chỉnh sửa nâng cao">chỉnh sửa nâng cao</option>
            </select>
            <span class="select-arrow">⌄</span>
          </div>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Ghi chú</span>
          <textarea v-model.trim="form.ghi_chu" class="popup-form__input popup-form__textarea" />
        </label>

        <div class="popup-form__actions">
          <button type="button" class="popup-form__btn popup-form__btn--cancel" @click="closePopup" :disabled="isSubmitting">
            Hủy
          </button>
          <button type="submit" class="popup-form__btn popup-form__btn--save" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <transition name="fade-fast">
    <div v-if="topLoading.show" class="top-loading">
      <span class="top-loading__spinner"></span>
      <span>{{ topLoading.message }}</span>
    </div>
  </transition>

  <transition name="fade-fast">
    <div v-if="toast.show" class="toast-success-white">
      {{ toast.message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { API_ENDPOINTS } from '../config/api'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const form = reactive({
  name: '',
  birthYear: '',
  address: '',
  phone: '',
  tai_khoan: '',
  mat_khau: '',
  vai_tro: '',
  quyen: '',
  ghi_chu: '',
})

const errors = reactive({
  name: '',
  birthYear: '',
  address: '',
  phone: '',
})

const isSubmitting = ref(false)
const isRoleAdmin = computed(() => form.vai_tro === 'admin')

const topLoading = reactive({
  show: false,
  message: 'Đang lưu...',
  timer: 0 as unknown as ReturnType<typeof setTimeout>,
})

const toast = reactive({
  show: false,
  message: '',
  timer: 0 as unknown as ReturnType<typeof setTimeout>,
})

watch(
  () => form.vai_tro,
  (v) => {
    if (v === 'admin') form.quyen = ''
  },
)

const showTopLoading = (message = 'Đang lưu...', ms = 1000) => {
  topLoading.message = message
  topLoading.show = true
  if (topLoading.timer) clearTimeout(topLoading.timer)
  topLoading.timer = setTimeout(() => {
    topLoading.show = false
  }, ms)
}

const showSuccessToast = (message = 'Thêm nhân sự thành công', ms = 1800) => {
  toast.message = message
  toast.show = true
  if (toast.timer) clearTimeout(toast.timer)
  toast.timer = setTimeout(() => {
    toast.show = false
  }, ms)
}

const clearErrors = () => {
  errors.name = ''
  errors.birthYear = ''
  errors.address = ''
  errors.phone = ''
}

const resetForm = () => {
  form.name = ''
  form.birthYear = ''
  form.address = ''
  form.phone = ''
  form.tai_khoan = ''
  form.mat_khau = ''
  form.vai_tro = ''
  form.quyen = ''
  form.ghi_chu = ''
  clearErrors()
}

const closePopup = () => {
  if (isSubmitting.value) return
  emit('close')
}

const validateForm = () => {
  clearErrors()

  if (!form.name) errors.name = 'Vui lòng nhập tên nhân sự'

  if (!form.birthYear) {
    errors.birthYear = 'Vui lòng nhập năm sinh'
  } else if (!/^\d{4}$/.test(form.birthYear)) {
    errors.birthYear = 'Năm sinh phải gồm 4 chữ số'
  } else {
    const y = Number(form.birthYear)
    const nowY = new Date().getFullYear()
    if (y < 1900 || y > nowY) errors.birthYear = `Năm sinh phải từ 1900 đến ${nowY}`
  }

  if (!form.address) errors.address = 'Vui lòng nhập địa chỉ'

  if (form.phone && !/^[0-9+\-\s().]{6,20}$/.test(form.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ'
  }

  if (!form.vai_tro) {
    alert('Vui lòng chọn vai trò')
    return false
  }

  if (!isRoleAdmin.value && !form.quyen) {
    alert('Vui lòng chọn quyền')
    return false
  }

  return !errors.name && !errors.birthYear && !errors.address && !errors.phone
}

const submitForm = async () => {
  if (!validateForm() || isSubmitting.value) return
  isSubmitting.value = true
  showTopLoading('Đang lưu...', 1000)

  try {
    const dob = `${form.birthYear}-01-01`

    let url = API_ENDPOINTS.ADD_NHAN_SU({
      ten_ns: form.name,
      dob,
      dia_chi: form.address,
      sdt: form.phone || '',
      ghi_chu: form.ghi_chu || '',
    })

    url += `&tai_khoan=${encodeURIComponent(form.tai_khoan || '')}`
    url += `&mat_khau=${encodeURIComponent(form.mat_khau || '')}`
    url += `&vai_tro=${encodeURIComponent(form.vai_tro || '')}`
    url += `&quyen=${encodeURIComponent(isRoleAdmin.value ? '' : form.quyen || '')}`

    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    const ok = json?.code === 200 || json?.status === 'success'
    if (!ok) throw new Error(json?.message || 'Thêm nhân sự thất bại')

    await new Promise((r) => setTimeout(r, 1000))

    resetForm()
    emit('saved')
    emit('close')
    showSuccessToast('Thêm nhân sự thành công')
  } catch (e: any) {
    alert(e?.message || 'Lưu thất bại')
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.visible, (v) => { if (!v) resetForm() })
</script>

<style scoped>
.popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}

.popup-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
}

.popup-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(180deg, #8f0000 0%, #a50000 100%);
  color: #fff;
}

.popup-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.popup-card__close {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.popup-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 78vh;
  overflow: auto;
}

.popup-form__field {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px;
  align-items: center;
}

.popup-form__label {
  font-size: 13px;
  font-weight: 700;
  color: #8f0000;
  margin: 0;
}

.popup-form__required {
  color: #dc2626;
}

.popup-form__input,
.popup-form__textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  min-height: 42px;
  background: #fff;
}

.popup-form__textarea {
  min-height: 72px;
  resize: vertical;
}

.popup-form__input:focus,
.popup-form__textarea:focus {
  border-color: #8f0000;
}

.popup-form__input--error {
  border-color: #dc2626;
}

.popup-form__error {
  grid-column: 2;
  font-size: 12px;
  color: #dc2626;
  margin-top: -2px;
}

.select-wrap {
  position: relative;
  width: 100%;
}

.popup-form__select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 34px;
  cursor: pointer;
}

.popup-form__select:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  font-size: 16px;
  line-height: 1;
}

.popup-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.popup-form__btn {
  border: none;
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.popup-form__btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.popup-form__btn--cancel {
  background: #eee;
  color: #333;
}

.popup-form__btn--save {
  background: #8f0000;
  color: #fff;
}

.top-loading {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 21000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #111827;
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}

.top-loading__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.toast-success-white {
  position: fixed;
  top: 62px;
  right: 14px;
  z-index: 21000;
  background: #fff;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: all 0.2s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .popup-card {
    max-width: 100%;
  }

  .popup-form__field {
    grid-template-columns: 110px 1fr;
    gap: 6px;
  }

  .popup-form__input,
  .popup-form__textarea {
    font-size: 16px;
    min-height: 44px;
  }
}
</style>