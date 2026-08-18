<template>
  <header class="header">
    <div class="header__left">
      <img :src="logo" alt="Bạch Hổ Đường" class="header__logo" />
      <span class="header__title">BẠCH HỔ ĐƯỜNG</span>
    </div>

    <button class="header__menu" type="button" aria-label="Open menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>
</template>

<script setup lang="ts">
import logo from '../assets/logo 2008.jpg'
</script>

<style scoped>
.header {
  width: 100%;
  height: 68px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ba0000;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__logo {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ffd700;
}

.header__title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.header__menu {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}

.header__menu span {
  display: block;
  width: 20px;
  height: 2px;
  margin: 0 auto;
  border-radius: 999px;
  background: #ffd700;
}
</style>