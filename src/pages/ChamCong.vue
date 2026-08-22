// chamcong.vue

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { API_ENDPOINTS } from '../config/api'

interface AttendanceItem {
  id: string
  name: string
  showId: string
  showName: string
  workDate: string
  role: string
  salary: string
  note: string
  month: string | number
  year: string | number
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
const loading = ref<boolean>(false)
const errorMsg = ref<string>('')

const showFilterJuly = ref(false)
const selectedNameJuly = ref('Tất cả')

const showFilterShow = ref(false)
const selectedShowJuly = ref('Tất cả show')

const sortJulyShowOrder = ref<'none' | 'asc' | 'desc'>('none')
const sortJulyDateOrder = ref<'none' | 'asc' | 'desc'>('none')

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

const fetchChamCongChiTiet = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const url = API_ENDPOINTS.CHAM_CONG_CHI_TIET(selectedMonth.value, selectedYear.value)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    let res: any = await response.json()
    if (typeof res === 'string') {
      try { res = JSON.parse(res) } catch (_) {}
    }

    if ((res?.code === 200 || res?.status === 'success') && Array.isArray(res?.data)) {
      julyAttendances.value = res.data
        .filter((item: any) => {
          // ✅ Chỉ lấy dòng có tên NS
          const tenNS = (item?.ten_ns || '').toString().trim()
          return tenNS !== ''
        })
        .map((item: any) => {
          const salaryNum = salaryToNumber(item?.luong)
          return {
            id: (item?.ma_ns || '').toString().trim(),
            name: (item?.ten_ns || '').toString().trim(),
            showId: (item?.ma_show || '').toString().trim(),
            showName: (item?.ten_show || '').toString().trim(),
            workDate: (item?.ngay_lamviec || '').toString(),
            role: (item?.vai_tro || '').toString(),
            salary: formatMoney(salaryNum),
            note: (item?.ghi_chu || item?.['ghi chu'] || '').toString(),
            month: item?.thang_chamcong || selectedMonth.value,
            year: item?.nam_chamcong || selectedYear.value
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

onMounted(fetchChamCongChiTiet)
watch([selectedMonth, selectedYear], fetchChamCongChiTiet)

const staffs = computed<StaffSummaryItem[]>(() => {
  const staffMap = new Map<string, { id: string; name: string; months: number[] }>()

  julyAttendances.value
    .filter(item => {
      // ✅ Chỉ lấy nhân sự có tên
      if (!item.name) return false
      // ✅ Chỉ lấy tháng/năm được chọn
      const itemMonth = Number(item.month) || selectedMonth.value
      const itemYear = Number(item.year) || selectedYear.value
      return itemMonth === selectedMonth.value && itemYear === selectedYear.value
    })
    .forEach((item) => {
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
      if (item.id && currentStaff.id === 'NS') currentStaff.id = item.id

      // ✅ Tháng luôn là selectedMonth vì đã filter trước
      currentStaff.months[selectedMonth.value - 1] += salaryNum
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
    data = data.filter((item) => item.name === selectedNameJuly.value)
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
  <div class="chamcong-page">
    <section class="chamcong-page__header">
      <div class="chamcong-page__inner">
        <h2 class="chamcong-page__title">Bảng chấm công nhân sự</h2>
      </div>
    </section>

    <section class="chamcong-page__content">
      <!-- BẢNG TRÊN: bỏ cột Mã NS, giữ kéo ngang, Tên NS luôn thấy -->
      <div class="table-card">
        <div class="table-wrapper table-wrapper--half">
          <table class="attendance-table">
            <thead>
              <tr>
                <th class="col-name col-name--sticky">Tên NS</th>
                <th>Tháng 1</th><th>Tháng 2</th><th>Tháng 3</th><th>Tháng 4</th><th>Tháng 5</th><th>Tháng 6</th>
                <th>Tháng 7</th><th>Tháng 8</th><th>Tháng 9</th><th>Tháng 10</th><th>Tháng 11</th><th>Tháng 12</th>
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

      <div class="table-card table-card--mt">
        <div class="header-filter-row header-filter-row--stack">
          <h3 class="sub-title">Bảng chấm công chi tiết Tháng {{ selectedMonth }}/{{ selectedYear }}</h3>

          <div class="filter-grid">
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
              <span class="filter-item__label">Tìm theo tên:</span>
              <div class="search-box filter-item__control">
                <button class="search-box__btn" type="button" @click="toggleFilterJuly">
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
              <span class="filter-item__label">Tìm theo show:</span>
              <div class="search-box filter-item__control">
                <button class="search-box__btn" type="button" @click="toggleFilterShow">
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

        <div v-if="loading" class="state-msg">Đang tải dữ liệu chấm công...</div>
        <div v-else-if="errorMsg" class="state-msg state-msg--error">{{ errorMsg }}</div>

        <div v-else class="table-wrapper table-wrapper--july">
          <table class="monthly-table">
            <thead>
              <tr>
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
                <td colspan="6" class="empty-cell">Không có dữ liệu chấm công cho bộ lọc hiện tại</td>
              </tr>
              <tr v-for="(item, index) in filteredAndSortedJulyAttendances" :key="index">
                <td class="col-name">{{ item.name }}</td>
                <td class="col-show">{{ item.showName }}</td>
                <td class="col-date">{{ item.workDate }}</td>
                <td class="col-role">{{ item.role }}</td>
                <td class="col-salary">{{ item.salary }}</td>
                <td class="col-note">{{ item.note }}</td>
              </tr>
              <tr class="total-row" v-if="filteredAndSortedJulyAttendances.length > 0">
                <td colspan="4" class="total-row__label">Tổng số lương:</td>
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
.chamcong-page { min-height: 100vh; background: #f6f1f1; }
.chamcong-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 10px 14px; }
.chamcong-page__inner { max-width: 100%; margin: 0 auto; }
.chamcong-page__title { margin: 0; text-align: center; font-size: 15px; font-weight: 800; color: #ffd700; }
.chamcong-page__subtitle { margin: 3px 0 0; text-align: center; font-size: 10px; color: rgba(255, 255, 255, 0.95); }
.chamcong-page__content { padding: 8px; }
.table-card { width: 100%; margin: 0 auto; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 6px 12px rgba(143, 0, 0, 0.05); border: 1px solid #ececec; box-sizing: border-box; }
.table-card--mt { margin-top: 10px; }
.sub-title { margin: 0; font-size: 13px; font-weight: 800; color: #8f0000; }

.header-filter-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
.header-filter-row--stack { align-items: flex-start; }

.picker-label { font-size: 10px; font-weight: 700; color: #8f0000; }
.picker-select { border: 1px solid #eadada; background: #fff; border-radius: 6px; font-size: 10px; padding: 2px 4px; color: #333; outline: none; cursor: pointer; }

/* 2x2 equal filter */
.filter-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 6px;
}
.filter-item {
  display: grid;
  grid-template-columns: 78px 1fr;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.filter-item__label {
  font-size: 10px;
  font-weight: 700;
  color: #8f0000;
  white-space: nowrap;
}
.filter-item__control {
  width: 100%;
  min-width: 0;
  height: 30px;
  box-sizing: border-box;
}
.filter-item select.filter-item__control {
  padding: 0 8px;
  font-size: 10px;
  border: 1px solid #eadada;
  border-radius: 8px;
  background: #fff;
}

/* search */
.search-box { position: relative; display: inline-flex; align-items: center; gap: 4px; width: 100%; }
.search-box__label { font-size: 10px; color: #8f0000; font-weight: 700; }
.search-box__btn {
  border: 1px solid #eadada;
  background: #fff;
  color: #333;
  font-size: 10px;
  border-radius: 8px;
  padding: 0 8px;
  cursor: pointer;
  width: 100%;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  box-sizing: border-box;
}
.search-box__text { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.search-box__icon { font-size: 9px; color: #8f0000; }
.search-box__dropdown {
  position: absolute;
  top: 32px;
  right: 0;
  z-index: 99999;
  background: #fff;
  border: 1px solid #eadada;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  min-width: 160px;
  padding: 4px;
  max-height: 220px;
  overflow-y: auto;
}
.search-box__option { display: block; width: 100%; border: none; background: transparent; padding: 5px 7px; text-align: left; font-size: 10px; cursor: pointer; color: #333; border-radius: 6px; }
.search-box__option:hover { background: #fff2b8; color: #8f0000; }

.table-wrapper { width: 100%; }

/* Bảng trên full kéo ngang */
.table-wrapper--half {
  overflow-x: auto;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}
.table-wrapper--july { overflow: hidden; margin-top: 16px; }

.attendance-table, .monthly-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
/* Bảng trên mobile */
.attendance-table {
  min-width: 980px; /* giảm từ 1200/1300 để cột co theo */
}

/* ép cột Tên NS nhỏ thật sự */
.attendance-table th.col-name--sticky,
.attendance-table td.col-name--sticky {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
}

/* cho chữ gọn */
.attendance-table td.col-name--sticky {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attendance-table th,
.monthly-table th { background: #8f0000; color: #fff; font-weight: 800; white-space: nowrap; text-overflow: clip; }

.attendance-table td,
.monthly-table td { white-space: normal; word-break: break-word; text-overflow: initial; }

.attendance-table tbody tr:nth-child(even),
.monthly-table tbody tr:nth-child(even) { background: #fff8f8; }

/* Sticky cột Tên NS cho bảng trên để kéo ngang không bị mất */
.attendance-table th.col-name--sticky,
.attendance-table td.col-name--sticky {
  position: sticky;
  left: 0;
  z-index: 7;
}
.attendance-table thead th.col-name--sticky {
  background: #8f0000;
  color: #fff;
  z-index: 9;
}
.attendance-table tbody tr:nth-child(odd) td.col-name--sticky { background: #fff; }
.attendance-table tbody tr:nth-child(even) td.col-name--sticky { background: #fff8f8; }

/* Width cột sau khi bỏ Mã NS */
.col-name { width: 10%; }
.col-show { width: 22%; }
.col-date { width: 16%; }
.col-role { width: 16%; }
.col-salary { width: 14%; }
.col-note { width: 18%; }

.th-sort { display: flex; align-items: center; justify-content: center; gap: 3px; }
.sort-icon { border: none; background: transparent; color: #fff; font-size: 12px; cursor: pointer; padding: 0; line-height: 1; }

.total-row td { background: #fff2b8; font-weight: 800; color: #8f0000; }
.total-row__label { text-align: right; padding-right: 8px; }
.total-row__value { text-align: center; }

.state-msg { text-align: center; font-size: 11px; padding: 12px; color: #666; font-weight: 600; }
.state-msg--error { color: #d32f2f; }
.empty-cell { padding: 12px; color: #888; font-style: italic; }

@media (max-width: 640px) {
  .chamcong-page__title { font-size: 14px; }
  .chamcong-page__subtitle { font-size: 9px; }

  .attendance-table th,
  .attendance-table td,
  .monthly-table th,
  .monthly-table td { font-size: 8px; padding: 2px 1px; }

  .table-wrapper--half { max-width: 100%; }

  .filter-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
  .filter-item { grid-template-columns: 74px 1fr; gap: 4px; }
  .filter-item__control,
  .search-box__btn { height: 30px; }
  .search-box__text { max-width: 74px; }

  .attendance-table { min-width: 1200px; }
  .col-name { width: 30%; }
}
</style>