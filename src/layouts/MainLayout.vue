<template>
  <div class="main-layout">
    <Header />
    <main class="main-layout__content">
      <router-view />
    </main>
    <AppFooter />

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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/Header.vue'
import AppFooter from '../components/AppFooter.vue'
import FloatingAddMenu from '../components/FloatingAddMenu.vue'
import AddShowPopup from '../components/AddShowPopup.vue'
import AddStaffPopup from '../components/AddStaffPopup.vue'

const showPopup = ref(false)
const staffPopup = ref(false)

const handleShowSubmit = (formData: any) => {
  console.log('Submit show:', formData)
}

const handleStaffSubmit = (formData: any) => {
  console.log('Submit staff:', formData)
}
</script>