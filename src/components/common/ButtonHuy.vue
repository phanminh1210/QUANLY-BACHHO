<template>
  <button class="btn" type="button">
    <span>Hủy</span>
  </button>
</template>

<style scoped>
/* CSS Giao diện nút Xám - Chữ Đen Fancy */
.btn {
  --fancy-button-gradient-0: #e5e7eb;   /* Xám sáng */
  --fancy-button-gradient-50: #d1d5db;  /* Xám vừa */
  --fancy-button-gradient-100: #9ca3af; /* Xám đậm */
  --fancy-button-inner-shadow-top: rgba(255, 255, 255, 0.9);
  --fancy-button-inner-shadow-bottom: rgba(0, 0, 0, 0.15);
  --fancy-button-shine-top: #ffffff;    /* Trắng phát sáng viền trên */
  --fancy-button-shine-bottom: #6b7280; /* Xám highlight viền dưới */
  
  /* CỐ ĐỊNH KÍCH THƯỚC NÚT */
  width: 70px;
  height: 25px;
  box-sizing: border-box;

  font-weight: 600;
  font-size: 11px;
  line-height: 14px;
  text-shadow: 0px 0.5px 1px rgba(255, 255, 255, 0.8);
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
  color: #1f2937; /* Chữ màu xám đen/đen */
  background-image: linear-gradient(
    to bottom,
    var(--fancy-button-gradient-0) 0%,
    var(--fancy-button-gradient-50) 50%,
    var(--fancy-button-gradient-100) 100%
  );
  box-shadow:
    0px 2px 5px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.1),
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
  opacity: 0.9;
  filter: blur(3px);
  transition: opacity 0.25s;
}

.btn:after {
  inset: 0;
  background-size: cover;
  z-index: 2;
  opacity: 0.15;
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
  opacity: 0.4;
  filter: blur(4px);
}

.btn span:after {
  width: 90%;
  height: 1px;
  bottom: 0;
  opacity: 0.6;
  filter: blur(0.5px);
}

.btn:hover span:before {
  opacity: 0.7;
  transform: translateX(-50%) scale(1.2);
}

.btn:hover span:after {
  opacity: 0.9;
}
</style>