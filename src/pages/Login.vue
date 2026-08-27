<template>
  <div class="login">
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
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,.14), transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,.10), transparent 35%),
    linear-gradient(135deg, #4b0000 0%, #8f0000 45%, #c40000 100%);
}

.login__card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 236, 236, 0.96); /* đỏ nhạt */
  border: 1px solid rgba(255, 214, 214, 0.9);
  border-radius: 18px;
  padding: 22px 18px 18px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(2px);
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
  border: 3px solid #fff;
  box-shadow: 0 4px 10px rgba(143, 0, 0, 0.15);
}

.login__title {
  margin: 0;
  font-size: 24px; /* chữ nhỏ hơn */
  line-height: 1.15;
  font-weight: 800;
  color: #7a0000;
  letter-spacing: 0.2px;
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
  color: #7a0000;
}

.login__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #efc9c9;
  border-radius: 12px;
  height: 42px;
  padding: 0 12px;
  outline: none;
  font-size: 14px;
  color: #222;
  background: #fff;
  transition: border-color .2s, box-shadow .2s;
}

.login__input:focus {
  border-color: #c24141;
  box-shadow: 0 0 0 3px rgba(194, 65, 65, 0.14);
}

.login__button {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #c53030 0%, #a61b1b 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: .2px;
  cursor: pointer;
  margin-top: 4px;
  box-shadow: 0 8px 16px rgba(166, 27, 27, 0.25);
  transition: transform .12s ease, box-shadow .12s ease, opacity .2s;
}

.login__button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(166, 27, 27, 0.3);
}

.login__button:active:not(:disabled) {
  transform: translateY(0);
}

.login__button:disabled {
  opacity: .75;
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
  color: #dc2626;
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