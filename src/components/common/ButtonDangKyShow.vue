<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  showId?: string | number
  text?: string
  customClass?: string
  disabled?: boolean
}>()

const router = useRouter()

const handleClick = (e: MouseEvent) => {
  e.stopPropagation() // Ngăn chặn sự kiện click bị lan ra card cha
  if (props.disabled) return
  
  if (props.showId) {
    router.push({
      name: 'DangKyShow',
      params: { id: String(props.showId) }
    })
  }
}
</script>

<template>
  <button 
    :class="['btn', customClass]" 
    type="button" 
    :disabled="disabled"
    @click="handleClick"
  >
    <span>{{ text || 'Đăng ký' }}</span>
  </button>
</template>

<style scoped>
/* CSS Giao diện nút Xanh lá Fancy */
.btn {
  --fancy-button-gradient-0: #16a34a;   /* Xanh lá tươi */
  --fancy-button-gradient-50: #15803d;  /* Xanh lá đậm */
  --fancy-button-gradient-100: #166534; /* Xanh lá tối */
  --fancy-button-inner-shadow-top: rgba(187, 247, 208, 0.4);
  --fancy-button-inner-shadow-top-lg: rgba(20, 83, 45, 0.2);
  --fancy-button-inner-shadow-bottom: rgba(74, 222, 128, 0.4);
  --fancy-button-shine-top: #dcfce7;    /* Xanh lá rất nhạt */
  --fancy-button-shine-bottom: #86efac; /* Xanh lá sáng */
  
  /* CỐ ĐỊNH KÍCH THƯỚC NÚT */
  width: 70px;
  height: 25px;
  box-sizing: border-box;

  font-weight: 600;
  font-size: 10px; /* Giảm nhẹ font-size để chữ 'Đăng ký show' nằm gọn trong 70px */
  line-height: 12px;
  text-shadow: 0px 0.5px 1px rgba(0, 0, 0, 0.4);
  padding: 0;
  margin: 0;
  appearance: none;
  border: none;
  outline: none;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  z-index: 1;
  border-radius: 10px; /* Điều chỉnh bo góc cho cân đối với chiều cao 20px */
  color: #fff;
  background-image: linear-gradient(
    to bottom,
    var(--fancy-button-gradient-0) 0%,
    var(--fancy-button-gradient-50) 50%,
    var(--fancy-button-gradient-100) 100%
  );
  box-shadow:
    0px 2px 5px rgba(21, 128, 61, 0.3),
    0px 1px 2px rgba(0, 0, 0, 0.15),
    inset 0px 1px 1px var(--fancy-button-inner-shadow-top),
    inset 0px -1px 2px var(--fancy-button-inner-shadow-bottom);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:before,
.btn:after {
  content: "";
  position: absolute;
  border-radius: inherit;
  will-change: transform;
}

.btn:before {
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--fancy-button-shine-top);
  width: 70%;
  height: 3px;
  top: -1px;
  opacity: 0.7;
  filter: blur(3px);
  transition: opacity 0.25s;
}

.btn:after {
  inset: 0;
  background-size: cover;
  z-index: 2;
  opacity: 0.25;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.btn span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  position: relative;
  background-image: linear-gradient(
    to bottom,
    var(--fancy-button-shine-top),
    transparent 4px
  );
  background-position: 0 -3px;
  background-repeat: no-repeat;
  z-index: 1;
  white-space: nowrap;
}

.btn span:before,
.btn span:after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  background-color: var(--fancy-button-shine-bottom);
  transition:
    opacity 0.25s,
    transform 0.25s;
  will-change: transform;
}

.btn span:before {
  width: 70%;
  height: 4px;
  bottom: -2px;
  opacity: 0.8;
  filter: blur(3px);
}

.btn span:after {
  width: 90%;
  height: 1px;
  bottom: 0;
  opacity: 0.95;
  filter: blur(0.5px);
}

.btn:hover:not(:disabled) span:before {
  opacity: 0.9;
  transform: translateX(-50%) scale(1.2);
}

.btn:hover:not(:disabled) span:after {
  opacity: 1;
}
</style>