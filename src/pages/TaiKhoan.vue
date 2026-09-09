<template>
  <div class="account-page">
    <!-- MÀN HÌNH CHỜ LÀM MỜ KHÓA TOÀN BỘ THAO TÁC KHI XỬ LÝ API -->
    <transition name="fade">
      <div v-if="submitting" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Đang xử lý, vui lòng chờ...</p>
      </div>
    </transition>

    <!-- HEADER TÁCH RIÊNG: TRUYỀN TEXT TIÊU ĐỀ TÙY Ý VÀO PROP TITLE -->
    <HeaderTitle title="Thông tin cá nhân" />

    <section class="account-page__content">
      <!-- SKELETON LOADING -->
      <div v-if="loading && !info" class="account-card-wrap">
        <div class="account-card skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
      </div>

      <div v-else-if="!info" class="state-message state-message--error">
        Không tìm thấy thông tin tài khoản.
      </div>

      <div v-else class="account-card-wrap">
        <div class="account-card">
          <!-- NUT BÁNH RĂNG TÙY CHỌN -->
          <div class="gear-wrap">
            <button class="gear-btn" type="button" @click.stop="toggleGearMenu" aria-label="Cài đặt">⚙️</button>
            <div v-if="gearOpen" class="gear-dropdown" @click.stop>
              <button class="gear-option" type="button" @click="requestAuth('edit')">✏️ Cập nhật thông tin</button>
              <button class="gear-option" type="button" @click="requestAuth('pass')">🔑 Thay đổi mật khẩu</button>
            </div>
          </div>

          <!-- ẢNH ĐẠI DIỆN -->
          <div class="account-avatar">
            <img :src="defaultAvatar" class="avatar-img" alt="Avatar" />
          </div>

          <div class="account-name">{{ info.ten_ns || '—' }}</div>

          <div class="account-fields">
            <div class="field-row">
              <span class="field-key">Mã NS:</span>
              <span class="field-val">{{ info.ma_ns || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">Họ tên:</span>
              <span class="field-val">{{ info.ten_ns || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">Năm sinh:</span>
              <span class="field-val">{{ info.nam_sinh || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">Địa chỉ:</span>
              <span class="field-val">{{ info.dia_chi || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">SĐT:</span>
              <span class="field-val">{{ info.sdt || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">Tài khoản:</span>
              <span class="field-val">{{ info.tai_khoan || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">Vai trò:</span>
              <span class="field-val">{{ info.vai_tro || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-key">Quyền:</span>
              <span class="field-val">{{ info.quyen || '—' }}</span>
            </div>
            <div v-if="info.ghi_chu" class="field-row">
              <span class="field-key">Ghi chú:</span>
              <span class="field-val">{{ info.ghi_chu }}</span>
            </div>
          </div>

          <!-- NÚT ĐĂNG XUẤT -->
          <div class="account-logout-wrap">
            <button class="logout-btn" type="button" @click="handleLogout">
              <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="gearOpen" class="overlay-clear" @click="gearOpen = false" />

    <!-- MODAL XÁC NHẬN MẬT KHẨU -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="authModal" class="modal-overlay" @click="!submitting && closeAuth()">
          <div class="edit-box" @click.stop>
            <h3 class="edit-title">🔒 Xác nhận mật khẩu</h3>
            <p class="modal-desc">Nhập mật khẩu hiện tại để tiếp tục</p>
            <div class="edit-fields">
              <div class="edit-field">
                <label class="edit-label">Mật khẩu</label>
                <input 
                  class="edit-input" 
                  :class="{ 'edit-input--error': authError }"
                  v-model="authPass" 
                  type="password" 
                  placeholder="Nhập mật khẩu"
                  @keyup.enter="submitAuth" 
                />
                <span v-if="authError" class="edit-error">{{ authError }}</span>
              </div>
            </div>
            <div class="edit-actions">
              <button class="btn btn--red" :disabled="submitting" type="button" @click="submitAuth">
                {{ submitting ? 'Đang xác nhận...' : 'Xác nhận' }}
              </button>
              <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeAuth">Hủy</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL CẬP NHẬT THÔNG TIN -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editModal" class="modal-overlay" @click="!submitting && closeEditInfo()">
          <div class="edit-box" @click.stop>
            <h3 class="edit-title">✏️ Cập nhật thông tin</h3>
            <div class="edit-fields">
              <div class="edit-field">
                <label class="edit-label">Năm sinh</label>
                <input class="edit-input" v-model="editForm.nam_sinh" type="text" placeholder="VD: 2003" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Địa chỉ</label>
                <input class="edit-input" v-model="editForm.dia_chi" type="text" placeholder="Địa chỉ" />
              </div>
              <div class="edit-field">
                <label class="edit-label">SĐT</label>
                <input class="edit-input" v-model="editForm.sdt" type="tel" placeholder="SĐT" />
              </div>
            </div>
            <div class="edit-actions">
              <button class="btn btn--green" :disabled="submitting" type="button" @click="submitEditInfo">
                {{ submitting ? 'Đang lưu...' : 'Lưu' }}
              </button>
              <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeEditInfo">Hủy</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL ĐỔI MẬT KHẨU -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="passModal" class="modal-overlay" @click="!submitting && closeChangePass()">
          <div class="edit-box" @click.stop>
            <h3 class="edit-title">🔑 Thay đổi mật khẩu</h3>
            <div class="edit-fields">
              <div class="edit-field">
                <label class="edit-label">Mật khẩu mới</label>
                <input 
                  class="edit-input" 
                  :class="{ 'edit-input--error': passError }"
                  v-model="passForm.moi" 
                  type="password" 
                  placeholder="Mật khẩu mới" 
                />
              </div>
              <div class="edit-field">
                <label class="edit-label">Xác nhận mật khẩu mới</label>
                <input 
                  class="edit-input" 
                  :class="{ 'edit-input--error': passError }"
                  v-model="passForm.xacNhan" 
                  type="password" 
                  placeholder="Nhập lại mật khẩu mới" 
                />
                <span v-if="passError" class="edit-error">{{ passError }}</span>
              </div>
            </div>
            <div class="edit-actions">
              <button class="btn btn--green" :disabled="submitting" type="button" @click="submitChangePass">
                {{ submitting ? 'Đang lưu...' : 'Lưu' }}
              </button>
              <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeChangePass">Hủy</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TOAST -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
          <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'
import defaultAvatar from '../assets/lan.webp'

// Import Header Component dùng chung
import HeaderTitle from '../components/common/HeaderQuayLai.vue'

type UserInfo = {
  ma_ns: string; ten_ns: string; nam_sinh: string; dia_chi: string
  sdt: string; tai_khoan: string; anh_daidien: string
  vai_tro: string; quyen: string; ghi_chu: string
}

const router     = useRouter()
const loading    = ref(false)
const submitting = ref(false)
const info       = ref<UserInfo | null>(null)
const gearOpen   = ref(false)

const authModal  = ref(false)
const authPass   = ref('')
const authError  = ref('')
const authTarget = ref<'edit' | 'pass' | null>(null)

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
  try {
    const text = await res.text()
    if (!text || text.trim() === '') return { success: true }
    try { return JSON.parse(text) } catch { return { success: true, rawText: text } }
  } catch { return null }
}

const fetchInfo = async () => {
  const taiKhoan = getTaiKhoan()
  if (!taiKhoan) { showToast('Không tìm thấy thông tin đăng nhập!', 'error'); return }
  loading.value = true
  try {
    const res = await safeJson(await fetch(API_ENDPOINTS.GET_NHAN_SU_BY_TAI_KHOAN(taiKhoan)))
    if (!res)                                               { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { info.value = res.data }
    else                                                { showToast(res.message || 'Không tìm thấy tài khoản!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally { loading.value = false }
}

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
    if (!res)                                               { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { showToast('Cập nhật thành công!'); editModal.value = false; await fetchInfo() }
    else                                                { showToast(res.message || 'Cập nhật thất bại!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally { submitting.value = false }
}

const submitChangePass = async () => {
  passError.value = ''
  if (!passForm.value.moi)                             { passError.value = 'Vui lòng nhập mật khẩu mới!'; return }
  if (passForm.value.moi !== passForm.value.xacNhan) { passError.value = 'Mật khẩu xác nhận không khớp!'; return }
  if (!info.value) return
  submitting.value = true
  try {
    const url = API_ENDPOINTS.DOI_MAT_KHAU_BY_NV(info.value.ma_ns, passForm.value.moi)
    const res = await safeJson(await fetch(url))
    if (!res)                                               { showToast('Server lỗi!', 'error'); return }
    if (res.code === 200 || res.status === 'success') { showToast('Đổi mật khẩu thành công!'); passModal.value = false }
    else                                                { showToast(res.message || 'Đổi mật khẩu thất bại!', 'error') }
  } catch { showToast('Lỗi kết nối máy chủ!', 'error') }
  finally { submitting.value = false }
}

// ĐĂNG XUẤT: Xóa sạch toàn bộ localStorage
const handleLogout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(fetchInfo)
</script>

<style scoped>
.account-page { 
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #ffffff; 
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: none;
}

.account-page__content { 
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 6px 12px 40px; 
}

.loading-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 99999; pointer-events: all;
}

.loading-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 10px; color: #ffffff;
  font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.state-message         { text-align: center; padding: 24px 15px; font-weight: 700; color: #8f0000; font-size: 14px; }
.state-message--error { color: #dc2626; }

.account-card-wrap {
  max-width: 760px;
  margin: 0 auto;
}

.account-card { 
  position: relative; 
  max-width: 440px; 
  margin: 0 auto; 
  background: #fff; 
  border-radius: 10px; 
  padding: 16px 18px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); 
}

.gear-wrap { position: absolute; top: 12px; right: 12px; z-index: 10; }
.gear-btn  { background: none; border: none; padding: 0; font-size: 20px; cursor: pointer; line-height: 1; transition: transform .2s; }
.gear-btn:hover { transform: rotate(30deg); }

.gear-dropdown { 
  position: absolute; 
  top: calc(100% + 6px); 
  right: 0; 
  background: #fff; 
  border: 1px solid #e2e8f0; 
  border-radius: 8px; 
  padding: 6px; 
  box-shadow: 0 8px 24px rgba(0,0,0,.12); 
  min-width: 190px; 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
}

.gear-option { 
  border: none; 
  border-radius: 6px; 
  padding: 8px 10px; 
  font-size: 12px; 
  font-weight: 600; 
  cursor: pointer; 
  text-align: left; 
  background: transparent; 
  color: #1e293b; 
  transition: background .12s, color .12s; 
  white-space: nowrap; 
}
.gear-option:hover { background: #fff1f2; color: #8f0000; }

.overlay-clear { position: fixed; inset: 0; z-index: 9; }

.account-avatar { display: flex; justify-content: center; margin-bottom: 10px; }
.avatar-img { 
  width: 84px; 
  height: 84px; 
  border-radius: 50%; 
  object-fit: cover; 
  border: 3px solid #8f0000; 
  box-shadow: 0 2px 8px rgba(143, 0, 0, 0.15); 
}

.account-name { text-align: center; font-size: 16px; font-weight: 800; color: #8f0000; margin-bottom: 16px; }

.account-fields { display: flex; flex-direction: column; gap: 5px; }
.field-row { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 1.4; padding: 4px 0; border-bottom: 1px solid #f8fafc; }
.field-row:last-child { border-bottom: none; }
.field-key { font-weight: 700; color: #8f0000; min-width: 90px; flex-shrink: 0; }
.field-val { font-weight: 500; color: #334155; word-break: break-word; }

.account-logout-wrap {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  justify-content: center;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #b91c1c;
}

.logout-icon {
  width: 16px;
  height: 16px;
  stroke: #dc2626;
  transition: stroke 0.15s ease;
}

.logout-btn:hover .logout-icon {
  stroke: #b91c1c;
}

.skeleton-card { height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
.skeleton-avatar { width: 80px; height: 80px; border-radius: 50%; background: #e2e8f0; }
.skeleton-line { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; }
.skeleton-title { height: 16px; width: 40%; }
.skeleton-text { height: 12px; width: 80%; }
.skeleton-text.short { width: 50%; }
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.btn { border: none; border-radius: 999px; padding: 6px 14px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--red    { background: #8f0000; } .btn--red:hover:not(:disabled)    { background: #a50000; }
.btn--gray   { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }

.edit-box { background: #fff; border-radius: 12px; padding: 16px; width: 100%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
.edit-title  { margin: 0 0 12px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.modal-desc  { margin: 0 0 12px; font-size: 12px; color: #64748b; text-align: center; }
.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.edit-field  { display: flex; flex-direction: column; gap: 3px; }
.edit-label  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input  { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; background: #f8fafc; }
.edit-input:focus  { border-color: #2563eb; background: #fff; }
.edit-input--error { border-color: #dc2626 !important; }
.edit-error        { font-size: 11px; font-weight: 600; color: #dc2626; }
.edit-actions      { margin-top: 12px; display: flex; gap: 8px; }
.edit-actions .btn { flex: 1; padding: 8px; font-size: 13px; }

.toast-pill { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 30000; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

@media (max-width: 639px) {
  .account-card { padding: 12px 14px; }
  .avatar-img { width: 76px; height: 76px; }
  .account-name { font-size: 15px; }
  .field-row { font-size: 11px; }
  .field-key { min-width: 80px; }
  .btn { font-size: 11px; padding: 5px 12px; }
}
</style>