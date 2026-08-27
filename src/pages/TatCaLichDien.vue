<template>
  <div class="schedule-page">
    <!-- MÀN HÌNH CHỜ LÀM MỜ KHÓA TOÀN BỘ THAO TÁC KHI XỬ LÝ API -->
    <transition name="fade">
      <div v-if="submitting" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Đang xử lý, vui lòng chờ...</p>
      </div>
    </transition>

    <section class="schedule-page__header">
      <div class="schedule-page__inner">
        <p class="schedule-page__subtitle">Danh sách tổng hợp tất cả show diễn</p>
      </div>
    </section>

    <section class="schedule-page__content">
      <!-- THANH CÔNG CỤ TÌM KIẾM: ĐÃ GỘP TÌM KIẾM THÀNH 1 Ô LINH HOẠT -->
      <div class="filter-bar-text">
        <div class="filter-row-single">
          <!-- 1. Ô Lọc Trạng Thái -->
          <div class="filter-text-item">
            <span class="filter-icon">📌</span>
            <select v-model="searchForm.trang_thai" class="filter-text-select">
              <option value="all">Tất cả</option>
              <option value="chưa diễn">Chưa diễn</option>
              <option value="đã diễn">Đã diễn</option>  
              <option value="đã hủy">Đã hủy</option>
            </select>
          </div>

          <!-- 2. Ô Sắp Xếp Ngày Diễn -->
          <button class="sort-toggle-btn" type="button" @click="toggleSortOrder">
            <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M12 19l-4-4M12 19l4-4" />
              <template v-if="searchForm.sortOrder === 'desc'">
                <line x1="16" y1="6" x2="21" y2="6" />
                <line x1="16" y1="9.5" x2="20" y2="9.5" />
                <line x1="16" y1="13" x2="19" y2="13" />
                <line x1="16" y1="16.5" x2="18" y2="16.5" />
              </template>
              <template v-else>
                <line x1="16" y1="6" x2="18" y2="6" />
                <line x1="16" y1="9.5" x2="19" y2="9.5" />
                <line x1="16" y1="13" x2="20" y2="13" />
                <line x1="16" y1="16.5" x2="21" y2="16.5" />
              </template>
            </svg>
            <span class="sort-label">{{ searchForm.sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất' }}</span>
          </button>

          <!-- 3. Ô Tìm Kiếm Linh Hoạt (Gộp Tên, Khách, Ngày, Địa điểm, SĐT) -->
          <div class="filter-text-item" style="grid-column: span 2;">
            <span class="filter-icon">🔍</span>
            <input
              v-model="searchForm.keyword"
              type="text"
              class="filter-text-input"
              placeholder="Tìm tên show, khách, ngày, địa điểm..."
            />
            <button v-if="searchForm.keyword" class="filter-clear-btn" @click="searchForm.keyword = ''">✕</button>
          </div>
        </div>
      </div>

      <!-- SKELETON LOADING -->
      <div v-if="loading && allSchedules.length === 0" class="schedule-list">
        <div v-for="n in 5" :key="n" class="schedule-card skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="state-message state-message--error">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredSchedules.length === 0" class="state-message">
        Không tìm thấy lịch diễn nào phù hợp.
      </div>

      <!-- DANH SÁCH SHOW HIỂN THỊ -->
      <template v-else>
        <div class="schedule-list">
          <article
            v-for="item in filteredSchedules"
            :key="item.id"
            class="schedule-card"
            :class="`schedule-card--${item.statusClass}`"
          >
            <div class="schedule-card__top">
              <div class="schedule-card__name">{{ item.name }}</div>
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
                <span class="schedule-card__key">Khách hàng:</span>
                <span class="schedule-card__value">{{ item.rawKhachHang || 'Chưa cập nhật' }}</span>
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
                <button class="btn btn--red" type="button" :disabled="submitting" @click="goToDetail(item.id)">Chi tiết</button>

                <div v-if="isAdmin" class="dropdown-wrap">
                  <button class="btn btn--gray" type="button" :disabled="submitting" @click.stop="toggleDropdown(item.id)">
                    Đổi trạng thái
                  </button>
                  <div v-if="openDropdownId === item.id" class="status-dropdown" @click.stop>
                    <button class="status-option status-option--done" type="button" @click="changeStatus(item, 'đã diễn')">
                      đã diễn
                    </button>
                    <button class="status-option status-option--pending" type="button" @click="changeStatus(item, 'chưa diễn')">
                      chưa diễn
                    </button>
                    <button class="status-option status-option--cancel" type="button" @click="changeStatus(item, 'đã hủy')">
                      đã hủy
                    </button>
                    <div class="status-divider"></div>
                    <button class="status-option status-option--delete" type="button" @click="deleteShow(item)">
                      Xóa show
                    </button>
                  </div>
                </div>

                <button v-if="isAdmin" class="btn btn--blue" type="button" :disabled="submitting" @click.stop="openEditForm(item)">
                  Cập nhật
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <div v-if="openDropdownId !== null" class="dropdown-overlay" @click="closeDropdown" />

    <!-- MODAL EDIT SHOW -->
    <div v-if="editForm.show" class="modal-overlay" @click="!submitting && closeEditForm()">
      <div class="edit-box" @click.stop>
        <h3 class="edit-title">Cập nhật show</h3>
        <div class="edit-fields">
          <div class="edit-field">
            <label class="edit-label">Tên show</label>
            <input class="edit-input" v-model="editForm.ten_show" type="text" placeholder="Tên show" />
          </div>
          
          <div class="edit-field">
            <label class="edit-label">Loại show</label>
            <select v-model="editForm.ma_loai_show" class="edit-input">
              <option value="">-- Chọn loại show --</option>
              <option v-for="t in loaiShowList" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="edit-row">
            <div class="edit-field">
              <label class="edit-label">Ngày diễn</label>
              <input class="edit-input" :value="formattedDateForModal" type="date" @change="onModalDateChange" />
            </div>
            <div class="edit-field">
              <label class="edit-label">Giờ diễn</label>
              <input
                class="edit-input"
                v-model="editForm.gio"
                type="text"
                placeholder="VD: 09:30"
                maxlength="5"
                @input="formatTimeInput"
              />
            </div>
          </div>
          
          <div class="edit-field">
            <label class="edit-label">Địa điểm</label>
            <input class="edit-input" v-model="editForm.diachi" type="text" placeholder="Địa điểm" />
          </div>
          
          <div class="edit-field">
            <label class="edit-label">Khách hàng</label>
            <input class="edit-input" v-model="editForm.ten_khachhang" type="text" placeholder="Tên khách hàng" />
          </div>

          <div class="edit-field">
            <label class="edit-label">SĐT</label>
            <input class="edit-input" v-model="editForm.sdt" type="tel" placeholder="SĐT" />
          </div>
        </div>
        
        <div class="edit-actions">
          <button class="btn btn--green" :disabled="submitting" type="button" @click="submitEditForm">
            {{ submitting ? 'Đang lưu...' : 'Lưu' }}
          </button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeEditForm">Hủy</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRM -->
    <div v-if="confirmModal.show" class="modal-overlay" @click="!submitting && closeConfirm()">
      <div class="confirm-box" @click.stop>
        <p class="confirm-msg">{{ confirmModal.message }}</p>
        <div class="confirm-actions">
          <button class="btn btn--red" :disabled="submitting" type="button" @click="confirmAction">
            {{ submitting ? 'Đang xử lý...' : 'Xác nhận' }}
          </button>
          <button class="btn btn--gray" :disabled="submitting" type="button" @click="closeConfirm">Hủy</button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-pill" :class="`toast-pill--${toast.type}`">
        <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span> {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_ENDPOINTS } from '../config/api'
import { getUserField } from '../utils/auth'

type Schedule = {
  id: string | number
  name: string; type: string; date: string; time: string
  location: string; phone: string; status: string
  statusClass: 'played' | 'not-played' | 'cancelled' | 'expired' | 'default'
  rawType: string; rawKhachHang: string
}

const CACHE_KEY = 'cache_all_schedules'
const loaiShowList = ['Khai trương','Động thổ','Khánh thành','Lễ Hội','Trung thu','Đám cưới','Mừng thọ','Xông đất','Sinh nhật','Khác']

const router        = useRouter()
const loading       = ref(false)
const submitting    = ref(false)
const errorMessage  = ref('')
const allSchedules  = ref<Schedule[]>([])
const openDropdownId = ref<string | number | null>(null)

// Form tìm kiếm & Sắp xếp
const searchForm = ref({
  keyword: '',
  trang_thai: 'all',
  sortOrder: 'desc'
})

// Chuyển đổi trạng thái sắp xếp nhanh khi click icon
const toggleSortOrder = () => {
  searchForm.value.sortOrder = searchForm.value.sortOrder === 'desc' ? 'asc' : 'desc'
}

// Helper chuyển đổi chuỗi ngày dd/mm/yyyy thành timestamp
const parseDateToTimestamp = (dateStr: string): number => {
  if (!dateStr || !dateStr.includes('/')) return 0
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    return new Date(year, month, day).getTime()
  }
  return 0
}

// Lọc & Sắp xếp Client-Side Linh Hoạt
const filteredSchedules = computed(() => {
  const result = allSchedules.value.filter(item => {
    // Tìm kiếm linh hoạt theo từ khóa
    if (searchForm.value.keyword.trim()) {
      const kw = searchForm.value.keyword.trim().toLowerCase()
      const matchName     = item.name.toLowerCase().includes(kw)
      const matchCustomer = item.rawKhachHang.toLowerCase().includes(kw)
      const matchDate     = item.date.toLowerCase().includes(kw)
      const matchLocation = item.location.toLowerCase().includes(kw)
      const matchPhone    = item.phone.toLowerCase().includes(kw)

      if (!matchName && !matchCustomer && !matchDate && !matchLocation && !matchPhone) {
        return false
      }
    }

    // Lọc theo trạng thái
    if (searchForm.value.trang_thai !== 'all') {
      const filterStatus = searchForm.value.trang_thai.trim().toLowerCase()
      const itemStatus = item.status.trim().toLowerCase()
      if (itemStatus !== filterStatus) return false
    }

    return true
  })

  return result.sort((a, b) => {
    const timeA = parseDateToTimestamp(a.date)
    const timeB = parseDateToTimestamp(b.date)
    
    if (searchForm.value.sortOrder === 'asc') {
      return timeA - timeB
    } else {
      return timeB - timeA
    }
  })
})

const safeJson = async (res: Response): Promise<any | null> => {
  try {
    const text = await res.text()
    if (!text || text.trim() === '') return { success: true }
    try {
      return JSON.parse(text)
    } catch {
      return { success: true, rawText: text }
    }
  } catch {
    return null
  }
}

const isSuccessResponse = (res: any): boolean => {
  if (!res) return false
  if (res.code === 200 || res.status === 'success' || res.success === true) return true
  if (Array.isArray(res)) return true
  if (Array.isArray(res.data)) return true
  return false
}

const isAdmin = computed(() => {
  const role = getUserField('vai_tro') || getUserField('role')
  if (role) return String(role).trim().toLowerCase() === 'admin'
  const raw = localStorage.getItem('user_info') || localStorage.getItem('user')
  if (raw) {
    try {
      const p = JSON.parse(raw)
      return String(p.vai_tro || p.role || '').trim().toLowerCase() === 'admin'
    } catch {}
  }
  return false
})

// EDIT FORM & FORMATTERS
const editForm = ref({ show: false, ma_show: '', ten_show: '', ngay: '', gio: '', diachi: '', ten_khachhang: '', sdt: '', ma_loai_show: '' })

const formattedDateForModal = computed(() => {
  const val = editForm.value.ngay?.trim() || ''
  if (val.includes('/')) {
    const [d, m, y] = val.split('/')
    return `${y}-${m?.padStart(2,'0')}-${d?.padStart(2,'0')}`
  }
  return val
})

const onModalDateChange = (e: Event) => {
  const v = (e.target as HTMLInputElement).value
  if (!v) return
  const [y, m, d] = v.split('-')
  if (y && m && d) editForm.value.ngay = `${d}/${m}/${y}`
}

const formatTimeInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/[^\d:]/g, '')
  if (val.includes(':')) {
    const [p1, p2 = ''] = val.split(':')
    let hh = p1.slice(0,2), mm = p2.slice(0,2)
    if (hh.length === 2 && parseInt(hh) > 23) hh = '23'
    if (mm.length === 2 && parseInt(mm) > 59) mm = '59'
    val = hh + ':' + mm
  } else {
    const digits = val.replace(/\D/g,'').slice(0,4)
    if (digits.length >= 3) {
      let hh = digits.slice(0,2), mm = digits.slice(2,4)
      if (parseInt(hh) > 23) hh = '23'
      val = hh + ':' + mm
    } else { val = digits }
  }
  editForm.value.gio = val
  input.value = val
}

const openEditForm = (item: Schedule) => {
  editForm.value = {
    show: true,
    ma_show: String(item.id),
    ten_show: item.name,
    ngay: item.date,
    gio: item.time,
    diachi: item.location,
    ten_khachhang: item.rawKhachHang,
    sdt: item.phone,
    ma_loai_show: item.rawType
  }
}

const closeEditForm = () => {
  if (submitting.value) return
  editForm.value.show = false
}

const submitEditForm = async () => {
  if (!editForm.value.ma_show) return
  submitting.value = true
  try {
    const url = (API_ENDPOINTS as any).UPDATE_SHOW?.({
      ma_show: editForm.value.ma_show,
      ten_show: editForm.value.ten_show,
      ngay: editForm.value.ngay,
      gio: editForm.value.gio,
      diachi: editForm.value.diachi,
      ten_khachhang: editForm.value.ten_khachhang,
      sdt: editForm.value.sdt,
      ma_loai_show: editForm.value.ma_loai_show
    })
    if (!url) { showToast('API Cập nhật chưa được định nghĩa', 'error'); return }

    const res = await safeJson(await fetch(url))
    if (isSuccessResponse(res)) {
      showToast('Cập nhật show thành công!')
      editForm.value.show = false
      await fetchAllSchedules(true)
    } else {
      showToast(res?.message || 'Cập nhật thất bại!', 'error')
    }
  } catch (e) {
    console.error(e)
    showToast('Lỗi kết nối máy chủ!', 'error')
  } finally {
    submitting.value = false
  }
}

// CONFIRM & ACTIONS
const confirmModal = ref<{ show: boolean; message: string; type: 'status' | 'delete'; target: Schedule | null; newStatus: string }>({
  show: false, message: '', type: 'status', target: null, newStatus: ''
})

const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const toggleDropdown = (id: string | number) => { openDropdownId.value = openDropdownId.value === id ? null : id }
const closeDropdown  = () => { openDropdownId.value = null }

const changeStatus   = (item: Schedule, newStatus: string) => {
  closeDropdown()
  confirmModal.value = { show: true, message: `Đổi "${item.name}" → "${newStatus}"?`, type: 'status', target: item, newStatus }
}

const deleteShow     = (item: Schedule) => {
  closeDropdown()
  confirmModal.value = { show: true, message: `Xóa show "${item.name}"? Không thể hoàn tác!`, type: 'delete', target: item, newStatus: '' }
}

const closeConfirm   = () => { if (submitting.value) return; confirmModal.value.show = false }

const confirmAction = async () => {
  const { type, target, newStatus } = confirmModal.value
  if (!target) return
  submitting.value = true
  try {
    if (type === 'delete') {
      const url = (API_ENDPOINTS as any).DELETE_SHOW?.(String(target.id))
      if (!url) { showToast('API Xóa chưa được định nghĩa', 'error'); return }
      const res = await safeJson(await fetch(url))

      if (isSuccessResponse(res)) {
        showToast(`Đã xóa show "${target.name}"`)
        confirmModal.value.show = false
        await fetchAllSchedules(true)
      } else {
        showToast(res?.message || 'Xóa thất bại!', 'error')
      }
    } else {
      const url = API_ENDPOINTS.UPDATE_TRANG_THAI_SHOW(String(target.id), newStatus)
      const res = await safeJson(await fetch(url))

      if (isSuccessResponse(res)) {
        showToast(`Đã đổi trạng thái thành "${newStatus}"`)
        confirmModal.value.show = false
        await fetchAllSchedules(true)
      } else {
        showToast(res?.message || 'Cập nhật thất bại!', 'error')
      }
    }
  } catch (e) {
    console.error(e)
    showToast('Lỗi kết nối máy chủ!', 'error')
  } finally {
    submitting.value = false
  }
}

const getStatusClass = (s: string): Schedule['statusClass'] => {
  const v = (s || '').trim().toLowerCase()
  if (v === 'đã diễn')      return 'played'
  if (v === 'chưa diễn')    return 'not-played'
  if (v === 'đã hủy')       return 'cancelled'
  return 'default'
}

const mapItem = (item: any, index: number): Schedule => {
  const rawStatus = item.trang_thai || 'Chưa xác định'
  const uniqueId = item.ma_show || item.id || `show-auto-${index}-${Date.now()}`

  return {
    id:           uniqueId,
    name:         item.ten_show || 'Chưa có tên',
    type:         item.ma_loai_show || item.loai_show || item.ten_loai_show || 'Show diễn',
    date:         item.ngay     || 'Chưa cập nhật',
    time:         item.gio      || 'Chưa cập nhật',
    location:     item.diachi   || item.dia_chi || 'Chưa cập nhật',
    phone:        item.sdt      || 'Chưa cập nhật',
    status:       rawStatus,
    statusClass:  getStatusClass(rawStatus),
    rawType:      item.ma_loai_show || item.loai_show || item.ten_loai_show || '',
    rawKhachHang: item.ten_khachhang || '',
  }
}

const fetchAllSchedules = async (isBackground = false) => {
  errorMessage.value = ''

  const cachedData = sessionStorage.getItem(CACHE_KEY)
  if (cachedData && !isBackground) {
    try {
      allSchedules.value = JSON.parse(cachedData)
    } catch {
      sessionStorage.removeItem(CACHE_KEY)
    }
  }

  if (allSchedules.value.length === 0) {
    loading.value = true
  }

  try {
    const url = API_ENDPOINTS.LAY_TAT_CA_SHOW
    const res = await fetch(url).then(safeJson)

    if (res && res.success !== false) {
      const rawData = Array.isArray(res) ? res : (res.data || [])
      const mappedData = rawData.map((item: any, idx: number) => mapItem(item, idx))

      allSchedules.value = mappedData
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(mappedData))

      if (allSchedules.value.length === 0) {
        errorMessage.value = 'Không có dữ liệu lịch diễn.'
      }
    } else {
      if (allSchedules.value.length === 0) {
        errorMessage.value = res?.message || 'Không thể tải danh sách lịch diễn.'
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách show:', err)
    if (allSchedules.value.length === 0) {
      errorMessage.value = 'Lỗi kết nối máy chủ!'
    }
  } finally {
    loading.value = false
  }
}

const goToDetail = (id: string | number) => router.push({ name: 'ChiTietShow', params: { id } })

onMounted(() => {
  fetchAllSchedules()
})
</script>

<style scoped>
.schedule-page { min-height: 100vh; background: #f6f1f1; position: relative; }
.schedule-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.schedule-page__inner   { max-width: 760px; margin: 0 auto; }
.schedule-page__subtitle { margin: 0; text-align: center; font-size: 14px; color: rgba(255,255,255,.95); }
.schedule-page__content { padding: 12px 10px 60px; }

/* LOADING OVERLAY KHÓA TOÀN BỘ MÀN HÌNH */
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
  width: 42px; height: 42px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  margin-top: 14px; color: #ffffff;
  font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* CÔNG CỤ TÌM KIẾM: CÙNG 1 DÒNG */
.filter-bar-text {
  max-width: 760px;
  margin: 0 auto 12px;
  padding: 4px 0;
}

.filter-row-single {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  align-items: center;
  width: 100%;
}

/* Nút sắp xếp */
.sort-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #475569;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.sort-icon {
  width: 14px;
  height: 14px;
  stroke: #475569;
  flex-shrink: 0;
}

.sort-label {
  font-size: 12px;
  color: #475569;
  font-weight: 400;
}

/* Các Ô Lọc Dạng Chữ */
.filter-text-item {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  min-width: 0;
}

.filter-icon {
  font-size: 11px;
  margin-right: 3px;
  flex-shrink: 0;
  color: #475569;
}

.filter-text-select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #475569;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-text-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #334155;
  font-weight: 400;
  width: 100%;
  min-width: 0;
  padding: 0;
}

.filter-text-input::placeholder {
  color: #64748b;
  font-weight: 400;
}

.filter-clear-btn {
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 10px;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}
.filter-clear-btn:hover { color: #dc2626; }

.state-message         { text-align: center; padding: 30px 15px; font-weight: 700; color: #8f0000; font-size: 15px; }
.state-message--error { color: #dc2626; }
.schedule-list         { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }

.schedule-card { background: #fff; border-radius: 14px; padding: 10px 12px; border: 1px solid #ececec; box-shadow: 0 4px 10px rgba(143,0,0,.04); border-left: 5px solid #9ca3af; }
.schedule-card--played     { border-left-color: #16a34a; }
.schedule-card--not-played { border-left-color: #facc15; }
.schedule-card--cancelled  { border-left-color: #dc2626; }
.schedule-card--expired    { border-left-color: #6b7280; }
.schedule-card--default    { border-left-color: #9ca3af; }

.schedule-card__top  { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.schedule-card__name { font-size: 16px; font-weight: 800; color: #8f0000; line-height: 1.2; }
.schedule-card__tag  { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--played     { color: #15803d; background: #ecfdf3; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }
.schedule-card__tag--cancelled  { color: #be123c; background: #fff1f2; }
.schedule-card__tag--expired    { color: #374151; background: #f3f4f6; }
.schedule-card__tag--default    { color: #4b5563; background: #f3f4f6; }

.schedule-card__content { display: flex; flex-direction: column; gap: 4px; }
.schedule-card__line    { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.schedule-card__key      { font-size: 13px; font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 10px; }
.schedule-card__value   { font-size: 13px; font-weight: 500; color: #444; }
.schedule-card__actions { margin-top: 4px; display: flex; justify-content: flex-end; gap: 8px; align-items: center; }

/* SKELETON ANIMATION */
.skeleton-card { border-left-color: #cbd5e1; height: 110px; display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.skeleton-line { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 6px; }
.skeleton-title { height: 18px; width: 60%; }
.skeleton-text { height: 14px; width: 90%; }
.skeleton-text.short { width: 40%; }
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.btn { border: none; border-radius: 999px; padding: 6px 14px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }
.btn--blue  { background: #2563eb; } .btn--blue:hover:not(:disabled)  { background: #1d4ed8; }

.dropdown-wrap { position: relative; }
.status-dropdown { position: absolute; bottom: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.14); min-width: 155px; z-index: 100; display: flex; flex-direction: column; gap: 3px; }
.status-option { border: none; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; background: transparent; color: #1e293b; transition: background .12s; }
.status-option:hover          { background: #f1f5f9; }
.status-option--done:hover    { background: #dcfce7; color: #15803d; }
.status-option--pending:hover { background: #fef9c3; color: #a16207; }
.status-option--cancel:hover  { background: #fee2e2; color: #b91c1c; }
.status-option--delete        { color: #dc2626; }
.status-option--delete:hover  { background: #fee2e2; }
.status-divider   { height: 1px; background: #e2e8f0; margin: 3px 0; }
.dropdown-overlay { position: fixed; inset: 0; z-index: 99; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }

.edit-box { background: #fff; border-radius: 16px; padding: 18px 16px; width: 100%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
.edit-title  { margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.edit-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.edit-field  { display: flex; flex-direction: column; gap: 3px; }
.edit-label  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input  { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; background: #f8fafc; }
.edit-input:focus  { border-color: #2563eb; background: #fff; }
.edit-actions      { margin-top: 14px; display: flex; gap: 8px; }
.edit-actions .btn { flex: 1; padding: 9px; font-size: 13px; }

.confirm-box { background: #fff; border-radius: 14px; padding: 16px 14px; max-width: 280px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.18); text-align: center; }
.confirm-msg { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 14px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; }
.confirm-actions .btn { flex: 1; padding: 8px 10px; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 30000; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* RESPONSIVE LAYOUT */
@media (max-width: 639px) {
  .filter-row-single { gap: 3px; }
  .filter-text-select, .filter-text-input, .sort-label { font-size: 11px; }
  .filter-icon { font-size: 10px; margin-right: 2px; }
  .schedule-card { padding: 10px; }
  .schedule-card__name { font-size: 15px; }
  .schedule-card__key, .schedule-card__value { font-size: 12px; }
  .btn { font-size: 11px; padding: 5px 11px; }
  .status-dropdown { right: 0; left: auto; }
  .edit-row { grid-template-columns: 1fr; }
}
</style>

<style scoped>
.schedule-page { min-height: 100vh; background: #f6f1f1; position: relative; }
.schedule-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 14px 16px; }
.schedule-page__inner   { max-width: 760px; margin: 0 auto; }
.schedule-page__subtitle { margin: 0; text-align: center; font-size: 14px; color: rgba(255,255,255,.95); }
.schedule-page__content { padding: 12px 10px 60px; }

/* LOADING OVERLAY KHÓA TOÀN BỘ MÀN HÌNH */
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
  width: 42px; height: 42px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  margin-top: 14px; color: #ffffff;
  font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* CÔNG CỤ TÌM KIẾM: CÙNG 1 DÒNG */
.filter-bar-text {
  max-width: 760px;
  margin: 0 auto 12px;
  padding: 4px 0;
}

.filter-row-single {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  align-items: center;
  width: 100%;
}

/* Nút sắp xếp */
.sort-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #475569;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.sort-icon {
  width: 14px;
  height: 14px;
  stroke: #475569;
  flex-shrink: 0;
}

.sort-label {
  font-size: 12px;
  color: #475569;
  font-weight: 400;
}

/* Các Ô Lọc Dạng Chữ */
.filter-text-item {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  min-width: 0;
}

.filter-icon {
  font-size: 11px;
  margin-right: 3px;
  flex-shrink: 0;
  color: #475569;
}

.filter-text-select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #475569;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-text-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #334155;
  font-weight: 400;
  width: 100%;
  min-width: 0;
  padding: 0;
}

.filter-text-input::placeholder {
  color: #64748b;
  font-weight: 400;
}

.filter-clear-btn {
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 10px;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}
.filter-clear-btn:hover { color: #dc2626; }

.state-message         { text-align: center; padding: 30px 15px; font-weight: 700; color: #8f0000; font-size: 15px; }
.state-message--error { color: #dc2626; }
.schedule-list         { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }

.schedule-card { background: #fff; border-radius: 14px; padding: 10px 12px; border: 1px solid #ececec; box-shadow: 0 4px 10px rgba(143,0,0,.04); border-left: 5px solid #9ca3af; }
.schedule-card--played     { border-left-color: #16a34a; }
.schedule-card--not-played { border-left-color: #facc15; }
.schedule-card--cancelled  { border-left-color: #dc2626; }
.schedule-card--expired    { border-left-color: #6b7280; }
.schedule-card--default    { border-left-color: #9ca3af; }

.schedule-card__top  { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.schedule-card__name { font-size: 16px; font-weight: 800; color: #8f0000; line-height: 1.2; }
.schedule-card__tag  { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.schedule-card__tag--played     { color: #15803d; background: #ecfdf3; }
.schedule-card__tag--not-played { color: #a16207; background: #fffbea; }
.schedule-card__tag--cancelled  { color: #be123c; background: #fff1f2; }
.schedule-card__tag--expired    { color: #374151; background: #f3f4f6; }
.schedule-card__tag--default    { color: #4b5563; background: #f3f4f6; }

.schedule-card__content { display: flex; flex-direction: column; gap: 4px; }
.schedule-card__line    { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.schedule-card__key      { font-size: 13px; font-weight: 700; color: #8f0000; }
.schedule-card__key--inline { margin-left: 10px; }
.schedule-card__value   { font-size: 13px; font-weight: 500; color: #444; }
.schedule-card__actions { margin-top: 4px; display: flex; justify-content: flex-end; gap: 8px; align-items: center; }

/* SKELETON ANIMATION */
.skeleton-card { border-left-color: #cbd5e1; height: 110px; display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.skeleton-line { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 6px; }
.skeleton-title { height: 18px; width: 60%; }
.skeleton-text { height: 14px; width: 90%; }
.skeleton-text.short { width: 40%; }
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.btn { border: none; border-radius: 999px; padding: 6px 14px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--red   { background: #8f0000; } .btn--red:hover:not(:disabled)   { background: #a50000; }
.btn--gray  { background: #475569; } .btn--gray:hover:not(:disabled)  { background: #334155; }
.btn--green { background: #16a34a; } .btn--green:hover:not(:disabled) { background: #15803d; }
.btn--blue  { background: #2563eb; } .btn--blue:hover:not(:disabled)  { background: #1d4ed8; }

.dropdown-wrap { position: relative; }
.status-dropdown { position: absolute; bottom: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.14); min-width: 155px; z-index: 100; display: flex; flex-direction: column; gap: 3px; }
.status-option { border: none; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; background: transparent; color: #1e293b; transition: background .12s; }
.status-option:hover          { background: #f1f5f9; }
.status-option--done:hover    { background: #dcfce7; color: #15803d; }
.status-option--pending:hover { background: #fef9c3; color: #a16207; }
.status-option--cancel:hover  { background: #fee2e2; color: #b91c1c; }
.status-option--delete        { color: #dc2626; }
.status-option--delete:hover  { background: #fee2e2; }
.status-divider   { height: 1px; background: #e2e8f0; margin: 3px 0; }
.dropdown-overlay { position: fixed; inset: 0; z-index: 99; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }

.edit-box { background: #fff; border-radius: 16px; padding: 18px 16px; width: 100%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto; }
.edit-title  { margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #8f0000; text-align: center; }
.edit-fields { display: flex; flex-direction: column; gap: 10px; }
.edit-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.edit-field  { display: flex; flex-direction: column; gap: 3px; }
.edit-label  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.edit-input  { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13px; color: #1e293b; outline: none; transition: border-color .15s; background: #f8fafc; }
.edit-input:focus  { border-color: #2563eb; background: #fff; }
.edit-actions      { margin-top: 14px; display: flex; gap: 8px; }
.edit-actions .btn { flex: 1; padding: 9px; font-size: 13px; }

.confirm-box { background: #fff; border-radius: 14px; padding: 16px 14px; max-width: 280px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.18); text-align: center; }
.confirm-msg { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 14px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; }
.confirm-actions .btn { flex: 1; padding: 8px 10px; }

.toast-pill { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.18); z-index: 30000; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.toast-pill--success { background: #15803d; }
.toast-pill--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* RESPONSIVE LAYOUT */
@media (max-width: 639px) {
  .filter-row-single { gap: 3px; }
  .filter-text-select, .filter-text-input, .sort-label { font-size: 11px; }
  .filter-icon { font-size: 10px; margin-right: 2px; }
  .schedule-card { padding: 10px; }
  .schedule-card__name { font-size: 15px; }
  .schedule-card__key, .schedule-card__value { font-size: 12px; }
  .btn { font-size: 11px; padding: 5px 11px; }
  .status-dropdown { right: 0; left: auto; }
  .edit-row { grid-template-columns: 1fr; }
}
</style>