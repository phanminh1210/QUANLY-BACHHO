<script setup lang="ts">
const props = defineProps<{
  text?: string
  customClass?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => {
  e.stopPropagation() // Ngăn sự kiện click lan ra card cha nếu có
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <button 
    :class="['btn', customClass, { 'btn--disabled': disabled }]" 
    type="button" 
    :disabled="disabled"
    @click="handleClick"
  >
    <span>{{ text || 'Đổi trạng thái' }}</span>
  </button>
</template>

<style scoped>
/* CSS Giao diện nút Xám Fancy */
.btn {
  --fancy-button-gradient-0: #64748b;   /* Xám vừa */
  --fancy-button-gradient-50: #475569;  /* Xám đậm */
  --fancy-button-gradient-100: #334155; /* Xám tối */
  --fancy-button-inner-shadow-top: rgba(241, 245, 249, 0.3);
  --fancy-button-inner-shadow-top-lg: rgba(30, 41, 59, 0.2);
  --fancy-button-inner-shadow-bottom: rgba(148, 163, 184, 0.4);
  --fancy-button-shine-top: #f8fafc;    /* Vạch sáng trên */
  --fancy-button-shine-bottom: #cbd5e1; /* Vạch sáng dưới */
  
  /* CỐ ĐỊNH KÍCH THƯỚC NÚT */
  width: 100px;
  height: 25px;
  box-sizing: border-box;

  font-weight: 600;
  font-size: 11px;
  line-height: 14px;
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
  border-radius: 14px;
  color: #fff;
  background-image: linear-gradient(
    to bottom,
    var(--fancy-button-gradient-0) 0%,
    var(--fancy-button-gradient-50) 50%,
    var(--fancy-button-gradient-100) 100%
  );
  box-shadow:
    0px 2px 6px rgba(71, 85, 105, 0.25),
    0px 1px 3px rgba(0, 0, 0, 0.15),
    inset 0px 1px 1px var(--fancy-button-inner-shadow-top),
    inset 0px -1px 2px var(--fancy-button-inner-shadow-bottom);
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
  height: 4px;
  top: -2px;
  opacity: 0.7;
  filter: blur(4px);
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
    transparent 5px
  );
  background-position: 0 -4px;
  background-repeat: no-repeat;
  z-index: 1;
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
  height: 6px;
  bottom: -3px;
  opacity: 0.8;
  filter: blur(4px);
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

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>