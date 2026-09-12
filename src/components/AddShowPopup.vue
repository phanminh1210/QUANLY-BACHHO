<template>
  <div v-if="visible" class="popup-backdrop" @click.self="closePopup">
    <div class="popup-card">
      <div class="popup-card__header">
        <h3 class="popup-card__title">Thêm Show</h3>
        <button class="popup-card__close" type="button" @click="closePopup">×</button>
      </div>

      <!-- TOAST THÔNG BÁO -->
      <transition name="toast">
        <div v-if="toast.show" class="popup-toast" :class="toast.type === 'success' ? 'popup-toast--success' : 'popup-toast--error'">
          {{ toast.message }}
        </div>
      </transition>

      <form class="popup-form" @submit.prevent="submitForm">

        <div class="popup-form__row">
          <label class="popup-form__label">Tên show <span class="req">*</span></label>
          <div class="popup-form__control">
            <input v-model.trim="form.name" type="text" class="popup-form__input"
              :class="{ err: errors.name }" placeholder="Nhập tên show" />
            <p v-if="errors.name" class="popup-form__error">{{ errors.name }}</p>
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Loại show</label>
          <div class="popup-form__control">
            <select v-model="form.type" class="popup-form__input">
              <option value="">-- Chọn loại show --</option>
              <option value="Khai trương">Khai trương</option>
              <option value="Động thổ">Động thổ</option>
              <option value="Khánh thành">Khánh thành</option>
              <option value="Lễ Hội">Lễ Hội</option>
              <option value="Trung thu">Trung thu</option>
              <option value="Đám cưới">Đám cưới</option>
              <option value="Mừng thọ">Mừng thọ</option>
              <option value="Xông đất">Xông đất</option>
              <option value="Sinh nhật">Sinh nhật</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Ngày <span class="req">*</span></label>
          <div class="popup-form__control">
            <input v-model="form.date" type="date" class="popup-form__input"
              :class="{ err: errors.date }" />
            <p v-if="errors.date" class="popup-form__error">{{ errors.date }}</p>
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Giờ</label>
          <div class="popup-form__control">
            <input
              v-model="form.time"
              type="text"
              class="popup-form__input"
              placeholder="VD: 19:30"
              maxlength="5"
              @input="formatTimeInput"
            />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Tên khách hàng</label>
          <div class="popup-form__control">
            <input v-model.trim="form.customerName" type="text" class="popup-form__input" placeholder="Nhập tên khách hàng" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Địa chỉ <span class="req">*</span></label>
          <div class="popup-form__control">
            <input v-model.trim="form.location" type="text" class="popup-form__input"
              :class="{ err: errors.location }" placeholder="Nhập địa chỉ" />
            <p v-if="errors.location" class="popup-form__error">{{ errors.location }}</p>
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">SĐT</label>
          <div class="popup-form__control">
            <input v-model.trim="form.phone" type="tel" class="popup-form__input" placeholder="Nhập số điện thoại" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Giá</label>
          <div class="popup-form__control">
            <input v-model.trim="form.price" type="text" class="popup-form__input" placeholder="Nhập giá" />
          </div>
        </div>

        <hr class="popup-form__sep" />
        <p class="popup-form__section-title">🥁 Thành phần biểu diễn</p>

        <div class="popup-form__row">
          <label class="popup-form__label">Số lượng lân</label>
          <div class="popup-form__control">
            <input v-model.number="form.so_lan" type="number" min="0"
              class="popup-form__input popup-form__input--qty" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Trống chính</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_trong" type="checkbox" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Thần tài</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_than_tai" type="checkbox" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Xỏa</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_xoa" type="checkbox" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Lò</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_lo" type="checkbox" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Trống hội</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_trong_hoi" type="checkbox" />
            <input v-if="form.co_trong_hoi" v-model.number="form.so_trong_hoi"
              type="number" min="0" class="popup-form__input popup-form__input--qty" placeholder="Số lượng" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Rồng đơn</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_rong_don" type="checkbox" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Rồng gậy</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_rong_gay" type="checkbox" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Rồng khúc</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_rong_khuc" type="checkbox" />
            <input v-if="form.co_rong_khuc" v-model.number="form.so_rong_khuc"
              type="number" min="0" class="popup-form__input popup-form__input--qty" placeholder="Số lượng" />
            <span v-if="form.co_rong_khuc && form.so_rong_khuc > 0" class="popup-form__hint-inline">
              → {{ form.so_rong_khuc }} bản ghi
            </span>
          </div>
        </div>

        <template v-if="isTrungThu">
          <hr class="popup-form__sep" />
          <p class="popup-form__section-title">🌙 Nhân vật Trung thu</p>
          <div class="popup-form__row">
            <label class="popup-form__label">Ngộ không</label>
            <div class="popup-form__control popup-form__inline">
              <input v-model="form.co_ngo_khong" type="checkbox" />
            </div>
          </div>
          <div class="popup-form__row">
            <label class="popup-form__label">Bát giới</label>
            <div class="popup-form__control popup-form__inline">
              <input v-model="form.co_bat_gioi" type="checkbox" />
            </div>
          </div>
          <div class="popup-form__row">
            <label class="popup-form__label">Ông địa</label>
            <div class="popup-form__control popup-form__inline">
              <input v-model="form.co_ong_dia" type="checkbox" />
            </div>
          </div>
        </template>

        <!-- TỔNG BẢN GHI -->
        <div v-if="tongBanGhi > 0" class="popup-form__summary">
          Tổng là <strong>{{ tongBanGhi }}</strong> nhân sự cho show này
        </div>

        <div class="popup-form__actions">
          <ButtonHuy 
            :disabled="saving" 
            @click="closePopup" 
          />
          
          <ButtonLuu 
            type="submit" 
            :text="saving ? 'Đang lưu...' : 'Lưu'" 
            :disabled="saving" 
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { API_ENDPOINTS } from '../config/api'
import ButtonLuu from '../components/common/ButtonLuu.vue'
import ButtonHuy from '../components/common/ButtonHuy.vue'

const props = defineProps<{ visible: boolean }>()
const emit  = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const saving = ref(false)

// ── TOAST ──
const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'success' | 'error') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.message = message
  toast.type    = type
  toast.show    = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

const formatTimeInput = (e: Event) => {
  const input = e.target as HTMLInputElement

  // Chỉ giữ số và dấu :
  let val = input.value.replace(/[^\d:]/g, '')

  // Nếu người dùng tự gõ dấu : thì xử lý
  if (val.includes(':')) {
    const parts = val.split(':')
    let hh = parts[0].slice(0, 2)
    let mm = (parts[1] || '').slice(0, 2)

    // Validate giờ
    if (hh.length === 2) {
      let h = parseInt(hh)
      if (h > 23) hh = '23'
    }
    // Validate phút
    if (mm.length === 2) {
      let m = parseInt(mm)
      if (m > 59) mm = '59'
    }

    val = hh + ':' + mm
  } else {
    // Chưa có dấu : → chỉ là số thuần
    const digits = val.replace(/\D/g, '').slice(0, 4)

    if (digits.length >= 3) {
      // Tự chèn : sau 2 số đầu
      let hh = digits.slice(0, 2)
      let mm = digits.slice(2, 4)
      let h  = parseInt(hh)
      if (h > 23) hh = '23'
      val = hh + ':' + mm
    } else {
      val = digits
    }
  }

  form.time   = val
  input.value = val
}

const form = reactive({
  name: '', type: '', date: '', time: '',
  customerName: '', location: '', phone: '', price: '',
  so_lan: 0,
  co_trong: false, co_than_tai: false, co_xoa: false, co_lo: false,
  co_trong_hoi: false, so_trong_hoi: 0,
  co_rong_don: false, co_rong_gay: false,
  co_rong_khuc: false, so_rong_khuc: 0,
  co_ngo_khong: false, co_bat_gioi: false, co_ong_dia: false,
})

const errors   = reactive({ name: '', date: '', location: '' })
const isTrungThu = computed(() => form.type === 'Trung thu')

const tongBanGhi = computed(() => {
  let t = form.so_lan * 2
  if (form.co_trong)     t += 1
  if (form.co_than_tai)  t += 1
  if (form.co_xoa)       t += 1
  if (form.co_lo)        t += 1
  if (form.co_trong_hoi) t += (form.so_trong_hoi || 0)
  if (form.co_rong_don)  t += 1
  if (form.co_rong_gay)  t += 1
  if (form.co_rong_khuc) t += (form.so_rong_khuc || 0)
  if (isTrungThu.value) {
    if (form.co_ngo_khong) t += 1
    if (form.co_bat_gioi)  t += 1
    if (form.co_ong_dia)   t += 1
  }
  return t
})

watch(() => form.co_trong_hoi, v => { if (!v) form.so_trong_hoi = 0 })
watch(() => form.co_rong_khuc, v => { if (!v) form.so_rong_khuc = 0 })
watch(isTrungThu, v => {
  if (!v) { form.co_ngo_khong = false; form.co_bat_gioi = false; form.co_ong_dia = false }
})

const clearErrors = () => { errors.name = ''; errors.date = ''; errors.location = '' }
const resetForm = () => {
  Object.assign(form, {
    name: '', type: '', date: '', time: '',
    customerName: '', location: '', phone: '', price: '',
    so_lan: 0,
    co_trong: false, co_than_tai: false, co_xoa: false, co_lo: false,
    co_trong_hoi: false, so_trong_hoi: 0,
    co_rong_don: false, co_rong_gay: false,
    co_rong_khuc: false, so_rong_khuc: 0,
    co_ngo_khong: false, co_bat_gioi: false, co_ong_dia: false,
  })
  clearErrors()
}

const closePopup = () => { if (!saving.value) emit('close') }

const validateForm = () => {
  clearErrors()
  if (!form.name)     errors.name     = 'Vui lòng nhập tên show'
  if (!form.date)     errors.date     = 'Vui lòng chọn ngày'
  if (!form.location) errors.location = 'Vui lòng nhập địa chỉ'
  return !errors.name && !errors.date && !errors.location
}

const submitForm = async () => {
  if (!validateForm() || saving.value) return
  saving.value = true

  try {
    // BƯỚC 1: Thêm show → nhận ma_show tự tăng
    const urlShow = API_ENDPOINTS.THEM_SHOW({
      ten_show:      form.name,
      ngay:          form.date,
      diachi:        form.location,
      gio:           form.time,
      ten_khachhang: form.customerName,
      sdt:           form.phone,
      ma_loai_show:  form.type,
      trang_thai:    'chưa diễn',
    })

    const resShow  = await fetch(urlShow)
    if (!resShow.ok) throw new Error(`HTTP ${resShow.status}`)
    const jsonShow = await resShow.json()
    if (!jsonShow?.success) throw new Error(jsonShow?.message || 'Thêm show thất bại')

    const maShow = jsonShow.data.ma_show

    // BƯỚC 2: Thêm bản ghi chấm công
    if (tongBanGhi.value > 0) {
      const urlCC = API_ENDPOINTS.THEM_DANH_SACH_VAI_TRO_SHOW({
        ma_show:      maShow,
        ten_show:      form.name,
        ngay_lamviec: form.date,
        so_lan:        form.so_lan,
        so_trong_hoi: form.co_trong_hoi ? form.so_trong_hoi : 0,
        so_chinh:      form.co_trong ? 1 : 0,
        co_than_tai:  form.co_than_tai,
        co_xoa:        form.co_xoa,
        co_lo:         form.co_lo,
        co_rong_don:  form.co_rong_don,
        co_rong_gay:  form.co_rong_gay,
        so_rong_khuc: form.co_rong_khuc ? form.so_rong_khuc : 0,
        co_ngo_khong: form.co_ngo_khong,
        co_bat_gioi:  form.co_bat_gioi,
        co_ong_dia:   form.co_ong_dia,
      })

      const resCC    = await fetch(urlCC)
      if (!resCC.ok) throw new Error(`HTTP ${resCC.status}`)
      const jsonCC = await resCC.json()
      if (!jsonCC?.success) throw new Error(jsonCC?.message || 'Thêm chấm công thất bại')

      showToast(`Thêm show thành công! Mã: ${maShow} — ${jsonCC.data.tong_ban_ghi} bản ghi chấm công`, 'success')
    } else {
      showToast(`Thêm show thành công! Mã: ${maShow}`, 'success')
    }

    emit('saved')
    resetForm()
    setTimeout(() => emit('close'), 1500)  // đóng sau 1.5s để thấy toast

  } catch (e: any) {
    showToast(e?.message || 'Lưu thất bại', 'error')
  } finally {
    saving.value = false
  }
}

watch(() => props.visible, val => { if (!val) resetForm() })
</script>

<style scoped>
.popup-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000; padding: 16px;
}
.popup-card {
  width: 100%; max-width: 560px; background: #fff;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 18px 40px rgba(0,0,0,.18);
  position: relative;
}
.popup-card__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(180deg, #8f0000 0%, #a50000 100%);
  color: #fff;
}
.popup-card__title { margin: 0; font-size: 16px; font-weight: 700; }
.popup-card__close { border: none; background: transparent; color: #fff; font-size: 24px; cursor: pointer; line-height: 1; }

/* ── TOAST ── */
.popup-toast {
  position: absolute;
  top: 56px;          /* ngay dưới header */
  left: 12px;
  right: 12px;
  z-index: 10;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}
.popup-toast--success { background: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
.popup-toast--error   { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }

.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px); }

.popup-form {
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
  max-height: 82vh; overflow-y: auto;
}
.popup-form__section-title { margin: 0; font-size: 12px; font-weight: 800; color: #8f0000; }
.popup-form__row { display: grid; grid-template-columns: 130px 1fr; align-items: center; gap: 10px; }
.popup-form__label { font-size: 13px; font-weight: 700; color: #8f0000; white-space: nowrap; }
.req { color: #dc2626; }
.popup-form__control { min-width: 0; }
.popup-form__inline  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.popup-form__input {
  width: 100%; box-sizing: border-box;
  border: 1px solid #ddd; border-radius: 10px;
  padding: 9px 12px; font-size: 14px; outline: none;
  background: #fff; min-height: 40px;
}
.popup-form__input:focus  { border-color: #8f0000; }
.popup-form__input--qty   { width: 100px; min-height: 38px; padding: 7px 10px; }
.popup-form__input.err    { border-color: #dc2626; }

.popup-form__error       { margin: 4px 0 0; font-size: 12px; color: #dc2626; }
.popup-form__hint        { margin: 3px 0 0; font-size: 11px; color: #16a34a; font-weight: 600; }
.popup-form__hint-inline { font-size: 11px; color: #16a34a; font-weight: 600; white-space: nowrap; }
.popup-form__sep         { border: none; border-top: 1px dashed #e5e7eb; margin: 4px 0 2px; }

.popup-form__summary {
  background: #fff7ed; border: 1px solid #fdba74;
  border-radius: 10px; padding: 10px 14px;
  font-size: 13px; color: #9a3412; font-weight: 600; text-align: center;
}
.popup-form__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

@media (max-width: 640px) {
  .popup-card { max-width: 100%; }
  .popup-form__row { grid-template-columns: 110px 1fr; gap: 8px; }
  .popup-form__input { font-size: 16px; min-height: 42px; }
  .popup-form__input--qty { width: 90px; }
}
</style>