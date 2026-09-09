<template>
  <header class="header">
    <div class="header-container">
      <!-- Nav Item 1: Trang chủ -->
      <router-link to="/home" class="nav-item" exact-active-class="active">
        <div class="icon-wrapper">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span class="nav-label">Trang chủ</span>
      </router-link>

      <!-- Nav Item 2: Lịch diễn / Shows -->
      <router-link to="/tat-ca-lich-dien" class="nav-item" active-class="active">
        <div class="icon-wrapper">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <span class="nav-label">Show diễn</span>
      </router-link>

      <!-- FAB Nút Dấu Cộng: CHỈ ADMIN MỚI NHÌN THẤY -->
      <div v-if="isAdmin" class="fab-wrapper">
        <button
          class="fab-btn"
          @click="triggerOpenShow"
          aria-label="Thêm show mới"
        >
          <svg class="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <!-- Nav Item 3: Bảng Chấm Công -->
      <router-link to="/cham-cong" class="nav-item" active-class="active">
        <div class="icon-wrapper">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l2 2 4-4"></path>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        </div>
        <span class="nav-label">Chấm công</span>
      </router-link>

      <!-- Nav Item 4: Tài khoản / Cá nhân -->
      <router-link to="/tai-khoan" class="nav-item" active-class="active">
        <div class="icon-wrapper">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="nav-label">Tài khoản</span>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getUserField } from '../utils/auth'

const emit = defineEmits(['open-show-popup'])

// Check xem người dùng có vai trò là Admin hay không
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

// Mở trực tiếp Popup Thêm Show Mới
const triggerOpenShow = () => {
  emit('open-show-popup')
}
</script>

<style scoped>
.header {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #ffffff;
  border-top: 1px solid rgba(143, 0, 0, 0.15);
  box-shadow: 0 -2px 10px rgba(143, 0, 0, 0.08);
  /* Tăng thêm khoảng đệm đáy để Header cao và thoáng hơn */
  padding: 10px 12px calc(18px + env(safe-area-inset-bottom)) 12px;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  /* Tăng chiều cao vùng chứa từ 52px lên 60px */
  height: 65px;
}

/* Nav Item - Icon chuẩn màu #8f0000 */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #8f0000;
  font-size: 11.5px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  opacity: 0.75;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 3px;
  stroke: #8f0000;
}

/* Trang active nổi bật với màu chủ đạo #8f0000 */
.nav-item.active {
  color: #8f0000;
  font-weight: 700;
  opacity: 1;
}

.nav-item.active .nav-icon {
  stroke: #8f0000;
  stroke-width: 2.5;
}

/* Floating Action Button (+) Nền đỏ chủ đạo gradient */
.fab-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.fab-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8f0000 0%, #5c0000 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(143, 0, 0, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  /* Nâng nút cộng cao hơn một chút cho cân đối với header cao mới */
  margin-top: -22px;
}

.fab-btn:active {
  transform: scale(0.92);
}

.fab-icon {
  width: 28px;
  height: 28px;
  stroke: #ffffff;
}
</style>