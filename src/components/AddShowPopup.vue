<template>
  <div v-if="visible" class="popup-backdrop" @click.self="closePopup">
    <div class="popup-card">
      <div class="popup-card__header">
        <h3 class="popup-card__title">Thêm Show</h3>
        <button class="popup-card__close" type="button" @click="closePopup">×</button>
      </div>

      <form class="popup-form" @submit.prevent="submitForm">
        <label class="popup-form__field">
          <span class="popup-form__label">
            Tên show <span class="popup-form__required">*</span>
          </span>
          <input
            v-model.trim="form.name"
            type="text"
            class="popup-form__input"
            :class="{ 'popup-form__input--error': errors.name }"
            placeholder="Nhập tên show"
          />
          <span v-if="errors.name" class="popup-form__error">{{ errors.name }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Loại show</span>
          <select v-model="form.type" class="popup-form__input">
            <option value="">-- Chọn loại show --</option>
            <option value="Khai trương">Khai trương</option>
            <option value="Động thổ">Động thổ</option>
            <option value="Khánh thành">Khánh thành</option>
            <option value="Lễ Hội">Lễ Hội</option>
            <option value="Trung thu">Trung thu</option>
            <option value="Đám cưới">Đám cưới</option>
            <option value="Mừng thọ">Mừng thọ</option>
            <option value="Xông đất">Xông đất</option>
            <option value="Sinh nhật">Sinh nhật</option>
            <option value="Khác">Khác</option>
          </select>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">
            Ngày <span class="popup-form__required">*</span>
          </span>
          <input
            v-model="form.date"
            type="date"
            class="popup-form__input popup-form__input--date"
            :class="{ 'popup-form__input--error': errors.date }"
          />
          <span v-if="errors.date" class="popup-form__error">{{ errors.date }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Giờ</span>
          <input
            v-model.trim="form.time"
            type="text"
            class="popup-form__input"
            placeholder="VD: 19:30"
          />
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Tên khách hàng</span>
          <input
            v-model.trim="form.customerName"
            type="text"
            class="popup-form__input"
            placeholder="Nhập tên khách hàng"
          />
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">
            Địa chỉ <span class="popup-form__required">*</span>
          </span>
          <input
            v-model.trim="form.location"
            type="text"
            class="popup-form__input"
            :class="{ 'popup-form__input--error': errors.location }"
            placeholder="Nhập địa chỉ"
          />
          <span v-if="errors.location" class="popup-form__error">{{ errors.location }}</span>
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">SĐT</span>
          <input
            v-model.trim="form.phone"
            type="tel"
            class="popup-form__input"
            placeholder="Nhập số điện thoại"
          />
        </label>

        <label class="popup-form__field">
          <span class="popup-form__label">Giá</span>
          <input
            v-model.trim="form.price"
            type="text"
            class="popup-form__input"
            placeholder="Nhập giá"
          />
        </label>

        <div class="popup-form__actions">
          <button type="button" class="popup-form__btn popup-form__btn--cancel" @click="closePopup">
            Hủy
          </button>
          <button type="submit" class="popup-form__btn popup-form__btn--save">
            Lưu
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: {
    name: string
    type: string
    date: string
    time: string
    customerName: string
    location: string
    phone: string
    price: string
  }): void
}>()

const form = reactive({
  name: '',
  type: '',
  date: '',
  time: '',
  customerName: '',
  location: '',
  phone: '',
  price: '',
})

const errors = reactive({
  name: '',
  date: '',
  location: '',
})

const clearErrors = () => {
  errors.name = ''
  errors.date = ''
  errors.location = ''
}

const resetForm = () => {
  form.name = ''
  form.type = ''
  form.date = ''
  form.time = ''
  form.customerName = ''
  form.location = ''
  form.phone = ''
  form.price = ''
  clearErrors()
}

const closePopup = () => {
  emit('close')
}

const validateForm = () => {
  clearErrors()

  if (!form.name) errors.name = 'Vui lòng nhập tên show'
  if (!form.date) errors.date = 'Vui lòng chọn ngày'
  if (!form.location) errors.location = 'Vui lòng nhập địa chỉ'

  return !errors.name && !errors.date && !errors.location
}

const submitForm = () => {
  if (!validateForm()) return

  emit('submit', {
    name: form.name,
    type: form.type,
    date: form.date,
    time: form.time,
    customerName: form.customerName,
    location: form.location,
    phone: form.phone,
    price: form.price,
  })

  resetForm()
  emit('close')
}

watch(
  () => props.visible,
  (val) => {
    if (!val) resetForm()
  }
)
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
  max-width: 420px;
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
  gap: 12px;
}

.popup-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.popup-form__label {
  font-size: 13px;
  font-weight: 700;
  color: #8f0000;
}

.popup-form__required {
  color: #dc2626;
}

.popup-form__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
  min-height: 42px;
}

.popup-form__input--date {
  min-width: 0;
  -webkit-appearance: auto;
  appearance: auto;
}

.popup-form__input:focus {
  border-color: #8f0000;
}

.popup-form__input--error {
  border-color: #dc2626;
}

.popup-form__error {
  font-size: 12px;
  color: #dc2626;
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

.popup-form__btn--cancel {
  background: #eee;
  color: #333;
}

.popup-form__btn--save {
  background: #8f0000;
  color: #fff;
}

@media (max-width: 640px) {
  .popup-card {
    max-width: 100%;
  }

  .popup-form__input {
    font-size: 16px;
    min-height: 44px;
  }
}
</style>