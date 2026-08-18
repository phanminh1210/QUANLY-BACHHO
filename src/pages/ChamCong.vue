<template>
  <div class="chamcong-page">
    <section class="chamcong-page__header">
      <div class="chamcong-page__inner">
        <h2 class="chamcong-page__title">Bảng chấm công nhân sự</h2>
        <p class="chamcong-page__subtitle">Danh sách chấm công theo tháng và lương</p>
      </div>
    </section>

    <section class="chamcong-page__content">
      <div class="table-card">
        <div class="table-wrapper table-wrapper--half">
          <table class="attendance-table">
            <thead>
              <tr>
                <th class="col-id">Mã NS</th>
                <th class="col-name">Tên NS</th>
                <th>Tháng 1</th>
                <th>Tháng 2</th>
                <th>Tháng 3</th>
                <th>Tháng 4</th>
                <th>Tháng 5</th>
                <th>Tháng 6</th>
                <th>Tháng 7</th>
                <th>Tháng 8</th>
                <th>Tháng 9</th>
                <th>Tháng 10</th>
                <th>Tháng 11</th>
                <th>Tháng 12</th>
                <th class="col-salary">Lương</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredStaffs" :key="item.id">
                <td class="col-id">{{ item.id }}</td>
                <td class="col-name">{{ item.name }}</td>
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
        <h3 class="sub-title">Bảng chấm công tháng 7</h3>

        <div class="search-row">
          <div class="search-box">
            <span class="search-box__label">Lọc theo tên:</span>
            <button class="search-box__btn" type="button" @click="toggleFilterJuly">
              <span class="search-box__text">{{ selectedNameJuly === 'Tất cả' ? 'Tất cả' : selectedNameJuly }}</span>
              <span class="search-box__icon">⌄</span>
            </button>

            <div v-if="showFilterJuly" class="search-box__dropdown">
              <button class="search-box__option" type="button" @click="selectFilterJuly('Tất cả')">
                Tất cả
              </button>
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

        <div class="table-wrapper table-wrapper--july">
          <table class="monthly-table">
            <thead>
              <tr>
                <th class="col-id">Mã NS</th>
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
              <tr v-for="item in filteredAndSortedJulyAttendances" :key="item.key">
                <td class="col-id">{{ item.id }}</td>
                <td class="col-name">{{ item.name }}</td>
                <td class="col-show">{{ item.showName }}</td>
                <td class="col-date">{{ item.workDate }}</td>
                <td class="col-role">{{ item.role }}</td>
                <td class="col-salary">{{ item.salary }}</td>
                <td class="col-note">{{ item.note }}</td>
              </tr>

              <tr class="total-row">
                <td colspan="5" class="total-row__label">Tổng số lương</td>
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

<script setup lang="ts">
import { computed, ref } from 'vue'

const staffs = [
  {
    id: 'NS001',
    name: 'Nguyễn Văn A',
    month1: '1,000,000đ',
    month2: '1,100,000đ',
    month3: '900,000đ',
    month4: '1,050,000đ',
    month5: '1,000,000đ',
    month6: '1,200,000đ',
    month7: '1,150,000đ',
    month8: '1,000,000đ',
    month9: '1,100,000đ',
    month10: '1,050,000đ',
    month11: '1,000,000đ',
    month12: '1,300,000đ',
    salary: '12,850,000đ',
  },
  {
    id: 'NS002',
    name: 'Trần Thị B',
    month1: '900,000đ',
    month2: '950,000đ',
    month3: '1,000,000đ',
    month4: '1,050,000đ',
    month5: '1,000,000đ',
    month6: '1,100,000đ',
    month7: '1,000,000đ',
    month8: '980,000đ',
    month9: '1,020,000đ',
    month10: '1,050,000đ',
    month11: '1,100,000đ',
    month12: '1,000,000đ',
    salary: '12,150,000đ',
  },
  {
    id: 'NS003',
    name: 'Lê Văn C',
    month1: '1,200,000đ',
    month2: '1,150,000đ',
    month3: '1,100,000đ',
    month4: '1,000,000đ',
    month5: '950,000đ',
    month6: '1,050,000đ',
    month7: '1,300,000đ',
    month8: '1,100,000đ',
    month9: '1,050,000đ',
    month10: '1,000,000đ',
    month11: '1,100,000đ',
    month12: '1,200,000đ',
    salary: '13,200,000đ',
  },
]

const julyAttendances = [
  { key: 1, id: 'NS001', name: 'Nguyễn Văn A', showName: 'Show ABS', workDate: '20/07/2026', role: 'Ca sĩ', salary: '500,000đ', note: 'Đúng giờ' },
  { key: 2, id: 'NS002', name: 'Trần Thị B', showName: 'Show ABS', workDate: '18/07/2026', role: 'Vũ công', salary: '350,000đ', note: 'Trang phục đầy đủ' },
  { key: 3, id: 'NS003', name: 'Lê Văn C', showName: 'Show KTV', workDate: '22/07/2026', role: 'MC', salary: '400,000đ', note: 'Chuẩn bị kịch bản' },
]

const showFilterJuly = ref(false)
const selectedNameJuly = ref('Tất cả')
const sortJulyShowOrder = ref<'none' | 'asc' | 'desc'>('none')
const sortJulyDateOrder = ref<'none' | 'asc' | 'desc'>('none')

const allJulyNames = computed(() => [...new Set(julyAttendances.map((item) => item.name))])

const filteredStaffs = computed(() => [...staffs])

const filteredAndSortedJulyAttendances = computed(() => {
  let data =
    selectedNameJuly.value === 'Tất cả'
      ? [...julyAttendances]
      : julyAttendances.filter((item) => item.name === selectedNameJuly.value)

  if (sortJulyShowOrder.value === 'asc') data = data.sort((a, b) => a.showName.localeCompare(b.showName))
  if (sortJulyShowOrder.value === 'desc') data = data.sort((a, b) => b.showName.localeCompare(a.showName))

  if (sortJulyDateOrder.value === 'asc') {
    data = data.sort(
      (a, b) =>
        new Date(a.workDate.split('/').reverse().join('-')).getTime() -
        new Date(b.workDate.split('/').reverse().join('-')).getTime(),
    )
  }
  if (sortJulyDateOrder.value === 'desc') {
    data = data.sort(
      (a, b) =>
        new Date(b.workDate.split('/').reverse().join('-')).getTime() -
        new Date(a.workDate.split('/').reverse().join('-')).getTime(),
    )
  }

  return data
})

const totalSalary = computed(() => {
  const total = filteredAndSortedJulyAttendances.value.reduce((sum, item) => sum + Number(item.salary.replace(/[^\d]/g, '')), 0)
  return `${total.toLocaleString('vi-VN')}đ`
})

const toggleFilterJuly = () => {
  showFilterJuly.value = !showFilterJuly.value
}

const selectFilterJuly = (name: string) => {
  selectedNameJuly.value = name
  showFilterJuly.value = false
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

<style scoped>
.chamcong-page { min-height: 100vh; background: #f6f1f1; }
.chamcong-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 10px 14px; }
.chamcong-page__inner { max-width: 100%; margin: 0 auto; }
.chamcong-page__title { margin: 0; text-align: center; font-size: 15px; font-weight: 800; color: #ffd700; }
.chamcong-page__subtitle { margin: 3px 0 0; text-align: center; font-size: 10px; color: rgba(255, 255, 255, 0.95); }
.chamcong-page__content { padding: 8px; }
.table-card { width: 100%; margin: 0 auto; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 6px 12px rgba(143, 0, 0, 0.05); border: 1px solid #ececec; box-sizing: border-box; }
.table-card--mt { margin-top: 10px; }
.sub-title { margin: 0 0 8px; font-size: 13px; font-weight: 800; color: #8f0000; }

.search-row { display: flex; justify-content: flex-end; margin-bottom: 8px; position: relative; z-index: 1000; }
.search-box { position: relative; display: inline-flex; align-items: center; gap: 4px; }
.search-box__label { font-size: 10px; color: #8f0000; font-weight: 700; }
.search-box__btn { border: 1px solid #eadada; background: #fff; color: #333; font-size: 10px; border-radius: 8px; padding: 4px 8px; cursor: pointer; min-width: 105px; display: inline-flex; align-items: center; justify-content: space-between; gap: 6px; }
.search-box__text { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.search-box__icon { font-size: 9px; color: #8f0000; }
.search-box__dropdown { position: absolute; top: 28px; right: 0; z-index: 99999; background: #fff; border: 1px solid #eadada; border-radius: 8px; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08); min-width: 160px; padding: 4px; max-height: 220px; overflow-y: auto; }
.search-box__option { display: block; width: 100%; border: none; background: transparent; padding: 5px 7px; text-align: left; font-size: 10px; cursor: pointer; color: #333; border-radius: 6px; }
.search-box__option:hover { background: #fff2b8; color: #8f0000; }

.table-wrapper { width: 100%; }
.table-wrapper--half { overflow-x: auto; max-width: 50%; }
.table-wrapper--july { overflow: hidden; }

.attendance-table, .monthly-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.attendance-table { min-width: 1400px; }
.monthly-table { min-width: 0; }

.attendance-table th,
.attendance-table td,
.monthly-table th,
.monthly-table td { border: 1px solid #eadada; padding: 3px 2px; text-align: center; font-size: 9px; line-height: 1.1; vertical-align: middle; overflow: hidden; }

.attendance-table th,
.monthly-table th { background: #8f0000; color: #fff; font-weight: 800; white-space: nowrap; text-overflow: clip; }

.attendance-table td,
.monthly-table td { white-space: normal; word-break: break-word; text-overflow: initial; }

.attendance-table tbody tr:nth-child(even),
.monthly-table tbody tr:nth-child(even) { background: #fff8f8; }

.total-row td { background: #fff2b8; font-weight: 800; color: #8f0000; }
.total-row__label { text-align: right; padding-right: 8px; }
.total-row__value { text-align: center; }

.col-id { width: 20%; position: sticky; left: 0; z-index: 20; background: #fff; }
.col-name { width: 25%; position: sticky; left: 36px; z-index: 20; background: #fff; }
.col-show { width: 18%; }
.col-date { width: 15%; }
.col-role { width: 10%; }
.col-note { width: 12%; }
.col-salary { width: 8%; }

.attendance-table thead .col-id,
.attendance-table thead .col-name { background: #8f0000; color: #fff; z-index: 30; }
.attendance-table tbody .col-id,
.attendance-table tbody .col-name { box-shadow: 1px 0 0 #eadada; }

.th-sort { display: flex; align-items: center; justify-content: center; gap: 3px; }
.sort-icon { border: none; background: transparent; color: #fff; font-size: 12px; cursor: pointer; padding: 0; line-height: 1; }

@media (max-width: 640px) {
  .chamcong-page__title { font-size: 14px; }
  .chamcong-page__subtitle { font-size: 9px; }
  .attendance-table th,
  .attendance-table td,
  .monthly-table th,
  .monthly-table td { font-size: 8px; padding: 2px 1px; }
  .col-id { width: 30px; left: 0; }
  .col-name { width: 48px; left: 30px; }
  .col-salary { width: 56px; }
  .table-wrapper--half { max-width: 100%; }
  .search-box__btn { min-width: 100px; }
}
</style>