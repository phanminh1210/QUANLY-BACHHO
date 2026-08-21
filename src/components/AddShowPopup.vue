<template>
  <div v-if="visible" class="popup-backdrop" @click.self="closePopup">
    <div class="popup-card">
      <div class="popup-card__header">
        <h3 class="popup-card__title">Thêm Show</h3>
        <button class="popup-card__close" type="button" @click="closePopup">×</button>
      </div>

      <form class="popup-form" @submit.prevent="submitForm">
        <div class="popup-form__row">
          <label class="popup-form__label">Tên show <span class="popup-form__required">*</span></label>
          <div class="popup-form__control">
            <input v-model.trim="form.name" type="text" class="popup-form__input" :class="{ 'popup-form__input--error': errors.name }" placeholder="Nhập tên show" />
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
          <label class="popup-form__label">Ngày <span class="popup-form__required">*</span></label>
          <div class="popup-form__control">
            <input v-model="form.date" type="date" class="popup-form__input" :class="{ 'popup-form__input--error': errors.date }" />
            <p v-if="errors.date" class="popup-form__error">{{ errors.date }}</p>
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Giờ</label>
          <div class="popup-form__control">
            <input v-model.trim="form.time" type="text" class="popup-form__input" placeholder="VD: 19:30" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Tên khách hàng</label>
          <div class="popup-form__control">
            <input v-model.trim="form.customerName" type="text" class="popup-form__input" placeholder="Nhập tên khách hàng" />
          </div>
        </div>

        <div class="popup-form__row">
          <label class="popup-form__label">Địa chỉ <span class="popup-form__required">*</span></label>
          <div class="popup-form__control">
            <input v-model.trim="form.location" type="text" class="popup-form__input" :class="{ 'popup-form__input--error': errors.location }" placeholder="Nhập địa chỉ" />
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

        <div class="popup-form__row">
          <label class="popup-form__label">Số lượng lân</label>
          <div class="popup-form__control">
            <input v-model.number="form.so_lan" type="number" min="0" class="popup-form__input popup-form__input--qty" />
          </div>
        </div>

        <div class="popup-form__row"><label class="popup-form__label">Trống chính</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_trong" type="checkbox" /></div></div>
        <div class="popup-form__row"><label class="popup-form__label">Thần tài</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_than_tai" type="checkbox" /></div></div>
        <div class="popup-form__row"><label class="popup-form__label">Xỏa</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_xoa" type="checkbox" /></div></div>
        <div class="popup-form__row"><label class="popup-form__label">Lò</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_lo" type="checkbox" /></div></div>

        <div class="popup-form__row">
          <label class="popup-form__label">Trống hội</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_trong_hoi" type="checkbox" />
            <input v-if="form.co_trong_hoi" v-model.number="form.so_trong_hoi" type="number" min="0" class="popup-form__input popup-form__input--qty" placeholder="Số lượng" />
          </div>
        </div>

        <div class="popup-form__row"><label class="popup-form__label">Rồng đơn</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_rong_don" type="checkbox" /></div></div>
        <div class="popup-form__row"><label class="popup-form__label">Rồng gậy</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_rong_gay" type="checkbox" /></div></div>

        <div class="popup-form__row">
          <label class="popup-form__label">Rồng khúc</label>
          <div class="popup-form__control popup-form__inline">
            <input v-model="form.co_rong_khuc" type="checkbox" />
            <input v-if="form.co_rong_khuc" v-model.number="form.so_rong_khuc" type="number" min="0" class="popup-form__input popup-form__input--qty" placeholder="Số lượng" />
          </div>
        </div>

        <template v-if="isTrungThu">
          <hr class="popup-form__sep" />
          <div class="popup-form__row"><label class="popup-form__label">Ngộ không</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_ngo_khong" type="checkbox" /></div></div>
          <div class="popup-form__row"><label class="popup-form__label">Bát giới</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_bat_gioi" type="checkbox" /></div></div>
          <div class="popup-form__row"><label class="popup-form__label">Ông địa</label><div class="popup-form__control popup-form__inline"><input v-model="form.co_ong_dia" type="checkbox" /></div></div>
        </template>

        <div class="popup-form__actions">
          <button type="button" class="popup-form__btn popup-form__btn--cancel" @click="closePopup" :disabled="saving">Hủy</button>
          <button type="submit" class="popup-form__btn popup-form__btn--save" :disabled="saving">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { API_ENDPOINTS } from '../config/api'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const saving = ref(false)
const form = reactive({
  name: '', type: '', date: '', time: '', customerName: '', location: '', phone: '', price: '',
  so_lan: 0, co_trong: false, co_than_tai: false, co_xoa: false, co_lo: false,
  co_trong_hoi: false, so_trong_hoi: 0,
  co_rong_don: false, co_rong_gay: false, co_rong_khuc: false, so_rong_khuc: 0,
  co_ngo_khong: false, co_bat_gioi: false, co_ong_dia: false,
})
const errors = reactive({ name: '', date: '', location: '' })
const isTrungThu = computed(() => form.type === 'Trung thu')

watch(() => form.co_trong_hoi, (v) => { if (!v) form.so_trong_hoi = 0 })
watch(() => form.co_rong_khuc, (v) => { if (!v) form.so_rong_khuc = 0 })
watch(isTrungThu, (v) => { if (!v) { form.co_ngo_khong = false; form.co_bat_gioi = false; form.co_ong_dia = false } })

const clearErrors = () => { errors.name = ''; errors.date = ''; errors.location = '' }
const resetForm = () => {
  Object.assign(form, {
    name: '', type: '', date: '', time: '', customerName: '', location: '', phone: '', price: '',
    so_lan: 0, co_trong: false, co_than_tai: false, co_xoa: false, co_lo: false,
    co_trong_hoi: false, so_trong_hoi: 0, co_rong_don: false, co_rong_gay: false,
    co_rong_khuc: false, so_rong_khuc: 0, co_ngo_khong: false, co_bat_gioi: false, co_ong_dia: false,
  })
  clearErrors()
}

const closePopup = () => { if (!saving.value) emit('close') }

const validateForm = () => {
  clearErrors()
  if (!form.name) errors.name = 'Vui lòng nhập tên show'
  if (!form.date) errors.date = 'Vui lòng chọn ngày'
  if (!form.location) errors.location = 'Vui lòng nhập địa chỉ'
  return !errors.name && !errors.date && !errors.location
}

const submitForm = async () => {
  if (!validateForm() || saving.value) return
  saving.value = true

  const soLanNhanDoi = Number(form.so_lan || 0) * 2 // 1 lân = 2 bản ghi

  try {
    const url = API_ENDPOINTS.ADD_SHOW_AND_CHAMCONG_CHITIET({
      ten_show: form.name,
      ma_loai_show: form.type,
      ngay: form.date,
      gio: form.time,
      diachi: form.location,
      ten_khachhang: form.customerName,
      sdt: form.phone,

      so_lan: soLanNhanDoi,
      co_trong: !!form.co_trong,
      co_than_tai: !!form.co_than_tai,
      co_xoa: !!form.co_xoa,
      co_lo: !!form.co_lo,

      co_trong_hoi: !!form.co_trong_hoi,
      so_trong_hoi: Number(form.so_trong_hoi || 0),

      co_rong_don: !!form.co_rong_don,
      co_rong_gay: !!form.co_rong_gay,
      co_rong_khuc: !!form.co_rong_khuc,
      so_rong_khuc: Number(form.so_rong_khuc || 0),

      co_ngo_khong: !!form.co_ngo_khong,
      co_bat_gioi: !!form.co_bat_gioi,
      co_ong_dia: !!form.co_ong_dia,
    })

    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const ok = json?.code === 200 || json?.status === 'success'
    if (!ok) throw new Error(json?.message || 'Lưu thất bại')

    alert('Thêm show thành công')
    emit('saved')
    resetForm()
    emit('close')
  } catch (e: any) {
    alert(e?.message || 'Lưu thất bại')
  } finally {
    saving.value = false
  }
}

watch(() => props.visible, (val) => { if (!val) resetForm() })
</script>

<style scoped>
.popup-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px; }
.popup-card { width: 100%; max-width: 560px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18); }
.popup-card__header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: linear-gradient(180deg, #8f0000 0%, #a50000 100%); color: #fff; }
.popup-card__title { margin: 0; font-size: 16px; font-weight: 700; }
.popup-card__close { border: none; background: transparent; color: #fff; font-size: 24px; cursor: pointer; line-height: 1; }
.popup-form { padding: 16px; display: flex; flex-direction: column; gap: 10px; max-height: 82vh; overflow: auto; }
.popup-form__row { display: grid; grid-template-columns: 150px 1fr; align-items: center; gap: 10px; }
.popup-form__label { font-size: 13px; font-weight: 700; color: #8f0000; white-space: nowrap; }
.popup-form__required { color: #dc2626; }
.popup-form__control { min-width: 0; }
.popup-form__inline { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.popup-form__input { width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 10px; padding: 10px 12px; font-size: 14px; outline: none; background: #fff; min-height: 40px; }
.popup-form__input:focus { border-color: #8f0000; }
.popup-form__input--qty { width: 130px; min-height: 38px; padding: 8px 10px; }
.popup-form__input--error { border-color: #dc2626; }
.popup-form__error { margin: 4px 0 0; font-size: 12px; color: #dc2626; }
.popup-form__sep { border: none; border-top: 1px dashed #e5e7eb; margin: 4px 0 2px; }
.popup-form__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
.popup-form__btn { border: none; border-radius: 999px; padding: 9px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
.popup-form__btn--cancel { background: #eee; color: #333; }
.popup-form__btn--save { background: #8f0000; color: #fff; }
.popup-form__btn:disabled { opacity: 0.65; cursor: not-allowed; }

@media (max-width: 640px) {
  .popup-card { max-width: 100%; }
  .popup-form__row { grid-template-columns: 120px 1fr; gap: 8px; }
  .popup-form__input { font-size: 16px; min-height: 42px; }
  .popup-form__input--qty { width: 110px; }
}
</style>