<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { API_ENDPOINTS } from '../config/api'
import ButtonChiTiet from "../components/common/ButtonChiTiet.vue"
import HeaderQuayLai from '../components/common/HeaderQuayLai.vue'

interface AttendanceItem {
  id: string
  name: string
  showId: string
  showName: string
  workDate: string
  role: string
  salary: string
  note: string
  month: number
  year: number
}

interface StaffSummaryItem {
  id: string
  name: string
  month1: string
  month2: string
  month3: string
  month4: string
  month5: string
  month6: string
  month7: string
  month8: string
  month9: string
  month10: string
  month11: string
  month12: string
  salary: string
}

interface ShowFeeItem {
  id?: string
  ten_ns?: string
  tong_tien_show?: number | string
  so_tien_da_ung?: number | string
  tien_con_lai?: number | string
  [key: string]: any
}

const currentDate = new Date()
const selectedMonth = ref<number>(currentDate.getMonth() + 1)
const selectedYear = ref<number>(currentDate.getFullYear())

const currentYearNum = currentDate.getFullYear()
const availableYears = computed(() => {
  const years = []
  for (let y = currentYearNum - 3; y <= currentYearNum + 2; y++) years.push(y)
  return years
})

const julyAttendances = ref<AttendanceItem[]>([])
const showFees = ref<ShowFeeItem[]>([])
const loadingShowFees = ref<boolean>(false)
const loading = ref<boolean>(false)
const errorMsg = ref<string>('')

const showFilterJuly = ref(false)
const selectedNameJuly = ref('Tất cả')

const showFilterShow = ref(false)
const selectedShowJuly = ref('Tất cả show')

const sortJulyShowOrder = ref<'none' | 'asc' | 'desc'>('none')
const sortJulyDateOrder = ref<'none' | 'asc' | 'desc'>('none')

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

const getTenNsFromLocalStorage = (): string => {
  const userObj = getUserFromLocalStorage()
  return userObj?.ten_ns || ''
}

const salaryToNumber = (salary: unknown) => {
  if (typeof salary === 'number') return Number.isFinite(salary) ? salary : 0
  const raw = String(salary ?? '').trim()
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

const parseDateTs = (workDate: string) => {
  const s = String(workDate || '').trim()
  if (!s) return 0
  if (s.includes('/')) {
    const [dd, mm, yyyy] = s.split('/')
    const d = new Date(`${yyyy}-${mm}-${dd}`)
    return Number.isNaN(d.getTime()) ? 0 : d.getTime()
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

const goBack = () => window.history.back()

const handleViewDetail = () => {
  console.log('Xem chi tiết tiền show:', showFees.value)
}

const fetchTienShow = async () => {
  const role = getRoleFromLocalStorage()
  if (role === 'admin') {
    showFees.value = []
    return
  }

  const tenNs = getTenNsFromLocalStorage()
  if (!tenNs) return

  loadingShowFees.value = true
  try {
    const url = API_ENDPOINTS.TONG_TIEN_DIEN_THEO_TEN_NS(tenNs)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    let res: any = await response.json()
    if (typeof res === 'string') {
      try { res = JSON.parse(res) } catch (_) {}
    }

    if ((res?.code === 200 || res?.status === 'success') && Array.isArray(res?.data)) {
      showFees.value = res.data
    } else if (Array.isArray(res)) {
      showFees.value = res
    } else {
      showFees.value = []
    }
  } catch (err) {
    console.error('Lỗi khi tải tiền show:', err)
    showFees.value = []
  } finally {
    loadingShowFees.value = false
  }
}

const fetchChamCongChiTiet = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const role = getRoleFromLocalStorage()
    const isAdmin = role === 'admin'

    let url = ''

    if (isAdmin) {
      url = API_ENDPOINTS.LAY_ALL_CHAM_CONG_BY_THANG_NAM(selectedMonth.value, selectedYear.value)
    } else {
      const nameParam = selectedNameJuly.value !== 'Tất cả' ? selectedNameJuly.value : getTenNsFromLocalStorage()
      url = API_ENDPOINTS.LAY_SHOW_THEO_NHAN_SU(nameParam)
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    let res: any = await response.json()
    if (typeof res === 'string') {
      try { res = JSON.parse(res) } catch (_) {}
    }

    if ((res?.code === 200 || res?.status === 'success') && Array.isArray(res?.data)) {
      julyAttendances.value = res.data.map((item: any) => {
        const salaryNum = salaryToNumber(item?.luong)
        const workDateStr = formatDateDisplay(item?.ngay_lamviec)

        const m = Number(item?.thang_chamcong || selectedMonth.value)
        const y = Number(item?.nam_chamcong || selectedYear.value)

        return {
          id: (item?.ma_ns || '').toString().trim(),
          name: (item?.ten_ns || '').toString().trim(),
          showId: (item?.ma_show || '').toString().trim(),
          showName: (item?.ten_show || '').toString().trim(),
          workDate: workDateStr,
          role: (item?.vai_tro || '').toString(),
          salary: formatMoney(salaryNum),
          note: (item?.ghi_chu || '').toString(),
          month: isNaN(m) ? selectedMonth.value : m,
          year: isNaN(y) ? selectedYear.value : y
        }
      })
    } else {
      julyAttendances.value = []
    }
  } catch (err: any) {
    errorMsg.value = 'Không thể kết nối dữ liệu máy chủ.'
    console.error('Lỗi gọi API ChamCong:', err)
    julyAttendances.value = []
  } finally {
    loading.value = false
  }
}

watch([selectedMonth, selectedYear], fetchChamCongChiTiet)
onMounted(() => {
  fetchTienShow()
  fetchChamCongChiTiet()
})

const staffs = computed<StaffSummaryItem[]>(() => {
  const staffMap = new Map<string, { id: string; name: string; months: number[] }>()

  julyAttendances.value.forEach((item) => {
    if (!item.name) return
    const nameKey = item.name.trim().toLowerCase()
    const salaryNum = salaryToNumber(item.salary)

    if (!staffMap.has(nameKey)) {
      staffMap.set(nameKey, {
        id: item.id || 'NS',
        name: item.name,
        months: Array(12).fill(0)
      })
    }

    const currentStaff = staffMap.get(nameKey)!
    const monthIndex = item.month >= 1 && item.month <= 12 ? item.month - 1 : selectedMonth.value - 1
    currentStaff.months[monthIndex] += salaryNum
  })

  return Array.from(staffMap.values()).map((s) => {
    const total = s.months.reduce((acc, curr) => acc + curr, 0)
    return {
      id: s.id,
      name: s.name,
      month1: `${s.months[0].toLocaleString('vi-VN')}đ`,
      month2: `${s.months[1].toLocaleString('vi-VN')}đ`,
      month3: `${s.months[2].toLocaleString('vi-VN')}đ`,
      month4: `${s.months[3].toLocaleString('vi-VN')}đ`,
      month5: `${s.months[4].toLocaleString('vi-VN')}đ`,
      month6: `${s.months[5].toLocaleString('vi-VN')}đ`,
      month7: `${s.months[6].toLocaleString('vi-VN')}đ`,
      month8: `${s.months[7].toLocaleString('vi-VN')}đ`,
      month9: `${s.months[8].toLocaleString('vi-VN')}đ`,
      month10: `${s.months[9].toLocaleString('vi-VN')}đ`,
      month11: `${s.months[10].toLocaleString('vi-VN')}đ`,
      month12: `${s.months[11].toLocaleString('vi-VN')}đ`,
      salary: `${total.toLocaleString('vi-VN')}đ`
    }
  })
})

const allJulyNames = computed(() => [...new Set(julyAttendances.value.map((item) => item.name).filter(Boolean))])
const allJulyShows = computed(() => [...new Set(julyAttendances.value.map((item) => item.showName).filter(Boolean))])

const filteredStaffs = computed(() => staffs.value)

const filteredAndSortedJulyAttendances = computed(() => {
  let data = [...julyAttendances.value]

  if (selectedNameJuly.value !== 'Tất cả') {
    data = data.filter((item) => item.name.toLowerCase() === selectedNameJuly.value.toLowerCase())
  }

  if (selectedShowJuly.value !== 'Tất cả show') {
    data = data.filter((item) => item.showName === selectedShowJuly.value)
  }

  data.sort((a, b) => {
    if (sortJulyDateOrder.value !== 'none') {
      const d = parseDateTs(a.workDate) - parseDateTs(b.workDate)
      if (d !== 0) return sortJulyDateOrder.value === 'asc' ? d : -d
    }

    if (sortJulyShowOrder.value !== 'none') {
      const s = a.showName.localeCompare(b.showName, 'vi')
      if (s !== 0) return sortJulyShowOrder.value === 'asc' ? s : -s
    }

    return 0
  })

  return data
})

const totalSalary = computed(() => {
  const total = filteredAndSortedJulyAttendances.value.reduce((sum, item) => sum + salaryToNumber(item.salary), 0)
  return `${total.toLocaleString('vi-VN')}đ`
})

const toggleFilterJuly = () => { showFilterJuly.value = !showFilterJuly.value }
const selectFilterJuly = (name: string) => {
  selectedNameJuly.value = name
  showFilterJuly.value = false
}

const toggleFilterShow = () => { showFilterShow.value = !showFilterShow.value }
const selectFilterShow = (showName: string) => {
  selectedShowJuly.value = showName
  showFilterShow.value = false
}

const toggleSortShow = () => {
  sortJulyShowOrder.value =
    sortJulyShowOrder.value === 'none' ? 'asc' : sortJulyShowOrder.value === 'asc' ? 'desc' : 'asc'
}
const toggleSortDate = () => {
  sortJulyDateOrder.value =
    sortJulyDateOrder.value === 'none' ? 'asc' : sortJulyDateOrder.value === 'asc' ? 'desc' : 'asc'
}
</script>

<template>
  <div class="schedule-page">
    <HeaderQuayLai title="Danh sách chấm công" />

    <section class="schedule-page__content">
      <!-- Bảng 1: Tiền Show -->
      <div v-if="getRoleFromLocalStorage() !== 'admin'" class="table-card table-card--mb">
        <h3 class="sub-title">Tiền Show</h3>
        <div v-if="loadingShowFees" class="state-message">Đang tải dữ liệu tiền show...</div>
        <div v-else class="table-wrapper">
          <table class="monthly-table compact-table">
            <thead>
              <tr>
                <th class="col-name">Tên NS</th>
                <th class="col-salary">Tiền show</th>
                <th class="col-salary">Tiền đã ứng</th>
                <th class="col-salary">Tiền còn lại</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="showFees.length === 0">
                <td colspan="4" class="empty-cell">Không có dữ liệu tiền show</td>
              </tr>
              <tr v-for="(item, idx) in showFees" :key="idx">
                <td class="col-name">{{ item.ten_ns || getTenNsFromLocalStorage() }}</td>
                <td class="col-salary money-cell">{{ formatMoney(salaryToNumber(item.tong_tien_show)) }}</td>
                <td class="col-salary money-cell">{{ formatMoney(salaryToNumber(item.so_tien_da_ung)) }}</td>
                <td class="col-salary money-cell">{{ formatMoney(salaryToNumber(item.tien_con_lai)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Gọi Component Nút Chi Tiết -->
        <div class="table-action-footer">
          <ButtonChiTiet text="Chi tiết" @click="handleViewDetail" />
        </div>
      </div>

      <!-- Bảng 2: Bảng tổng hợp lương nhân sự theo tháng -->
      <div class="table-card">
        <h3 class="sub-title">Bảng tổng hợp lương nhân sự theo tháng</h3>
        <div class="table-wrapper table-wrapper--half">
          <table class="attendance-table compact-table">
            <thead>
              <tr>
                <th class="col-name col-name--sticky">Tên NS</th>
                <th>Th.1</th><th>Th.2</th><th>Th.3</th><th>Th.4</th><th>Th.5</th><th>Th.6</th>
                <th>Th.7</th><th>Th.8</th><th>Th.9</th><th>Th.10</th><th>Th.11</th><th>Th.12</th>
                <th class="col-salary">Lương</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredStaffs.length === 0">
                <td colspan="14" class="empty-cell">Không có dữ liệu nhân sự cho Tháng {{ selectedMonth }}/{{ selectedYear }}</td>
              </tr>
              <tr v-for="item in filteredStaffs" :key="item.id + '-' + item.name">
                <td class="col-name col-name--sticky">{{ item.name }}</td>
                <td class="money-cell">{{ item.month1 }}</td>
                <td class="money-cell">{{ item.month2 }}</td>
                <td class="money-cell">{{ item.month3 }}</td>
                <td class="money-cell">{{ item.month4 }}</td>
                <td class="money-cell">{{ item.month5 }}</td>
                <td class="money-cell">{{ item.month6 }}</td>
                <td class="money-cell">{{ item.month7 }}</td>
                <td class="money-cell">{{ item.month8 }}</td>
                <td class="money-cell">{{ item.month9 }}</td>
                <td class="money-cell">{{ item.month10 }}</td>
                <td class="money-cell">{{ item.month11 }}</td>
                <td class="money-cell">{{ item.month12 }}</td>
                <td class="col-salary money-cell">{{ item.salary }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bảng 3: Bảng chấm công chi tiết -->
      <div class="table-card table-card--mt">
        <div class="filter-bar-text">
          <div class="filter-row-right">
            <div class="filter-item">
              <span class="filter-item__label">Tháng:</span>
              <select v-model.number="selectedMonth" class="filter-item__control picker-select">
                <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
              </select>
            </div>

            <div class="filter-item">
              <span class="filter-item__label">Năm:</span>
              <select v-model.number="selectedYear" class="filter-item__control picker-select">
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>

            <div class="filter-item">
              <div class="search-box filter-item__control">
                <button class="search-box__btn" type="button" @click="toggleFilterJuly">
                  <span class="filter-icon">🔍</span>
                  <span class="search-box__text">{{ selectedNameJuly }}</span>
                  <span class="search-box__icon">⌄</span>
                </button>
                <div v-if="showFilterJuly" class="search-box__dropdown">
                  <button class="search-box__option" type="button" @click="selectFilterJuly('Tất cả')">Tất cả</button>
                  <button
                    v-for="name in allJulyNames"
                    :key="name"
                    class="search-box__option"
                    type="button"
                    @click="selectFilterJuly(name)"
                  >
                    {{ name }}
                  </button>
                </div>
              </div>
            </div>

            <div class="filter-item">
              <div class="search-box filter-item__control">
                <button class="search-box__btn" type="button" @click="toggleFilterShow">
                  <span class="filter-icon">🔍</span>
                  <span class="search-box__text">{{ selectedShowJuly }}</span>
                  <span class="search-box__icon">⌄</span>
                </button>
                <div v-if="showFilterShow" class="search-box__dropdown">
                  <button class="search-box__option" type="button" @click="selectFilterShow('Tất cả show')">Tất cả show</button>
                  <button
                    v-for="showName in allJulyShows"
                    :key="showName"
                    class="search-box__option"
                    type="button"
                    @click="selectFilterShow(showName)"
                  >
                    {{ showName }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 class="sub-title">Bảng chấm công chi tiết Tháng {{ selectedMonth }}/{{ selectedYear }}</h3>

        <div v-if="loading" class="state-message">Đang tải dữ liệu chấm công...</div>
        <div v-else-if="errorMsg" class="state-message state-message--error">{{ errorMsg }}</div>

        <div v-else class="table-wrapper table-wrapper--july">
          <table class="monthly-table compact-table">
            <thead>
              <tr>
                <th class="col-stt">#</th>
                <th class="col-name">Tên NS</th>
                <th class="col-show">
                  <div class="th-sort">
                    <span>Tên show</span>
                    <button class="sort-icon" type="button" @click="toggleSortShow">
                      {{ sortJulyShowOrder === 'asc' ? '↑' : sortJulyShowOrder === 'desc' ? '↓' : '↕' }}
                    </button>
                  </div>
                </th>
                <th class="col-date">
                  <div class="th-sort">
                    <span>Ngày</span>
                    <button class="sort-icon" type="button" @click="toggleSortDate">
                      {{ sortJulyDateOrder === 'asc' ? '↑' : sortJulyDateOrder === 'desc' ? '↓' : '↕' }}
                    </button>
                  </div>
                </th>
                <th class="col-role">Vai trò</th>
                <th class="col-salary">Lương</th>
                <th class="col-note">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredAndSortedJulyAttendances.length === 0">
                <td colspan="7" class="empty-cell">Không có dữ liệu chấm công cho bộ lọc hiện tại</td>
              </tr>
              <tr v-for="(item, index) in filteredAndSortedJulyAttendances" :key="index">
                <td class="col-stt">{{ index + 1 }}</td>
                <td class="col-name">{{ item.name }}</td>
                <td class="col-show">{{ item.showName }}</td>
                <td class="col-date">{{ item.workDate }}</td>
                <td class="col-role">{{ item.role }}</td>
                <td class="col-salary">{{ item.salary }}</td>
                <td class="col-note">{{ item.note }}</td>
              </tr>
              <tr class="total-row" v-if="filteredAndSortedJulyAttendances.length > 0">
                <td colspan="5" class="total-row__label">Tổng số lương:</td>
                <td class="total-row__value">{{ totalSalary }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.schedule-page { min-height: 100vh; background: #ffffff; position: relative; }
.schedule-page__header { background: #ffffff; padding: 8px 12px; position: sticky; top: 0; z-index: 10; }
.schedule-page__inner { max-width: 760px; margin: 0 auto; }
.header-content { display: flex; align-items: center; gap: 8px; }
.back-btn { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 50%; }
.back-btn:hover { background-color: #f1f5f9; }
.back-icon { width: 20px; height: 20px; stroke: #8f0000; flex-shrink: 0; }
.header-title { font-size: 15px; font-weight: 700; color: #8f0000; user-select: none; }
.schedule-page__content { padding: 4px 10px 30px; }
.table-card { width: 100%; max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 10px 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03); box-sizing: border-box; }
.table-card--mt { margin-top: 12px; }
.table-card--mb { margin-bottom: 12px; }
.sub-title { margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #8f0000; }
.filter-bar-text { max-width: 760px; margin: 0 auto 10px; padding: 4px 8px; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 6px; }
.filter-row-right { display: flex; justify-content: flex-end; align-items: center; gap: 6px; width: 100%; flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: 3px; }
.filter-item__label { font-size: 11px; font-weight: 600; color: #475569; }
.picker-select { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 5px; font-size: 11px; padding: 3px 6px; color: #334155; outline: none; cursor: pointer; }
.search-box { position: relative; display: inline-flex; align-items: center; gap: 3px; }
.search-box__btn { border: 1px solid #e2e8f0; background: #f8fafc; color: #334155; font-size: 11px; border-radius: 5px; padding: 3px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.search-box__text { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.search-box__icon { font-size: 9px; color: #475569; }
.search-box__dropdown { position: absolute; top: 32px; right: 0; z-index: 99999; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1); min-width: 140px; padding: 3px; max-height: 200px; overflow-y: auto; }
.search-box__option { display: block; width: 100%; border: none; background: transparent; padding: 5px 6px; text-align: left; font-size: 11px; cursor: pointer; color: #334155; border-radius: 4px; }
.search-box__option:hover { background: #f1f5f9; color: #8f0000; }
.table-wrapper { width: 100%; }
.table-wrapper--half { overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch; }
.table-wrapper--july { overflow: hidden; }
.attendance-table, .monthly-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.attendance-table { min-width: 860px; }
.attendance-table th.col-name--sticky, .attendance-table td.col-name--sticky { width: 75px !important; min-width: 75px !important; max-width: 75px !important; }
.attendance-table td.col-name--sticky { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.attendance-table th, .monthly-table th { background: #8f0000 !important; color: #ffffff !important; border-bottom: 2px solid #700000; font-weight: 700; font-size: 11px; padding: 5px 4px; white-space: nowrap; }
.attendance-table td, .monthly-table td { white-space: normal; word-break: break-word; border-bottom: 1px solid #f1f5f9; padding: 5px 4px; font-size: 11px; color: #334155; line-height: 1.3; }
.attendance-table tbody tr:nth-child(even), .monthly-table tbody tr:nth-child(even) { background: #f8fafc; }
.attendance-table th.col-name--sticky, .attendance-table td.col-name--sticky { position: sticky; left: 0; z-index: 7; }
.attendance-table thead th.col-name--sticky { background: #8f0000 !important; color: #ffffff !important; z-index: 9; }
.attendance-table tbody tr:nth-child(odd) td.col-name--sticky { background: #ffffff; }
.attendance-table tbody tr:nth-child(even) td.col-name--sticky { background: #f8fafc; }

/* Định dạng kích thước cột */
.col-stt { width: 6%; text-align: center; }
.col-name { width: 25%; }
.col-show { width: 23%; }
.col-date { width: 13%; }
.col-role { width: 14%; }
.col-salary { width: 25%; text-align: center; }
.col-note { width: 15%; }
.th-sort { display: flex; align-items: center; justify-content: center; gap: 3px; }
.sort-icon { border: none; background: transparent; color: #ffffff; font-size: 11px; cursor: pointer; padding: 0; line-height: 1; }
.total-row td { background: #f1f5f9; font-weight: 800; color: #8f0000; border-top: 2px solid #e2e8f0; font-size: 11px; }
.total-row__label { text-align: right; padding-right: 6px; }
.total-row__value { text-align: center; }
.state-message { text-align: center; font-size: 12px; padding: 12px; color: #8f0000; font-weight: 700; }
.state-message--error { color: #dc2626; }
.empty-cell { padding: 12px; color: #94a3b8; font-style: italic; text-align: center; font-size: 11px; }

/* Wrapper vị trí nút bấm */
.table-action-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 639px) {
  .header-title { font-size: 14px; }
  .attendance-table th, .attendance-table td, .monthly-table th, .monthly-table td { font-size: 10px; padding: 4px 3px; }
  .filter-row-right { justify-content: space-between; }
  .filter-item { width: 48%; }
  .filter-item select, .search-box__btn { width: 100%; }
  .search-box__text { max-width: 90px; }
}
</style>