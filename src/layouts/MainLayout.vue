<template>
  <div class="main-layout">
    <main class="main-layout__content">
      <router-view />
    </main>

    <!-- Header đặt ở đáy màn hình, tự động ẩn/hiện theo chiều cuộn -->
    <Header
      :class="{ 'header--hidden': isHeaderHidden }"
      @open-show-popup="showPopup = true"
      @open-staff-popup="staffPopup = true"
    />

    <!-- Các Popup cho Admin -->
    <template v-if="isAdmin">
      <AddShowPopup
        :visible="showPopup"
        @close="showPopup = false"
        @submit="handleShowSubmit"
      />

      <AddStaffPopup
        :visible="staffPopup"
        @close="staffPopup = false"
        @submit="handleStaffSubmit"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Header from '../components/Header.vue'
import AddShowPopup from '../components/AddShowPopup.vue'
import AddStaffPopup from '../components/AddStaffPopup.vue'
import { getUserField } from '../utils/auth'

const showPopup = ref(false)
const staffPopup = ref(false)

// ── XỬ LÝ ẨN / HIỆN HEADER Ở ĐÁY MÀN HÌNH KHI CUỘN ──
const isHeaderHidden = ref(false)
let lastScrollPosition = 0
const scrollThreshold = 5

const handleScroll = () => {
  const contentEl = document.querySelector('.main-layout__content')
  const currentScrollPosition = contentEl ? contentEl.scrollTop : (window.scrollY || document.documentElement.scrollTop)

  // Nếu ở mép trên cùng trang thì luôn hiện Header
  if (currentScrollPosition <= 10) {
    isHeaderHidden.value = false
    lastScrollPosition = currentScrollPosition
    return
  }

  // Bỏ qua chênh lệch quá nhỏ
  if (Math.abs(currentScrollPosition - lastScrollPosition) < scrollThreshold) {
    return
  }

  // Cuộn xuống -> Trượt ẩn Header xuống dưới; Cuộn lên -> Hiện Header lại
  if (currentScrollPosition > lastScrollPosition) {
    isHeaderHidden.value = true
  } else {
    isHeaderHidden.value = false
  }

  lastScrollPosition = currentScrollPosition
}

onMounted(() => {
  const contentEl = document.querySelector('.main-layout__content')
  if (contentEl) {
    contentEl.addEventListener('scroll', handleScroll, { passive: true })
  } else {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  const contentEl = document.querySelector('.main-layout__content')
  if (contentEl) {
    contentEl.removeEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
})

// ── CHECK ADMIN ───────────────────────────────────────────
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

const handleShowSubmit = (formData: any) => {
  console.log('Submit show:', formData)
}

const handleStaffSubmit = (formData: any) => {
  console.log('Submit staff:', formData)
}
</script>

<style scoped>
/* Khóa cứng kích thước màn hình, ngăn kéo tràn viền ngang và dọc body/html */
:global(html, body) {
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  overflow: hidden; /* Khóa cuộn toàn trang trình duyệt */
  background-color: #ffffff;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  position: relative;
  width: 100%;
  max-width: 100vw;
  overflow: hidden; /* Chặn hoàn toàn việc lướt tràn màn hình chính */
}

.main-layout__content {
  flex: 1;
  width: 100%;
  overflow-y: auto; /* Chỉ cho phép cuộn bên trong nội dung router-view nếu nội dung dài */
  overscroll-behavior: none; /* Chặn hiệu ứng kéo nảy (bounce/rubber-band) trên mobile */
  padding-bottom: 95px; /* Đệm đáy để không bị Header che mất nội dung cuối */
}

/* ── CẤU HÌNH HEADER Ở ĐÁY MÀN HÌNH ── */
:deep(.header) {
  position: fixed;
  top: auto;
  bottom: 0;
  left: 0;
  right: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  z-index: 100;
}

/* Trượt ẩn xuống phía dưới đáy màn hình */
:deep(.header--hidden) {
  transform: translateY(100%);
}

/* Đảo ngược menu popup của nút dấu cộng để bung ngược lên trên */
:deep(.fab-menu-popup) {
  top: auto !important;
  bottom: 54px !important;
}
</style>