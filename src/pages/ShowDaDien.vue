
<template>
  <div class="tat-ca-lich-dien">
    <HeaderQuayLai title="Show đã diễn" />

    <div v-if="loading" class="loading-container">
      <IconLoading />
    </div>

    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button @click="getTatCaShow">Thử lại</button>
    </div>

    <template v-else>
      <ThanhTimKiem
        v-model="tuKhoa"
        placeholder="Tìm kiếm lịch diễn..."
        @sort="sapXep"
      />

      <div class="show-count">
        Tổng số: {{ filteredShows.length }} show
      </div>

      <div v-if="filteredShows.length === 0" class="empty-message">
        {{ tuKhoa.trim() ? 'Không tìm thấy show phù hợp.' : 'Chưa có lịch diễn nào.' }}
      </div>

      <div v-else class="show-list">
        <KhungThongTinShow
          v-for="(show, index) in filteredShows"
          :key="show.ma_show || index"
          :show-id="show.ma_show"
          :ten-show="show.ten_show"
          :ngay="show.ngay"
          :gio="show.gio"
          :trang-thai="show.trang_thai"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HeaderQuayLai from '../components/common/HeaderQuayLai.vue'
import ThanhTimKiem from '../components/common/ThanhTimKiem.vue'
import KhungThongTinShow from '../components/KhungThongTinShow.vue'
import IconLoading from '../components/IconLoading.vue'
import { LAY_SHOW_DA_DIEN_API } from '../config/api'

interface Show {
  ma_show: string
  ten_show: string
  ngay: string
  gio: string
  diachi: string
  ten_khachhang: string
  sdt: string
  ma_loai_show: string
  trang_thai: string
}

interface ApiResponse {
  code: number
  message: string
  data: Show[] | null
  error?: string
}

const shows = ref<Show[]>([])
const loading = ref(false)
const errorMessage = ref('')
const tuKhoa = ref('')
const tangDan = ref(true)

const filteredShows = computed(() => {
  const keyword = tuKhoa.value.trim().toLowerCase()

  let result = shows.value.filter(show => {
    return [
      show.ma_show,
      show.ten_show,
      show.ngay,
      show.gio,
      show.trang_thai
    ].some(value => String(value || '').toLowerCase().includes(keyword))
  })

  result = [...result].sort((a, b) => {
    const dateA = parseNgay(a.ngay)
    const dateB = parseNgay(b.ngay)

    return tangDan.value ? dateA - dateB : dateB - dateA
  })

  return result
})

const parseNgay = (ngay: string) => {
  const parts = String(ngay || '').split('/')

  if (parts.length !== 3) return 0

  const [day, month, year] = parts.map(Number)

  return new Date(year, month - 1, day).getTime() || 0
}

const sapXep = () => {
  tangDan.value = !tangDan.value
}

const getTatCaShow = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(LAY_SHOW_DA_DIEN_API)

    if (!response.ok) {
      throw new Error(`Lỗi kết nối API: ${response.status}`)
    }

    const result: ApiResponse = await response.json()

    if (result.code !== 200) {
      throw new Error(
        result.error || result.message || 'Không thể lấy danh sách show'
      )
    }

    shows.value = Array.isArray(result.data) ? result.data : []

  } catch (error) {
    console.error('Lỗi lấy danh sách show:', error)

    errorMessage.value = error instanceof Error
      ? error.message
      : 'Có lỗi xảy ra khi tải dữ liệu'

  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getTatCaShow()
})
</script>

<style scoped>
.tat-ca-lich-dien {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
}

.show-count {
  margin: 14px 0 12px;
  color: #8f0000;
  font-size: 13px;
  font-weight: 700;
}

.show-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.empty-message,
.error-message {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.empty-message {
  color: #64748b;
}

.error-message {
  color: #8f0000;
}

.error-message button {
  display: block;
  margin: 12px auto 0;
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  background: #8f0000;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .tat-ca-lich-dien {
    padding: 12px;
  }

  .show-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
