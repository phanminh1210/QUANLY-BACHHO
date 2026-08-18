<template>
  <div class="schedule-page">
    <section class="schedule-page__header">
      <div class="schedule-page__inner">
        <h2 class="schedule-page__title">Các Show chưa diễn</h2>
        <p class="schedule-page__subtitle">Danh sách các lịch diễn của hệ thống</p>
      </div>
    </section>

    <section class="schedule-page__content">
      <div class="schedule-list">
        <article
          v-for="item in paginatedSchedules"
          :key="item.id"
          class="schedule-card"
          :class="`schedule-card--${item.statusClass}`"
        >
          <div class="schedule-card__top">
            <div>
              <div class="schedule-card__name">{{ item.name }}</div>
            </div>

            <div class="schedule-card__tag" :class="`schedule-card__tag--${item.statusClass}`">
              {{ item.status }}
            </div>
          </div>

          <div class="schedule-card__content">
            <div class="schedule-card__line">
              <span class="schedule-card__key">Loại show:</span>
              <span class="schedule-card__value">{{ item.type }}</span>
            </div>

            <div class="schedule-card__line">
              <span class="schedule-card__key">Ngày:</span>
              <span class="schedule-card__value">{{ item.date }}</span>
              <span class="schedule-card__key schedule-card__key--inline">Giờ:</span>
              <span class="schedule-card__value">{{ item.time }}</span>
            </div>

            <div class="schedule-card__line">
              <span class="schedule-card__key">Địa điểm:</span>
              <span class="schedule-card__value">{{ item.location }}</span>
            </div>

            <div class="schedule-card__line">
              <span class="schedule-card__key">SĐT:</span>
              <span class="schedule-card__value">{{ item.phone }}</span>
            </div>

            <div class="schedule-card__actions">
              <button
                class="schedule-card__detail-btn"
                type="button"
                @click="goToDetail(item.id)"
              >
                Chi tiết
              </button>
            </div>
          </div>
        </article>
      </div>

      <div class="pagination">
        <button class="pagination__btn" :disabled="currentPage === 1" @click="prevPage">
          Trước
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          class="pagination__page"
          :class="{ 'pagination__page--active': currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button class="pagination__btn" :disabled="currentPage === totalPages" @click="nextPage">
          Sau
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

type Schedule = {
  id: number
  name: string
  type: string
  date: string
  time: string
  location: string
  phone: string
  status: 'Chưa diễn' | 'Đã diễn' | 'Đã hủy'
  statusClass: 'not-played' | 'played' | 'cancelled'
}

const router = useRouter()

const pageSize = 6
const currentPage = ref(1)

const schedules: Schedule[] = [
  { id: 1, name: 'ABS', type: 'Show ca nhạc', date: '20/08/2026', time: '09:00', location: 'Hưng Yên', phone: '09987777q37', status: 'Chưa diễn', statusClass: 'not-played' },
  { id: 2, name: 'XYZ', type: 'Show sự kiện', date: '18/08/2026', time: '19:30', location: 'Hà Nội', phone: '0911222333', status: 'Đã diễn', statusClass: 'played' },
  { id: 3, name: 'KTV', type: 'Show sân khấu', date: '25/08/2026', time: '14:00', location: 'Nam Định', phone: '0987654321', status: 'Đã hủy', statusClass: 'cancelled' },
  { id: 4, name: 'MUSIC 01', type: 'Show ca nhạc', date: '21/08/2026', time: '20:00', location: 'Hải Phòng', phone: '0901002003', status: 'Chưa diễn', statusClass: 'not-played' },
  { id: 5, name: 'GALA 02', type: 'Show sự kiện', date: '22/08/2026', time: '18:30', location: 'Bắc Ninh', phone: '0901002004', status: 'Đã diễn', statusClass: 'played' },
  { id: 6, name: 'STAGE 03', type: 'Show sân khấu', date: '23/08/2026', time: '17:30', location: 'Hà Nam', phone: '0901002005', status: 'Chưa diễn', statusClass: 'not-played' },
  { id: 7, name: 'LIVE 04', type: 'Show ca nhạc', date: '24/08/2026', time: '21:00', location: 'Ninh Bình', phone: '0901002006', status: 'Đã hủy', statusClass: 'cancelled' },
  { id: 8, name: 'EVENT 05', type: 'Show sự kiện', date: '25/08/2026', time: '15:00', location: 'Thái Bình', phone: '0901002007', status: 'Đã diễn', statusClass: 'played' },
  { id: 9, name: 'SHOW 06', type: 'Show sân khấu', date: '26/08/2026', time: '10:00', location: 'Hưng Yên', phone: '0901002008', status: 'Chưa diễn', statusClass: 'not-played' },
  { id: 10, name: 'SHOW 07', type: 'Show ca nhạc', date: '27/08/2026', time: '19:00', location: 'Hà Nội', phone: '0901002009', status: 'Đã diễn', statusClass: 'played' },
]

const totalPages = computed(() => Math.ceil(schedules.length / pageSize))

const paginatedSchedules = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return schedules.slice(start, start + pageSize)
})

const goToPage = (page: number) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToDetail = (id: number) => {
  router.push({ name: 'ChiTietShow', params: { id } })
}
</script>

<style scoped>
.schedule-page {
  min-height: 100vh;
  background: #f6f1f1;
}

.schedule-page__header {
  background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%);
  color: #fff;
  padding: 14px 16px;
}

.schedule-page__inner {
  max-width: 760px;
  margin: 0 auto;
}

.schedule-page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #ffd700;
  text-align: center;
}

.schedule-page__subtitle {
  margin: 5px 0 0;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
}

.schedule-page__content {
  padding: 10px 12px 14px;
}

.schedule-list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-card {
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid #ececec;
  box-shadow: 0 4px 10px rgba(143, 0, 0, 0.04);
  border-left-width: 5px;
  border-left-style: solid;
  min-height: 82px;
}

.schedule-card--played {
  border-left-color: #16a34a;
}

.schedule-card--not-played {
  border-left-color: #facc15;
}

.schedule-card--cancelled {
  border-left-color: #dc2626;
}

.schedule-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.schedule-card__name {
  font-size: 16px;
  font-weight: 800;
  color: #8f0000;
  line-height: 1.1;
}

.schedule-card__tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
}

.schedule-card__tag--played {
  color: #15803d;
  background: #ecfdf3;
}

.schedule-card__tag--not-played {
  color: #a16207;
  background: #fffbea;
}

.schedule-card__tag--cancelled {
  color: #be123c;
  background: #fff1f2;
}

.schedule-card__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-card__line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.schedule-card__key {
  font-size: 13px;
  font-weight: 700;
  color: #8f0000;
}

.schedule-card__key--inline {
  margin-left: 10px;
}

.schedule-card__value {
  font-size: 14px;
  font-weight: 500;
  color: #444;
}

.schedule-card__actions {
  margin-top: 4px;
  display: flex;
  justify-content: flex-end;
}

.schedule-card__detail-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  background: #8f0000;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.pagination {
  max-width: 760px;
  margin: 12px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.pagination__btn,
.pagination__page {
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.pagination__btn {
  background: #8f0000;
  color: #fff;
}

.pagination__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination__page {
  background: #fff;
  color: #8f0000;
  border: 1px solid #eadada;
  min-width: 34px;
}

.pagination__page--active {
  background: #ffd700;
  border-color: #ffd700;
  color: #8f0000;
}

@media (max-width: 640px) {
  .schedule-card {
    padding: 10px 10px;
  }

  .schedule-page__title {
    font-size: 19px;
  }

  .schedule-page__subtitle {
    font-size: 13px;
  }

  .schedule-card__name {
    font-size: 15px;
  }

  .schedule-card__key {
    font-size: 12px;
  }

  .schedule-card__value {
    font-size: 13px;
  }

  .schedule-card__detail-btn {
    font-size: 11px;
    padding: 6px 11px;
  }
}
</style>