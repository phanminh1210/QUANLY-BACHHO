<template>
  <div class="fab-wrapper">
    <button class="fab-main" type="button" @click="toggleMenu">
      <span class="fab-main__icon" :class="{ 'fab-main__icon--open': isOpen }">+</span>
    </button>

    <button
      class="fab-option fab-option--show"
      :class="{ 'fab-option--open': isOpen }"
      type="button"
      @click="openShowPopup"
    >
      <span class="fab-option__label">Thêm Show</span>
      <span class="fab-option__icon">🐉</span>
    </button>

    <button
      class="fab-option fab-option--customer"
      :class="{ 'fab-option--open': isOpen }"
      type="button"
      @click="goTo('/them-khach-hang')"
    >
      <span class="fab-option__label">Thêm Khách hàng</span>
      <span class="fab-option__icon">👤</span>
    </button>

    <button
      class="fab-option fab-option--staff"
      :class="{ 'fab-option--open': isOpen }"
      type="button"
      @click="openStaffPopup"
    >
      <span class="fab-option__label">Thêm Nhân sự</span>
      <span class="fab-option__icon">🗡️</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'open-show-popup'): void
  (e: 'open-staff-popup'): void
}>()

const router = useRouter()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const openShowPopup = () => {
  isOpen.value = false
  emit('open-show-popup')
}

const openStaffPopup = () => {
  isOpen.value = false
  emit('open-staff-popup')
}

const goTo = (path: string) => {
  isOpen.value = false
  router.push(path)
}
</script>

<style scoped>
.fab-wrapper {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 190px;
  height: 260px;
  z-index: 9999;
}

.fab-main {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 50%;
  background: #8f0000;
  color: #fff;
  box-shadow: 0 10px 20px rgba(143, 0, 0, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-main__icon {
  font-size: 34px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.fab-main__icon--open {
  transform: rotate(45deg);
}

.fab-option {
  position: absolute;
  right: 0;
  min-width: 150px;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #8f0000;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 14px;
  opacity: 0;
  transform: translateY(10px) scale(0.2);
  transition: all 0.25s ease;
  pointer-events: none;
  cursor: pointer;
  gap: 10px;
}

.fab-option--open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.fab-option__label {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.fab-option__icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f7f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.fab-option--show {
  bottom: 70px;
}

.fab-option--customer {
  bottom: 126px;
}

.fab-option--staff {
  bottom: 182px;
}
</style>