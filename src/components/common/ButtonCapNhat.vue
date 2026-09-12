<script setup lang="ts">
const props = defineProps<{
  customClass?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  if (props.disabled) return
  emit('click', e)
}
</script>

<template>
  <button 
    :class="['btn', customClass]" 
    type="button" 
    :disabled="disabled"
    @click="handleClick"
  >
    <span>Cập nhật</span>
  </button>
</template>

<style scoped>
/* CSS Giao diện nút Vàng Nhạt Fancy */
.btn {
  --fancy-button-gradient-0: #fef08a;   /* Vàng nhạt sáng (Yellow 200) */
  --fancy-button-gradient-50: #eab308;  /* Vàng ấm (Yellow 500) */
  --fancy-button-gradient-100: #ca8a04; /* Vàng đậm/Vàng đồng (Yellow 600) */
  --fancy-button-inner-shadow-top: rgba(254, 240, 138, 0.6);
  --fancy-button-inner-shadow-top-lg: rgba(161, 98, 7, 0.2);
  --fancy-button-inner-shadow-bottom: rgba(234, 179, 8, 0.4);
  --fancy-button-shine-top: #fefce8;    /* Vàng siêu nhạt phớt trắng */
  --fancy-button-shine-bottom: #fef08a; /* Vàng nhạt phản quang */
  
  /* CỐ ĐỊNH KÍCH THƯỚC NÚT */
  width: 70px;
  height: 25px;
  box-sizing: border-box;

  font-weight: 700;
  font-size: 10px;
  line-height: 12px;
  text-shadow: 0px 0.5px 1px rgba(120, 53, 15, 0.4);
  padding: 0;
  margin: 0;
  appearance: none;
  border: none;
  outline: none;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  z-index: 1;
  border-radius: 10px;
  color: #ffffff;
  background-image: linear-gradient(
    to bottom,
    var(--fancy-button-gradient-0) 0%,
    var(--fancy-button-gradient-50) 50%,
    var(--fancy-button-gradient-100) 100%
  );
  box-shadow:
    0px 2px 5px rgba(202, 138, 4, 0.35),
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