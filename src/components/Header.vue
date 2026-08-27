<template>
  <header ref="headerRef" class="header">
    <div class="header__left">
      <router-link to="/" class="header__brand">
        <img :src="logo" alt="Bạch Hổ Đường" class="header__logo" />
        <div class="header__brand-info">
          <span class="header__title">BẠCH HỔ ĐƯỜNG</span>
          <div class="header__user-sub">
            <span
              class="status-dot"
              :class="isLoggedIn ? 'status-dot--online' : 'status-dot--offline'"
            ></span>
            <span class="header__user-subname">{{ displayName }}</span>
          </div>
        </div>
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

      <transition name="pop">
        <nav v-if="isMenuOpen" class="header__popup">
          <!-- Tài khoản — luôn hiển thị trên cùng -->
          <router-link
            to="/tai-khoan"
            class="header__popup-item header__popup-item--account"
            @click="closeMenu"
          >
            <span class="account-icon">👤</span>
            <span>{{ displayName }}</span>
          </router-link>

          <div class="header__popup-divider" />

          <router-link to="/" class="header__popup-item" @click="closeMenu">Trang chủ</router-link>
          <router-link to="/tat-ca-lich-dien" class="header__popup-item" @click="closeMenu">Tất cả lịch diễn</router-link>
          <router-link to="/show-chua-dien" class="header__popup-item" @click="closeMenu">Show chưa diễn</router-link>
          <router-link to="/show-da-dien" class="header__popup-item" @click="closeMenu">Show đã diễn</router-link>
          <router-link to="/cham-cong" class="header__popup-item" @click="closeMenu">Danh sách chấm công</router-link>

          <!-- Chỉ admin -->
          <template v-if="isAdmin">
            <router-link to="/nhan-su" class="header__popup-item" @click="closeMenu">Thông tin nhân sự</router-link>
            <router-link to="/khach-hang" class="header__popup-item" @click="closeMenu">Thông tin khách hàng</router-link>
          </template>

          <div class="header__popup-divider" />

          <button class="header__popup-item header__popup-item--logout" type="button" @click="handleLogout">
            Đăng xuất
          </button>
        </nav>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo 2008.jpg'
import { getUserField } from '../utils/auth'

const router = useRouter()
const isMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)

// ── Admin check ───────────────────────────────────────────
const isAdmin = computed(() => {
  const role = getUserField('vai_tro') || getUserField('role')
  if (role) return String(role).trim().toLowerCase() === 'admin'
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try {
      const p = JSON.parse(raw)
      return String(p.vai_tro || p.role || '').trim().toLowerCase() === 'admin'
    } catch {}
  }
  return false
})

// ── Tên hiển thị ──────────────────────────────────────────
const displayName = computed(() => {
  const name = getUserField('ten_ns') || getUserField('ten') || getUserField('name') || getUserField('tai_khoan')
  if (name) return String(name).trim()
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try {
      const p = JSON.parse(raw)
      return String(p.ten_ns || p.ten || p.name || p.tai_khoan || 'Tài khoản').trim()
    } catch {}
  }
  return 'Chưa đăng nhập'
})

// ── Trạng thái đăng nhập ──────────────────────────────────
const isLoggedIn = computed(() => {
  return displayName.value !== 'Chưa đăng nhập'
})

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }
const closeMenu = () => { isMenuOpen.value = false }

const handleLogout = () => {
  closeMenu()
  localStorage.removeItem('user')
  localStorage.removeItem('user_info')
  localStorage.removeItem('token')
  sessionStorage.clear()
  router.push('/login')
}

const handleClickOutside = (event: MouseEvent) => {
  if (headerRef.value && !headerRef.value.contains(event.target as Node)) closeMenu()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.header {
  position: relative; width: 100%; height: 68px; padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between;
  background: #ba0000; box-sizing: border-box; z-index: 100;
}

.header__left { display: flex; align-items: center; }
.header__brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.header__logo { width: 42px; height: 42px; object-fit: cover; border-radius: 50%; border: 2px solid #ffd700; flex-shrink: 0; }

.header__brand-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.25;
}

.header__title { font-size: 14px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }

.header__user-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

/* Base Dot */
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Chấm xanh khi đã đăng nhập */
.status-dot--online {
  background-color: #22c55e;
  box-shadow: 0 0 4px rgba(34, 197, 94, 0.6);
}

/* Chấm đỏ khi chưa đăng nhập */
.status-dot--offline {
  background-color: #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
}

.header__user-subname {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header__menu-wrapper { position: relative; }

.header__menu-btn {
  width: 44px; height: 44px; border: none; background: transparent;
  display: flex; flex-direction: column; justify-content: center;
  gap: 4px; cursor: pointer; padding: 0;
}
.header__menu-btn span {
  display: block; width: 20px; height: 2px; margin: 0 auto;
  border-radius: 0; background: #ffd700; transition: all 0.25s ease;
}
.header__menu-btn--active span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.header__menu-btn--active span:nth-child(2) { opacity: 0; }
.header__menu-btn--active span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

.header__popup {
  position: absolute; top: 100%; right: 0; margin-top: 8px;
  width: 220px; background: #fff; border-radius: 0; padding: 0;
  box-shadow: 0 8px 20px rgba(0,0,0,.25); border: 1px solid #ddd;
  display: flex; flex-direction: column; overflow: hidden;
}

.header__popup-item--account {
  display: flex; align-items: center; gap: 8px;
  background: #fff8f0; color: #8f0000 !important;
  font-weight: 700; font-size: 13px;
}
.header__popup-item--account:hover { background: #ba0000 !important; color: #ffd700 !important; }
.account-icon { font-size: 16px; flex-shrink: 0; }

.header__popup-divider { height: 1px; background: #e5e5e5; margin: 0; }

.header__popup-item {
  width: 100%; border: none; background: #fff; border-radius: 0;
  padding: 11px 16px; font-size: 13px; font-weight: 600; color: #333;
  text-align: left; cursor: pointer; text-decoration: none;
  box-sizing: border-box; border-bottom: 1px solid #f2f2f2;
  transition: background-color .2s, color .2s;
  display: block;
}
.header__popup-item:last-child { border-bottom: none; }
.header__popup-item:hover,
.header__popup-item.router-link-exact-active { background: #ba0000; color: #fff; }

.header__popup-item--logout { color: #d32f2f; border-top: 2px solid #f0f0f0; }
.header__popup-item--logout:hover { background: #d32f2f; color: #fff; }

.pop-enter-active, .pop-leave-active { transition: all .2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>