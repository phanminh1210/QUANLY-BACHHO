<template>
  <div class="login">
    <div class="login__card">
      <div class="login__logoWrap">
        <img :src="logo" alt="Logo" class="login__logo" />
        <h1 class="login__title">BẠCH HỔ ĐƯỜNG</h1>
        <p class="login__subtitle">Đăng nhập vào hệ thống</p>
      </div>

      <form class="login__form" @submit.prevent="handleLogin">
        <div class="login__field">
          <label class="login__label">Tài khoản</label>
          <input
            v-model="username"
            class="login__input"
            type="text"
            placeholder="Nhập tài khoản"
          />
        </div>

        <div class="login__field">
          <label class="login__label">Mật khẩu</label>
          <input
            v-model="password"
            class="login__input"
            type="password"
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button class="login__button" type="submit">Đăng nhập</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import logo from '../assets/logo 2008.jpg'
import '../styles/login.css'

const username = ref('')
const password = ref('')

const handleLogin = () => {
  alert(`Đăng nhập: ${username.value}`)
}
</script>