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
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
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
    // Ưu tiên dùng endpoint LOGIN nếu có trong api.ts
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

    // Lưu thông tin đăng nhập
    localStorage.setItem('token', 'logged_in')
    localStorage.setItem('user', JSON.stringify(json?.data || {}))
    localStorage.setItem('tai_khoan', String(json?.data?.tai_khoan || ''))
    localStorage.setItem('vai_tro', String(json?.data?.vai_tro || ''))
    localStorage.setItem('quyen', String(json?.data?.quyen || ''))

    // Điều hướng về trang chủ
    // Router của bạn hiện tại dùng '/home' (nếu sau này đổi thì sửa lại)
    await router.push('/home')
  } catch (err: any) {
    errorMsg.value = err?.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,.18), transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,.12), transparent 35%),
    linear-gradient(135deg, #4b0000 0%, #8f0000 45%, #c40000 100%);
}

.login__card {
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 18px;
  padding: 20px 18px 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, .28);
  border: 1px solid rgba(255,255,255,.6);
  backdrop-filter: blur(2px);
}

.login__logoWrap {
  text-align: center;
  margin-bottom: 14px;
}

.login__logo {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  margin: 0 auto 10px;
  border: 4px solid #f3e7a8;
}

.login__title {
  margin: 0;
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
  color: #7a0000;
  letter-spacing: 1px;
}

.login__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #9b7d00;
  font-weight: 700;
}

.login__form {
  margin-top: 8px;
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
  color: #7a0000;
}

.login__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e0dada;
  border-radius: 14px;
  height: 42px;
  padding: 0 14px;
  outline: none;
  font-size: 15px;
  color: #222;
  background: #fff;
}

.login__input:focus {
  border-color: #8f0000;
  box-shadow: 0 0 0 3px rgba(143, 0, 0, .12);
}

.login__button {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, #8f0000 0%, #700000 100%);
  color: #ffd700;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: .2px;
  cursor: pointer;
  margin-top: 2px;
}

.login__button:disabled {
  opacity: .7;
  cursor: not-allowed;
}

.login__error {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #dc2626;
  text-align: center;
}
</style>