<template>
  <div class="schedule-page">
    <!-- HEADER -->
    <header class="schedule-page__header">
      <div class="schedule-page__inner header-content">
        <button class="back-btn" type="button" @click="goBack" aria-label="Quay lại">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="header-title">Ứng tiền cho nhân sự</span>
      </div>
    </header>

    <!-- CONTENT -->
    <section class="schedule-page__content">
      <div class="table-card">
        <h3 class="sub-title">ỨNG TIỀN CHO NHÂN SỰ</h3>

        <!-- 1. KHUNG HIỂN THỊ SKELETON KHI ĐANG LOADING -->
        <div v-if="loadingNS" class="form-content">
          <div class="form-group">
            <div class="skeleton-text skeleton-text--short" style="margin-bottom: 6px;"></div>
            <div class="skeleton-text" style="width: 100%; height: 36px;"></div>
          </div>

          <div class="form-group">
            <div class="skeleton-text skeleton-text--short" style="margin-bottom: 6px;"></div>
            <div class="skeleton-text" style="width: 100%; height: 38px;"></div>
            <div class="quick-amounts" style="margin-top: 6px;">
              <div v-for="i in 5" :key="i" class="skeleton-text" style="width: 100%; height: 28px;"></div>
            </div>
          </div>

          <div class="form-group">
            <div class="skeleton-text skeleton-text--short" style="margin-bottom: 6px;"></div>
            <div class="skeleton-text" style="width: 100%; height: 50px;"></div>
          </div>

          <div class="skeleton-text" style="width: 100%; height: 40px; margin-top: 4px; border-radius: 8px;"></div>
        </div>

        <!-- 2. FORM CHÍNH KHI ĐÃ TẢI XONG -->
        <form v-else @submit.prevent="handleSubmit" class="form-content">
          <!-- CHỌN NHÂN SỰ -->
          <div class="form-group">
            <label class="form-label">Nhân sự tạm ứng <span class="required">*</span></label>
            <div class="input-wrapper">
              <select 
                v-model="selectedNhanSu" 
                class="form-control select-ns" 
                :class="{ 'has-selected': selectedNhanSu !== '' }"
                required
              >
                <option value="" disabled>-- Chọn nhân sự --</option>
                <option 
                  v-for="(ns, index) in listNhanSu" 
                  :key="index" 
                  :value="typeof ns === 'string' ? ns : (ns.ten_ns || ns.ten || ns)"
                >
                  {{ typeof ns === 'string' ? ns : (ns.ten_ns || ns.ten || ns) }}
                </option>
              </select>
            </div>
          </div>

          <!-- SỐ TIỀN ỨNG -->
          <div class="form-group">
            <label class="form-label">Số tiền ứng <span class="required">*</span></label>
            <div class="input-wrapper amount-wrapper">
              <input
                type="text"
                inputmode="numeric"
                class="form-control amount-input"
                v-model="displayAmount"
                @keydown="preventNonNumeric"
                @input="handleAmountInput"
                placeholder="0"
                required
              />
              <span class="currency-symbol">đ</span>
            </div>

            <!-- Các nút chọn nhanh -->
            <div class="quick-amounts">
              <button
                type="button"
                v-for="preset in presets"
                :key="preset"
                class="btn-preset"
                :class="{ 
                  active: selectedPreset === preset,
                  dimmed: selectedPreset !== null && selectedPreset !== preset
                }"
                @click="selectPreset(preset)"
              >
                {{ formatCurrency(preset) }}
              </button>
              <button
                type="button"
                class="btn-preset"
                :class="{ 
                  active: selectedPreset === 'khac',
                  dimmed: selectedPreset !== null && selectedPreset !== 'khac'
                }"
                @click="selectPreset('khac')"
              >
                Khác
              </button>
            </div>
          </div>

          <!-- GHI CHÚ -->
          <div class="form-group">
            <label class="form-label">Ghi chú</label>
            <textarea
              v-model="ghiChu"
              class="form-control textarea-input"
              rows="2"
              placeholder="Nội dung"
            ></textarea>
          </div>

          <!-- NÚT XÁC NHẬN -->
          <button type="submit" class="btn-submit" :disabled="submitting">
            <span v-if="submitting">Đang xử lý...</span>
            <span v-else>XÁC NHẬN ỨNG TIỀN</span>
          </button>
        </form>

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'

const router = useRouter()

const listNhanSu = ref<any[]>([])
const loadingNS = ref(false)
const submitting = ref(false)

const selectedNhanSu = ref('')
const rawAmount = ref<number | ''>('')
const displayAmount = ref('')
const selectedPreset = ref<number | 'khac' | null>(null)
const ghiChu = ref('')

const presets = [100000, 200000, 500000, 1000000]

const goBack = () => {
  window.history.back()
}

const formatCurrency = (val: number | string) => {
  if (!val && val !== 0) return ''
  const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('vi-VN').format(num)
}

const fetchNhanSu = async () => {
  loadingNS.value = true
  try {
    const endpoint = API_ENDPOINTS.LAY_TAT_CA_TEN_NHAN_SU 
    const res = await fetch(endpoint)
    const result = await res.json()
    
    if (result && Array.isArray(result.data)) {
      listNhanSu.value = result.data
    } else if (Array.isArray(result)) {
      listNhanSu.value = result
    } else if (result && Array.isArray(result.result)) {
      listNhanSu.value = result.result
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân sự:', error)
  } finally {
    loadingNS.value = false
  }
}

// Chặn ký tự chữ ngay khi nhấn phím
const preventNonNumeric = (e: KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowedKeys.includes(e.key) || (e.ctrlKey || e.metaKey)) {
    return
  }
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault()
  }
}

// Lọc định dạng tiền
const handleAmountInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const cleanVal = input.value.replace(/\D/g, '')
  
  if (!cleanVal) {
    rawAmount.value = ''
    displayAmount.value = ''
    selectedPreset.value = null
    return
  }

  const num = parseInt(cleanVal, 10)
  rawAmount.value = num
  displayAmount.value = formatCurrency(num)

  if (presets.includes(num)) {
    selectedPreset.value = num
  } else {
    selectedPreset.value = 'khac'
  }
}

const selectPreset = (val: number | 'khac') => {
  selectedPreset.value = val
  if (val === 'khac') return
  rawAmount.value = val
  displayAmount.value = formatCurrency(val)
}

const handleSubmit = async () => {
  if (!selectedNhanSu.value) {
    alert('Vui lòng chọn nhân sự!')
    return
  }
  if (!rawAmount.value || Number(rawAmount.value) <= 0) {
    alert('Vui lòng nhập số tiền ứng hợp lệ!')
    return
  }

  submitting.value = true
  try {
    const endpoint = '' 
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ten_ns: selectedNhanSu.value,
        so_tien: rawAmount.value,
        ghi_chu: ghiChu.value,
        ngay_ung: new Date().toISOString()
      })
    })

    const res = await response.json()
    if (res.status === 'success' || res.success) {
      alert('Tạm ứng tiền thành công!')
      router.push('/tien-ung')
    } else {
      alert(res.message || 'Có lỗi xảy ra khi ứng tiền!')
    }
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu ứng tiền:', error)
    alert('Lỗi kết nối máy chủ!')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchNhanSu()
})
</script>

<style scoped>
@import '../styles/loading.css';

:global(html, body) {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  overflow: hidden !important;
}

.schedule-page { 
  height: 100vh;
  height: 100dvh; 
  width: 100%;
  background: #ffffff; 
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  box-sizing: border-box;
  overscroll-behavior: none;
}

.schedule-page__header { 
  background: #ffffff; 
  padding: 8px 12px; 
  flex-shrink: 0;
}

.schedule-page__inner { max-width: 760px; margin: 0 auto; }
.header-content { display: flex; align-items: center; gap: 8px; }
.back-btn { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 50%; }
.back-btn:hover { background-color: #f1f5f9; }
.back-icon { width: 20px; height: 20px; stroke: #8f0000; flex-shrink: 0; }
.header-title { font-size: 15px; font-weight: 700; color: #8f0000; user-select: none; }

.schedule-page__content { 
  flex: 1;
  min-height: 0;
  padding: 4px 10px 10px; 
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.table-card { 
  width: 100%; 
  max-width: 760px; 
  margin: 0 auto; 
  background: #ffffff; 
  border-radius: 8px; 
  padding: 10px 12px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03); 
  box-sizing: border-box; 
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.sub-title { margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #8f0000; flex-shrink: 0; text-align: center; }

.form-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-label {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 5px;
  text-align: left;
}

.required { color: #dc2626; }

/* CHỈNH TẤT CẢ Ô FORM CONTROL VỀ VIỀN NHẠT & NỀN XÁM NHẸ */
.form-control {
  width: 100%;
  padding: 8px 10px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1; /* Viền nhạt dịu mắt */
  outline: none;
  background-color: #f8fafc; /* Nền xám nhạt */
  color: #000000;
  font-weight: 600;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #94a3b8;
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.15);
}

/* Ô CHỌN NHÂN SỰ */
.select-ns {
  cursor: pointer;
  appearance: none;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  text-align-last: center;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  padding: 10px 32px 10px 12px;
}

/* KHI ĐÃ CHỌN NHÂN SỰ SẼ ẨN VIỀN */
.select-ns.has-selected {
  border-color: transparent !important;
  box-shadow: none !important;
  background-color: #f1f5f9;
}

.select-ns option {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.amount-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Ô SỐ TIỀN ỨNG */
.amount-input {
  font-size: 16px;
  font-weight: 800;
  color: #dc2626;
  text-align: center;
  padding-right: 28px;
}

.currency-symbol {
  position: absolute;
  right: 10px;
  font-size: 14px;
  font-weight: 800;
  color: #dc2626;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 6px;
}

/* NÚT MỆNH GIÁ TỰ NGHỆCH VIỀN NHẠT */
.btn-preset {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 2px;
  font-size: 11px;
  font-weight: 700;
  color: #000000;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.btn-preset.active {
  background: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
  font-weight: 800;
  opacity: 1 !important;
}

.btn-preset.dimmed {
  opacity: 0.45;
  border-color: #e2e8f0;
}

.btn-preset.dimmed:hover {
  opacity: 0.8;
  border-color: #94a3b8;
}

.textarea-input {
  resize: none;
  font-weight: 500;
}

.btn-submit {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  text-align: center;
  margin-top: 4px;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 639px) {
  .header-title { font-size: 14px; }
}
</style>