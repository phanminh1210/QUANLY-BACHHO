<template>
  <header ref="headerRef" class="header">
    <div class="header__left">
      <router-link to="/" class="header__brand">
        <img :src="logo" alt="Bạch Hổ Đường" class="header__logo" />
        <span class="header__title">BẠCH HỔ ĐƯỜNG</span>
      </router-link>
    </div>

    <div class="header__menu-wrapper">
      <button
        class="header__menu-btn"
        :class="{ 'header__menu-btn--active': isMenuOpen }"
        type="button"
        aria-label="Open menu"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Popup Menu vuông vức góc phải -->
      <transition name="pop">
        <nav v-if="isMenuOpen" class="header__popup">
          <router-link
            to="/"
            class="header__popup-item"
            @click="closeMenu"
          >
            Trang chủ
          </router-link>

          <router-link
            to="/tat-ca-lich-dien"
            class="header__popup-item"
            @click="closeMenu"
          >
            Tất cả lịch diễn
          </router-link>

          <router-link
            to="/show-chua-dien"
            class="header__popup-item"
            @click="closeMenu"
          >
            Show chưa diễn
          </router-link>

          <router-link
            to="/show-da-dien"
            class="header__popup-item"
            @click="closeMenu"
          >
            Show đã diễn
          </router-link>

          <router-link
            to="/nhan-su"
            class="header__popup-item"
            @click="closeMenu"
          >
            Thông tin nhân sự
          </router-link>

          <button
            class="header__popup-item"
            type="button"
            @click="closeMenu"
          >
            Thông tin khách hàng
          </button>

          <router-link
            to="/cham-cong"
            class="header__popup-item"
            @click="closeMenu"
          >
            Danh sách chấm công
          </router-link>

          <!-- Nút Đăng xuất -->
          <button
            class="header__popup-item header__popup-item--logout"
            type="button"
            @click="handleLogout"
          >
            Đăng xuất
          </button>
        </nav>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo 2008.jpg'

const router = useRouter()
const isMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Xử lý đăng xuất
const handleLogout = () => {
  closeMenu()
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  sessionStorage.clear()
  router.push('/login')
}

// Tự động đóng menu khi click ra ngoài
const handleClickOutside = (event: MouseEvent) => {
  if (headerRef.value && !headerRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  position: relative;
  width: 100%;
  height: 68px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ba0000;
  box-sizing: border-box;
  z-index: 100;
}

.header__left {
  display: flex;
  align-items: center;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
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

.header__menu-wrapper {
  position: relative;
}

.header__menu-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
}

.header__menu-btn span {
  display: block;
  width: 20px;
  height: 2px;
  margin: 0 auto;
  border-radius: 0;
  background: #ffd700;
  transition: all 0.25s ease;
}

/* Hiệu ứng nút hamburger thành dấu X */
.header__menu-btn--active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.header__menu-btn--active span:nth-child(2) {
  opacity: 0;
}

.header__menu-btn--active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Popup Menu vuông vức */
.header__popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 210px;
  background: #ffffff;
  border-radius: 0;
  padding: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header__popup-item {
  width: 100%;
  border: none;
  background: #ffffff;
  border-radius: 0;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  border-bottom: 1px solid #f2f2f2;
  transition: background-color 0.2s, color 0.2s;
}

.header__popup-item:last-child {
  border-bottom: none;
}

/* Hover/Active -> Nền đỏ, Chữ trắng */
.header__popup-item:hover,
.header__popup-item.router-link-exact-active {
  background: #ba0000;
  color: #ffffff;
}

/* Nút Đăng xuất */
.header__popup-item--logout {
  color: #d32f2f;
  border-top: 2px solid #f0f0f0;
}

.header__popup-item--logout:hover {
  background: #d32f2f;
  color: #ffffff;
}

/* Transition Menu */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>