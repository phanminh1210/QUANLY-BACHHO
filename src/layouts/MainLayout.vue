<template>
  <div class="main-layout">
    <Header />
    <main class="main-layout__content">
      <router-view />
    </main>
    <AppFooter />

    <!-- Chỉ hiển thị Nút nổi và các Popup khi là Admin -->
    <template v-if="isAdmin">
      <FloatingAddMenu
        @open-show-popup="showPopup = true"
        @open-staff-popup="staffPopup = true"
      />

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
import { ref, computed } from 'vue'
import Header from '../components/Header.vue'
import AppFooter from '../components/AppFooter.vue'
import FloatingAddMenu from '../components/FloatingAddMenu.vue'
import AddShowPopup from '../components/AddShowPopup.vue'
import AddStaffPopup from '../components/AddStaffPopup.vue'
import { getUserField } from '../utils/auth'

const showPopup = ref(false)
const staffPopup = ref(false)

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