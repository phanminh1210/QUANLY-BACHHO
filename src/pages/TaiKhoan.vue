<template>
  <div class="account-page">
    <section class="account-page__header">
      <div class="account-page__inner">
        <p class="account-page__subtitle">Thông tin cá nhân</p>
      </div>
    </section>

    <section class="account-page__content">
      <div v-if="loading" class="state-msg">Đang tải thông tin...</div>
      <div v-else-if="!info" class="state-msg state-msg--error">Không tìm thấy thông tin tài khoản.</div>

      <div v-else class="account-card">
        <div class="gear-wrap">
          <button class="gear-btn" type="button" @click.stop="toggleGearMenu">⚙️</button>
          <div v-if="gearOpen" class="gear-dropdown" @click.stop>
            <button class="gear-option" type="button" @click="requestAuth('edit')">✏️ Cập nhật thông tin</button>
            <button class="gear-option" type="button" @click="requestAuth('pass')">🔑 Thay đổi mật khẩu</button>
          </div>
        </div>

        <div class="account-avatar">
          <img :src="info.anh_daidien || defaultAvatar" class="avatar-img" alt="Avatar" />
        </div>

        <div class="account-name">{{ info.ten_ns || '—' }}</div>

        <div class="account-fields">
          <div class="field-row">
            <span class="field-key">Mã NS</span>
            <span class="field-val">{{ info.ma_ns || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">Họ tên</span>
            <span class="field-val">{{ info.ten_ns || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">Năm sinh</span>
            <span class="field-val">{{ info.nam_sinh || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">Địa chỉ</span>
            <span class="field-val">{{ info.dia_chi || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">SĐT</span>
            <span class="field-val">{{ info.sdt || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">Tài khoản</span>
            <span class="field-val">{{ info.tai_khoan || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">Vai trò</span>
            <span class="field-val">{{ info.vai_tro || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-key">Quyền</span>
            <span class="field-val">{{ info.quyen || '—' }}</span>
          </div>
          <div v-if="info.ghi_chu" class="field-row">
            <span class="field-key">Ghi chú</span>
            <span class="field-val">{{ info.ghi_chu }}</span>
          </div>
        </div>
      </div>
    </section>

    <div v-if="gearOpen" class="overlay-clear" @click="gearOpen = false" />

    <!-- MODAL XÁC NHẬN MẬT KHẨU -->
    <div v-if="authModal" class="modal-overlay" @click="!submitting && closeAuth()">
      <div class="modal-box" @click.stop>
        <h3 class="modal-title">🔒 Xác nhận mật khẩu</h3>
        <p class="modal-desc">Nhập mật khẩu hiện tại để tiếp tục</p>
        <div class="modal-fields">
          <div class="modal-field">
            <label class="modal-label">Mật khẩu</label>
            <input class="modal-input" :class="{ 'modal-input--error': authError }"
              v-model="authPass" type="password" placeholder="Nhập mật khẩu"
              @keyup.enter="submitAuth" />
            <span v-if="authError" class="modal-error">{{ authError }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn--red"  :disabled="submitting" type="button" @click="submitAuth">
            {{ submitting ? 'Đang xác nhận...' : 'Xác nhận' }}
          </button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeAuth">Hủy</button>
        </div>
      </div>
    </div>

    <!-- MODAL CẬP NHẬT THÔNG TIN (không có tên) -->
    <div v-if="editModal" class="modal-overlay" @click="!submitting && closeEditInfo()">
      <div class="modal-box" @click.stop>
        <h3 class="modal-title">✏️ Cập nhật thông tin</h3>
        <div class="modal-fields">
          <div class="modal-field">
            <label class="modal-label">Năm sinh</label>
            <input class="modal-input" v-model="editForm.nam_sinh" type="text" placeholder="VD: 2003" />
          </div>
          <div class="modal-field">
            <label class="modal-label">Địa chỉ</label>
            <input class="modal-input" v-model="editForm.dia_chi" type="text" placeholder="Địa chỉ" />
          </div>
          <div class="modal-field">
            <label class="modal-label">SĐT</label>
            <input class="modal-input" v-model="editForm.sdt" type="text" placeholder="SĐT" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn--green" :disabled="submitting" type="button" @click="submitEditInfo">
            {{ submitting ? 'Đang lưu...' : 'Lưu' }}
          </button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeEditInfo">Hủy</button>
        </div>
      </div>
    </div>

    <!-- MODAL ĐỔI MẬT KHẨU -->
    <div v-if="passModal" class="modal-overlay" @click="!submitting && closeChangePass()">
      <div class="modal-box" @click.stop>
        <h3 class="modal-title">🔑 Thay đổi mật khẩu</h3>
        <div class="modal-fields">
          <div class="modal-field">
            <label class="modal-label">Mật khẩu mới</label>
            <input class="modal-input" :class="{ 'modal-input--error': passError }"
              v-model="passForm.moi" type="password" placeholder="Mật khẩu mới" />
          </div>
          <div class="modal-field">
            <label class="modal-label">Xác nhận mật khẩu mới</label>
            <input class="modal-input" :class="{ 'modal-input--error': passError }"
              v-model="passForm.xacNhan" type="password" placeholder="Nhập lại mật khẩu mới" />
            <span v-if="passError" class="modal-error">{{ passError }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn--green" :disabled="submitting" type="button" @click="submitChangePass">
            {{ submitting ? 'Đang lưu...' : 'Lưu' }}
          </button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeChangePass">Hủy</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
      <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'
import defaultAvatar from '../assets/lan.webp'

type UserInfo = {
  ma_ns: string; ten_ns: string; nam_sinh: string; dia_chi: string
  sdt: string; tai_khoan: string; anh_daidien: string
  vai_tro: string; quyen: string; ghi_chu: string
}

const loading    = ref(false)
const submitting = ref(false)
const info       = ref<UserInfo | null>(null)
const gearOpen   = ref(false)

const authModal  = ref(false)
const authPass   = ref('')
const authError  = ref('')
const authTarget = ref<'edit' | 'pass' | null>(null)

// ✅ Bỏ ten_ns khỏi editForm
const editModal = ref(false)
const editForm  = ref({ nam_sinh: '', dia_chi: '', sdt: '' })

const passModal = ref(false)
const passError = ref('')
const passForm  = ref({ moi: '', xacNhan: '' })

const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const toggleGearMenu = () => { gearOpen.value = !gearOpen.value }

const requestAuth = (target: 'edit' | 'pass') => {
  gearOpen.value   = false
  authTarget.value = target
  authPass.value   = ''
  authError.value  = ''
  authModal.value  = true
}
const closeAuth = () => { if (submitting.value) return; authModal.value = false }

const submitAuth = async () => {
  if (!authPass.value.trim()) { authError.value = 'Vui lòng nhập mật khẩu!'; return }
  if (!info.value) return
  submitting.value = true
  authError.value  = ''
  try {
    const res = await safeJson(await fetch(API_ENDPOINTS.LOGIN(info.value.tai_khoan, authPass.value.trim())))
    if (!res || (res.code !== 200 && res.status !== 'success')) {
      authError.value = 'Mật khẩu không đúng!'; return
    }
    authModal.value = false
    if (authTarget.value === 'edit') {
      // ✅ Bỏ ten_ns
      editForm.value  = { nam_sinh: info.value.nam_sinh || '', dia_chi: info.value.dia_chi || '', sdt: info.value.sdt || '' }
      editModal.value = true
    } else {
      passForm.value  = { moi: '', xacNhan: '' }
      passError.value = ''
      passModal.value = true
    }
  } catch { authError.value = 'Lỗi kết nối máy chủ!' }
  finally { submitting.value = false }
}

const closeEditInfo   = () => { if (submitting.value) return; editModal.value = false }
const closeChangePass = () => { if (submitting.value) return; passModal.value = false }

const getTaiKhoan = (): string => {
  const tk = getUserField('tai_khoan') || getUserField('username')
  if (tk) return String(tk).trim()
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try { const p = JSON.parse(raw); return String(p.tai_khoan || p.username || '').trim() }
    catch {}
  }
  return ''
}

const safeJson = async (res: Response): Promise<any | null> => {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return null }
}

const fetchInfo = async () => {
  const taiKhoan = getTaiKhoan()
  if (!taiKhoan) { showToast('Không tìm thấy thông tin đăng nhập!', 'error'); return }
  loading.value = true
  try {
    const res = await safeJson(await fetch(API_ENDPOINTS.GET_NHAN_SU_BY_TAI_KHOAN(taiKhoan)))
    if (!res)                                         { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { info.value = res.data }
    else                                              { showToast(res.message || 'Không tìm thấy tài khoản!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally { loading.value = false }
}

// ✅ ten_ns lấy từ info.value — không cho sửa
const submitEditInfo = async () => {
  if (!info.value) return
  submitting.value = true
  try {
    const url = API_ENDPOINTS.CAPNHAT_THONGTIN_NHANSU_BY_NV({
      ma_ns:    info.value.ma_ns,
      ten_ns:   info.value.ten_ns,
      nam_sinh: editForm.value.nam_sinh,
      dia_chi:  editForm.value.dia_chi,
      sdt:      editForm.value.sdt,
    })
    const res = await safeJson(await fetch(url))
    if (!res)                                         { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { showToast('Cập nhật thành công!'); editModal.value = false; await fetchInfo() }
    else                                              { showToast(res.message || 'Cập nhật thất bại!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally { submitting.value = false }
}

const submitChangePass = async () => {
  passError.value = ''
  if (!passForm.value.moi)                           { passError.value = 'Vui lòng nhập mật khẩu mới!'; return }
  if (passForm.value.moi !== passForm.value.xacNhan) { passError.value = 'Mật khẩu xác nhận không khớp!'; return }
  if (!info.value) return
  submitting.value = true
  try {
    const url = API_ENDPOINTS.DOI_MAT_KHAU_BY_NV(info.value.ma_ns, passForm.value.moi)
    const res = await safeJson(await fetch(url))
    if (!res)                                         { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { showToast('Đổi mật khẩu thành công!'); passModal.value = false }
    else                                              { showToast(res.message || 'Đổi mật khẩu thất bại!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally { submitting.value = false }
}

onMounted(fetchInfo)
</script>

<style scoped>
.account-page { min-height: 100vh; background: #f6f1f1; }
.account-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.account-page__inner    { max-width: 760px; margin: 0 auto; }
.account-page__subtitle { margin: 0; text-align: center; font-size: 14px; color: rgba(255,255,255,.95); font-weight: 600; }
.account-page__content  { padding: 16px 14px 60px; }
.state-msg        { text-align: center; padding: 30px; font-weight: 700; color: #8f0000; font-size: 15px; }
.state-msg--error { color: #dc2626; }

.account-card { position: relative; max-width: 420px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 20px 16px; box-shadow: 0 4px 16px rgba(143,0,0,.08); border: 1px solid #ececec; }

.gear-wrap { position: absolute; top: 12px; right: 12px; z-index: 10; }
.gear-btn  { background: none; border: none; padding: 0; font-size: 22px; cursor: pointer; line-height: 1; transition: transform .2s; }
.gear-btn:hover { transform: rotate(30deg); }
.gear-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px; box-shadow: 0 8px 20px rgba(0,0,0,.15); min-width: 190px; display: flex; flex-direction: column; gap: 2px; }
.gear-option   { border: none; border-radius: 7px; padding: 9px 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; background: transparent; color: #1e293b; transition: background .12s; white-space: nowrap; }
.gear-option:hover { background: #f1f5f9; color: #8f0000; }

.overlay-clear { position: fixed; inset: 0; z-index: 9; }

.account-avatar { display: flex; justify-content: center; margin-bottom: 12px; }
.avatar-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #ffd700; box-shadow: 0 4px 12px rgba(143,0,0,.15); }
.account-name { text-align: center; font-size: 18px; font-weight: 800; color: #8f0000; margin-bottom: 16px; }

.account-fields { display: flex; flex-direction: column; }
.field-row { display: flex; align-items: flex-start; gap: 8px; padding: 9px 0; border-bottom: 1px solid #f3f3f3; }
.field-row:last-child { border-bottom: none; }
.field-key { min-width: 100px; font-size: 12px; font-weight: 700; color: #8f0000; text-transform: uppercase; flex-shrink: 0; padding-top: 1px; }
.field-val { font-size: 13px; font-weight: 500; color: #333; word-break: break-word; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 16px; }
.modal-box     { background: #fff; border-radius: 16px; padding: 18px 16px; width: 100%; max-width: 340px; box-shadow: 0 10px 30px rgba(0,0,0,.18); }
.modal-title   { margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.modal-desc    { margin: 0 0 14px; font-size: 12px; color: #64748b; text-align: center; }
.modal-fields  { display: flex; flex-direction: column; gap: 10px; }
.modal-field   { display: flex; flex-direction: column; gap: 3px; }
.modal-label   { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.modal-input   { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; }
.modal-input:focus    { border-color: #2563eb; }
.modal-input--error   { border-color: #dc2626 !important; }
.modal-error          { font-size: 11px; font-weight: 600; color: #dc2626; }
.modal-actions        { margin-top: 14px; display: flex; gap: 8px; }
.modal-actions .btn   { flex: 1; padding: 9px; font-size: 13px; }

.btn { border: none; border-radius: 999px; padding: 6px 13px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 400; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }

@media (max-width: 640px) {
  .account-card { padding: 16px 12px; }
  .avatar-img { width: 76px; height: 76px; }
  .account-name { font-size: 16px; }
  .field-key { min-width: 85px; font-size: 11px; }
  .field-val { font-size: 12px; }
}
</style>