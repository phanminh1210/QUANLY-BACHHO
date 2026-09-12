<template>
  <Transition name="fade">
    <div v-if="modelValue" class="popup-overlay" @click.self="handleCancel">
      <div class="popup-container">
        <!-- Header / Tiêu đề -->
        <div class="popup-header">
          <h3 class="popup-title">{{ title }}</h3>
        </div>

        <!-- Body / Nội dung thông báo (Nếu có) -->
        <div v-if="message" class="popup-body">
          <p class="popup-message">{{ message }}</p>
        </div>

        <!-- Actions / 2 Nút Xác nhận & Hủy -->
        <div class="popup-actions">
          <button 
            type="button" 
            class="btn btn-cancel" 
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            class="btn btn-confirm" 
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Định nghĩa Props nhận từ Component cha
interface Props {
  modelValue: boolean          // Ẩn/Hiện popup (Dùng v-model)
  title?: string               // Tiêu đề popup (do file cha truyền vào)
  message?: string             // Nội dung chi tiết (không bắt buộc)
  confirmText?: string         // Tên nút xác nhận (Mặc định: "Xác nhận")
  cancelText?: string          // Tên nút hủy (Mặc định: "Hủy")
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Xác nhận hành động',
  message: '',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy'
})

// Định nghĩa Emits để truyền sự kiện ra file cha
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// Xử lý khi nhấn nút Xác nhận
const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false) // Tự động đóng popup
}

// Xử lý khi nhấn nút Hủy
const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false) // Tự động đóng popup
}
</script>

<style scoped>
/* Overlay phủ toàn màn hình */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
}

/* Khung Popup */
.popup-container {
  background: #ffffff;
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

/* Header */
.popup-header {
  text-align: center;
}

.popup-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #8f0000; /* Màu đỏ đô thương hiệu */
}

/* Body */
.popup-body {
  text-align: center;
}

.popup-message {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

/* Footer / Actions */
.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 4px;
}

/* Base Style Cho Nút */
.btn {
  flex: 1;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 6px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

/* Nút Hủy */
.btn-cancel {
  background-color: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.btn-cancel:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

/* Nút Xác nhận */
.btn-confirm {
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  color: #ffffff;
  border: none;
}

.btn-confirm:hover {
  opacity: 0.9;
}

/* Hiệu ứng Fade In / Out */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>