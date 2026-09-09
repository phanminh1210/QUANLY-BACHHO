<template>
  <div class="login-wrapper">
    <!-- Lớp ảnh nền xử lý mờ (blur) -->
    <div 
      class="login__bg" 
      :style="{ backgroundImage: `url(${bgImage})` }"
    ></div>

    <!-- Khung đăng nhập nổi lên trên -->
    <div class="login__card">
      <div class="login__logoWrap">
        <img :src="logo" alt="Logo" class="login__logo" />
        <h1 class="login__title">Bach Ho Duong Lion</h1>
      </div>

      <form class="login__form" @submit.prevent="handleLogin">
        <div class="login__field">
          <label class="login__label">Tài khoản</label>
          <input
            v-model.trim="username"
            class="login__input"
            type="text"
            placeholder="Nhập tài khoản"
            :disabled="loading"
          />
        </div>

        <div class="login__field">
          <label class="login__label">Mật khẩu</label>
          <input
            v-model.trim="password"
            class="login__input"
            type="password"
            placeholder="Nhập mật khẩu"
            :disabled="loading"
          />
        </div>

        <button class="login__button" type="submit" :disabled="loading">
          <span class="login__buttonText">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </span>
        </button>

        <p v-if="errorMsg" class="login__error">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo 2008.jpg'
import bgImage from '../assets/nenlogin.jpg'
import { API_ENDPOINTS } from '../config/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (loading.value) return
  errorMsg.value = ''

  if (!username.value || !password.value) {
    errorMsg.value = 'Vui lòng nhập tài khoản và mật khẩu'
    return
  }

  loading.value = true
  try {
    const loginUrl =
      (API_ENDPOINTS as any).LOGIN
        ? (API_ENDPOINTS as any).LOGIN(username.value, password.value)
        : `${(API_ENDPOINTS as any).API_BASE_URL || ''}?action=login&tai_khoan=${encodeURIComponent(username.value)}&mat_khau=${encodeURIComponent(password.value)}`

    const res = await fetch(loginUrl, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    const ok = json?.code === 200 || json?.status === 'success'

    if (!ok) {
      errorMsg.value = json?.message || 'Đăng nhập thất bại'
      return
    }

    localStorage.setItem('token', 'logged_in')
    localStorage.setItem('user', JSON.stringify(json?.data || {}))
    localStorage.setItem('tai_khoan', String(json?.data?.tai_khoan || ''))
    localStorage.setItem('vai_tro', String(json?.data?.vai_tro || ''))
    localStorage.setItem('quyen', String(json?.data?.quyen || ''))

    await router.push('/home')
  } catch (err: any) {
    errorMsg.value = err?.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  overflow: hidden;
}

/* Ảnh nền được làm mờ nét (blur) */
.login__bg {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(2px); /* Chỉnh độ mờ nhòe ảnh nền tại đây (6px, 8px, 12px) */
  transform: scale(1.05); /* Tránh viền trắng xung quanh do filter blur */
  z-index: 0;
}

/* Khung form nổi bật lên trên */
.login__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;   
  background: rgba(0, 0, 0, 0.25); /* Nền mỏng xuyên thấu */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 22px 18px 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.login__logoWrap {
  text-align: center;
  margin-bottom: 14px;
}

.login__logo {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  margin: 0 auto 10px;
  border: 2px solid #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
}

.login__title {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
}

.login__form {
  margin-top: 10px;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.login__label {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.login__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  height: 42px;
  padding: 0 12px;
  outline: none;
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  transition: all .2s ease;
}

.login__input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.login__input:focus {
  border-color: #ef4444;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.login__button {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: .2px;
  cursor: pointer;
  margin-top: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  transition: transform .12s ease, box-shadow .12s ease, opacity .2s;
}

.login__button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.5);
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

.login__button:active:not(:disabled) {
  transform: translateY(0);
}

.login__button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.login__buttonText {
  display: inline-block;
  transform: translateY(0.5px);
}

.login__error {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #f87171;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  text-align: center;
}

@media (max-width: 420px) {
  .login__card {
    max-width: 100%;
    padding: 18px 14px 14px;
    border-radius: 14px;
  }

  .login__title {
    font-size: 22px;
  }
}
</style>