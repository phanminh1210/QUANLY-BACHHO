
<template>
  <div class="loading-container">
    <div class="logo-track">
      <div class="track-line"></div>

      <div class="main-logo">
        <img :src="logo2008" alt="Loading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo2008 from '../assets/logo2008.jpg'
</script>

<style scoped>
.loading-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(3px);
  z-index: 9999;
}

.logo-track {
  position: relative;
  width: 220px;
  height: 90px;
}

.track-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 65px;
  height: 3px;
  background: #f2a0a0;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(242, 160, 160, 0.4);
}

.main-logo {
  position: absolute;
  top: 23px;
  left: 0;
  width: 42px;
  height: 42px;
  z-index: 2;
  animation: roll 1.6s ease-in-out infinite alternate;
}

.main-logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

@keyframes roll {
  0% {
    left: 0;
    transform: rotate(0deg);
  }

  100% {
    left: 178px;
    transform: rotate(720deg);
  }
}
</style>
