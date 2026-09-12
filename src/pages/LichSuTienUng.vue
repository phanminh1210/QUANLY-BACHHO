<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { API_ENDPOINTS } from '../config/api'
import '../styles/loading.css'
import HeaderQuayLai from '../components/common/HeaderQuayLai.vue'

interface AdvanceItem {
  id?: string
  ten_ns: string
  ngay_ung: string
  so_tien_ung: number | string
  ghi_chu?: string
}

const currentDate = new Date()
const selectedMonth = ref<number | string>('')
const selectedYear = ref<number | string>('')
const selectedTenNs = ref<string>('')

const currentYearNum = currentDate.getFullYear()
const availableYears = computed(() => {
  const years = []
  for (let y = currentYearNum - 3; y <= currentYearNum + 2; y++) years.push(y)
  return years
})

const advanceList = ref<AdvanceItem[]>([])
const loading = ref<boolean>(false)
const errorMsg = ref<string>('')

const danhSachTen = ref<string[]>([])

const getUserFromLocalStorage = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) return JSON.parse(userStr)
  } catch (e) {
    console.error('Lỗi khi đọc user:', e)
  }
  return null
}

const getRoleFromLocalStorage = (): string => {
  const directRole = localStorage.getItem('vai_tro')
  if (directRole) return directRole.trim().toLowerCase()

  const userObj = getUserFromLocalStorage()
  return (userObj?.vai_tro || userObj?.role || '').toString().trim().toLowerCase()
}

const isAdminRole = computed(() => getRoleFromLocalStorage() === 'admin')

const getTenNsFromLocalStorage = (): string => {
  const userObj = getUserFromLocalStorage()
  return userObj?.ten_ns || userObj?.ho_ten || userObj?.fullName || localStorage.getItem('ten_ns') || ''
}

// Gọi API lấy dữ liệu tiền ứng
const fetchTienUng = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    // Nếu chọn Tháng mà KHÔNG chọn Năm -> Mặc định lấy Năm hiện tại
    const yearToFetch = selectedMonth.value && !selectedYear.value 
      ? currentYearNum 
      : selectedYear.value

    const tenNs = isAdminRole.value ? selectedTenNs.value : getTenNsFromLocalStorage()

    const url = API_ENDPOINTS.LAY_SO_TIEN_UNG_THEO_NS(
      tenNs,
      selectedMonth.value,
      yearToFetch
    )

    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    let res: any = await response.json()
    if (typeof res === 'string') {
      try { res = JSON.parse(res) } catch (_) {}
    }

    if ((res?.code === 200 || res?.status === 'success') && Array.isArray(res?.data)) {
      advanceList.value = res.data
    } else if (Array.isArray(res)) {
      advanceList.value = res
    } else {
      advanceList.value = []
    }
  } catch (err: any) {
    errorMsg.value = 'Không thể kết nối dữ liệu máy chủ.'
    console.error('Lỗi gọi API TienUng:', err)
    advanceList.value = []
  } finally {
    loading.value = false
  }
}

// Tải danh sách tên nhân sự (Chỉ chạy khi là Admin)
const fetchDanhSachTen = async () => {
  if (!isAdminRole.value) return
  try {
    const res = await fetch(API_ENDPOINTS.LAY_TAT_CA_TEN_NHAN_SU, { redirect: 'follow' })
    const json = JSON.parse(await res.text())
    if (json && Array.isArray(json.data)) danhSachTen.value = json.data
  } catch (e) {
    console.error('Lỗi khi tải danh sách tên nhân sự:', e)
  }
}

const moneyToNumber = (val: unknown) => {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0
  const raw = String(val ?? '').trim()
  if (!raw) return 0

  let normalized = raw.replace(/[^\d,.-]/g, '')
  if (normalized.includes('.') && normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else {
    const dotThousands = /^\d{1,3}(\.\d{3})+$/.test(normalized)
    const commaThousands = /^\d{1,3}(,\d{3})+$/.test(normalized)
    if (dotThousands) normalized = normalized.replace(/\./g, '')
    if (commaThousands) normalized = normalized.replace(/,/g, '')
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

const formatMoney = (n: number) => `${n.toLocaleString('vi-VN')}đ`

const formatDateDisplay = (rawDate: unknown): string => {
  if (!rawDate) return ''
  let s = String(rawDate).trim()

  if (s.includes('T')) s = s.split('T')[0]
  else if (s.includes(' ')) s = s.split(' ')[0]

  if (s.includes('-') || s.includes('/')) {
    const sep = s.includes('-') ? '-' : '/'
    const parts = s.split(sep)
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const [yyyy, mm, dd] = parts
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`
      } else {
        const [dd, mm, yyyy] = parts
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`
      }
    }
  }

  return s
}

const goBack = () => window.history.back()

watch([selectedMonth, selectedYear, selectedTenNs], fetchTienUng)

onMounted(async () => {
  await fetchTienUng()
  
  if (isAdminRole.value) {
    fetchDanhSachTen()
  }
})

const totalAdvanceMoney = computed(() => {
  const total = advanceList.value.reduce((sum, item) => sum + moneyToNumber(item.so_tien_ung), 0)
  return formatMoney(total)
})

const displayTitleText = computed(() => {
  if (selectedMonth.value && selectedYear.value) {
    return `Tiền ứng Tháng ${selectedMonth.value}/${selectedYear.value}`
  } else if (selectedMonth.value) {
    return `Tiền ứng Tháng ${selectedMonth.value}/${currentYearNum}`
  } else if (selectedYear.value) {
    return `Tiền ứng Năm ${selectedYear.value}`
  }
  return 'Tất cả tiền ứng'
})
</script>

<template>
  <div class="schedule-page">
    <HeaderQuayLai title="Lịch sử tiền ứng nhân sự" />

    <section class="schedule-page__content">
      <div class="table-card">
        <div class="filter-bar-text">
          <!-- Dòng 1: Tìm theo tên nhân sự (Chỉ Admin mới hiển thị) -->
          <div v-if="isAdminRole" class="filter-row filter-row--top">
            <div class="filter-item filter-item--full">
              <span class="filter-item__label">Nhân sự:</span>
              <select v-model="selectedTenNs" class="filter-item__control picker-select picker-select--full">
                <option value="">Tất cả nhân sự</option>
                <option v-for="(ten, idx) in danhSachTen" :key="idx" :value="ten">{{ ten }}</option>
              </select>
            </div>
          </div>

          <!-- Dòng 2: Lọc theo Tháng & Năm -->
          <div class="filter-row filter-row--bottom">
            <div class="filter-item">
              <span class="filter-item__label">Tháng:</span>
              <select v-model="selectedMonth" class="filter-item__control picker-select">
                <option value="">Tất cả</option>
                <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
              </select>
            </div>

            <div class="filter-item">
              <span class="filter-item__label">Năm:</span>
              <select v-model="selectedYear" class="filter-item__control picker-select">
                <option value="">Tất cả</option>
                <option v-for="y in availableYears" :key="y" :value="y">Năm {{ y }}</option>
              </select>
            </div>
          </div>
        </div>

        <h3 class="sub-title">{{ displayTitleText }}</h3>

        <div class="table-wrapper">
          <table class="monthly-table compact-table">
            <thead>
              <tr>
                <th class="col-stt">#</th>
                <th class="col-name">Tên Nhân Sự</th>
                <th class="col-date">Ngày Ứng</th>
                <th class="col-salary">Số Tiền Ứng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="loading-container">
                  <div class="custom-spinner"></div>
                </td>
              </tr>

              <tr v-else-if="errorMsg">
                <td colspan="4" class="state-message state-message--error">{{ errorMsg }}</td>
              </tr>

              <tr v-else-if="advanceList.length === 0">
                <td colspan="4" class="empty-cell">Không có dữ liệu ứng tiền cho bộ lọc hiện tại</td>
              </tr>

              <template v-else>
                <tr v-for="(item, index) in advanceList" :key="item.id || index">
                  <td class="col-stt">{{ index + 1 }}</td>
                  <td class="col-name">{{ item.ten_ns || getTenNsFromLocalStorage() }}</td>
                  <td class="col-date">{{ formatDateDisplay(item.ngay_ung) }}</td>
                  <td class="col-salary money-cell">{{ formatMoney(moneyToNumber(item.so_tien_ung)) }}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="total-row__label">Tổng số tiền ứng:</td>
                  <td class="total-row__value">{{ totalAdvanceMoney }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Triệt tiêu cuộn ngoài ở cấp HTML và Body */
:global(html, body) {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* Khóa khung hiển thị theo chuẩn Dynamic Viewport Height (100dvh) */
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

/* Nội dung tự động co giãn theo khoảng trống còn lại */
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
  overflow: hidden;
}

.sub-title { margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #8f0000; flex-shrink: 0; }

.filter-bar-text { 
  max-width: 760px; 
  margin: 0 auto 10px; 
  padding: 6px 8px; 
  background: #ffffff; 
  border: 1px solid #f1f5f9; 
  border-radius: 6px; 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.filter-row { 
  display: flex; 
  align-items: center; 
  width: 100%; 
}

.filter-row--top {
  justify-content: flex-start;
}

.filter-row--bottom {
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: nowrap;
}

.filter-item { 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  white-space: nowrap; 
}

.filter-item--full {
  width: 100%;
}

.filter-item__label { font-size: 11px; font-weight: 600; color: #475569; flex-shrink: 0; }

.picker-select { 
  border: 1px solid #e2e8f0; 
  background: #f8fafc; 
  border-radius: 5px; 
  font-size: 11px; 
  padding: 4px 6px; 
  color: #334155; 
  outline: none; 
  cursor: pointer; 
  max-width: 120px;
}

.picker-select--full {
  width: 100%;
  max-width: 100%;
}

/* Chỉ khu vực bảng mới có quyền cuộn khi nhiều dòng */
.table-wrapper { 
  width: 100%; 
  overflow-y: auto; 
  flex: 1;
  min-height: 0;
}

.monthly-table { width: 100%; border-collapse: collapse; table-layout: fixed; }

.monthly-table th { 
  background: #8f0000 !important; 
  color: #ffffff !important; 
  border-bottom: 2px solid #700000; 
  font-weight: 700; 
  font-size: 11px; 
  padding: 5px 4px; 
  white-space: nowrap; 
  position: sticky;
  top: 0;
  z-index: 2;
}

.monthly-table td { white-space: normal; word-break: break-word; border-bottom: 1px solid #f1f5f9; padding: 5px 4px; font-size: 11px; color: #334155; line-height: 1.3; }
.monthly-table tbody tr:nth-child(even) { background: #f8fafc; }

.col-stt { width: 10%; text-align: center; }
.col-name { width: 40%; }
.col-date { width: 25%; text-align: center; }
.col-salary { width: 25%; text-align: right; padding-right: 8px; }

.money-cell { text-align: right; padding-right: 8px; }
.total-row td { background: #f1f5f9; font-weight: 800; color: #8f0000; border-top: 2px solid #e2e8f0; font-size: 11px; }
.total-row__label { text-align: right; padding-right: 8px; }
.total-row__value { text-align: right; padding-right: 8px; }

.loading-container {
  height: 180px;
  text-align: center;
  vertical-align: middle;
}

.custom-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8f0000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.state-message { text-align: center; font-size: 12px; padding: 20px 12px; color: #8f0000; font-weight: 700; }
.state-message--error { color: #dc2626; }
.empty-cell { padding: 20px 12px; color: #94a3b8; font-style: italic; text-align: center; font-size: 11px; }

@media (max-width: 639px) {
  .header-title { font-size: 14px; }
  .monthly-table th, .monthly-table td { font-size: 10px; padding: 4px 3px; }
  .filter-row--bottom { gap: 8px; }
  .picker-select { max-width: 100px; padding: 3px 4px; }
  .filter-item__label { font-size: 10px; }
}
</style>