<template>
  <div class="nhansu-page">
    <section class="nhansu-page__header">
      <div class="nhansu-page__inner">
        <h2 class="nhansu-page__title">Bảng thông tin nhân sự</h2>
      </div>
    </section>

    <section class="nhansu-page__content">
      <div class="table-card">
        <div v-if="loading" class="state-msg">Đang tải dữ liệu nhân sự...</div>
        <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

        <div v-else class="table-wrapper">
          <table class="staff-table">
            <thead>
              <tr>
                <th>Mã NS</th>
                <th>Tên nhân sự</th>
                <th>Năm sinh</th>
                <th>Địa chỉ</th>
                <th>SĐT</th>
                <th>Ghi chú</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="staffList.length === 0">
                <td colspan="7" class="empty-cell">Không có dữ liệu nhân sự</td>
              </tr>

              <tr v-for="item in staffList" :key="item.ma_ns">
                <td>{{ item.ma_ns || '-' }}</td>
                <td>{{ item.ten_ns || '-' }}</td>
                <td>{{ item.nam_sinh || '-' }}</td>
                <td>{{ item.dia_chi || '-' }}</td>
                <td>{{ item.sdt || '-' }}</td>
                <td>{{ item.ghi_chu || '-' }}</td>
                <td>
                  <button class="detail-btn" type="button" @click="onViewDetail(item)">Chi tiết</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="detailVisible" class="popup-backdrop" @click.self="closeDetail">
      <div class="popup-card">
        <div class="popup-card__header">
          <h3 class="popup-card__title">Chi tiết nhân sự</h3>
          <button class="popup-card__close" type="button" @click="closeDetail">×</button>
        </div>

        <div class="popup-card__body" v-if="selectedStaff">
          <div class="detail-row"><span class="detail-key">Mã NS:</span><span class="detail-value">{{ selectedStaff.ma_ns || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Tên nhân sự:</span><span class="detail-value">{{ selectedStaff.ten_ns || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Năm sinh:</span><span class="detail-value">{{ selectedStaff.nam_sinh || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Địa chỉ:</span><span class="detail-value">{{ selectedStaff.dia_chi || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">SĐT:</span><span class="detail-value">{{ selectedStaff.sdt || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Ghi chú:</span><span class="detail-value">{{ selectedStaff.ghi_chu || '-' }}</span></div>

          <hr class="sep" />

          <div class="detail-row"><span class="detail-key">Tài khoản:</span><span class="detail-value">{{ selectedStaff.tai_khoan || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Mật khẩu:</span><span class="detail-value">{{ selectedStaff.mat_khau || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Ảnh đại diện:</span><span class="detail-value">{{ selectedStaff.anh_dai_dien || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Vai trò:</span><span class="detail-value">{{ selectedStaff.vai_tro || '-' }}</span></div>
          <div class="detail-row"><span class="detail-key">Quyền:</span><span class="detail-value">{{ selectedStaff.quyen || '-' }}</span></div>
        </div>

        <div class="popup-card__actions">
          <button class="action-btn action-btn--delete" type="button" :disabled="deleting" @click="onDeleteDetail">
            {{ deleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
          <button class="close-btn" type="button" :disabled="deleting" @click="closeDetail">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { API_ENDPOINTS } from '../config/api'

type StaffItem = {
  ma_ns: string
  ten_ns: string
  nam_sinh: string | number
  dia_chi: string
  sdt: string
  tai_khoan: string
  mat_khau: string
  anh_dai_dien: string
  vai_tro: string
  quyen: string
  ghi_chu: string
}

const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const staffList = ref<StaffItem[]>([])
const detailVisible = ref(false)
const selectedStaff = ref<StaffItem | null>(null)

const fetchStaff = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(API_ENDPOINTS.GET_ALL_NHAN_SU, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    const ok = json?.code === 200 || json?.status === 'success'
    if (!ok) throw new Error(json?.message || 'Không lấy được danh sách nhân sự')

    staffList.value = Array.isArray(json?.data) ? json.data : []
  } catch (e: any) {
    error.value = e?.message || 'Lỗi tải danh sách nhân sự'
    staffList.value = []
  } finally {
    loading.value = false
  }
}

const onViewDetail = (item: StaffItem) => {
  selectedStaff.value = item
  detailVisible.value = true
}

const closeDetail = () => {
  if (deleting.value) return
  detailVisible.value = false
  selectedStaff.value = null
}

const onDeleteDetail = async () => {
  if (!selectedStaff.value || deleting.value) return

  const maNs = (selectedStaff.value.ma_ns || '').trim()
  if (!maNs) return alert('Thiếu mã nhân sự')

  const confirmed = window.confirm(`Bạn chắc chắn muốn xóa nhân sự ${maNs}?`)
  if (!confirmed) return

  deleting.value = true
  try {
    const res = await fetch(API_ENDPOINTS.DELETE_NHAN_SU(maNs), { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    const ok = json?.code === 200 || json?.status === 'success'
    if (!ok) throw new Error(json?.message || 'Xóa nhân sự thất bại')

    staffList.value = staffList.value.filter(
      (s) => (s.ma_ns || '').trim().toUpperCase() !== maNs.toUpperCase(),
    )

    closeDetail()
    alert('Xóa nhân sự thành công')
  } catch (e: any) {
    alert(e?.message || 'Lỗi khi xóa nhân sự')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchStaff)
</script>

<style scoped>
.nhansu-page { min-height: 100vh; background: #f6f1f1; }
.nhansu-page__header { background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%); color: #fff; padding: 10px 14px; }
.nhansu-page__inner { max-width: 100%; margin: 0 auto; }
.nhansu-page__title { margin: 0; text-align: center; font-size: 15px; font-weight: 800; color: #ffd700; }
.nhansu-page__content { padding: 8px; }
.table-card { width: 100%; margin: 0 auto; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 6px 12px rgba(143,0,0,.05); border: 1px solid #ececec; box-sizing: border-box; }
.state-msg { text-align: center; font-size: 11px; padding: 12px; color: #666; font-weight: 600; }
.state-msg--error { color: #d32f2f; }
.table-wrapper { width: 100%; overflow: hidden; }
.staff-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.staff-table th, .staff-table td { border: 1px solid #e7e7e7; text-align: center; font-size: 11px; padding: 6px 4px; line-height: 1.25; word-break: break-word; }
.staff-table th { background: #8f0000; color: #fff; font-weight: 800; }
.staff-table tbody tr:nth-child(even) { background: #fff8f8; }
.empty-cell { padding: 12px; color: #888; font-style: italic; }
.detail-btn { border: none; border-radius: 999px; padding: 2px 6px; font-size: 9px; font-weight: 600; line-height: 1.1; color: #fff; background: #8f0000; cursor: pointer; white-space: nowrap; }
.popup-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 14px; }
.popup-card { width: 100%; max-width: 420px; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,.2); }
.popup-card__header { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, #8f0000 0%, #a50000 100%); color: #fff; padding: 12px 14px; }
.popup-card__title { margin: 0; font-size: 15px; font-weight: 800; }
.popup-card__close { border: none; background: transparent; color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
.popup-card__body { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: grid; grid-template-columns: 90px 1fr; gap: 8px; }
.detail-key { color: #8f0000; font-weight: 700; font-size: 13px; }
.detail-value { color: #333; font-size: 13px; word-break: break-word; }
.sep { border: none; border-top: 1px solid #eee; margin: 6px 0; }
.popup-card__actions { padding: 0 14px 14px; display: flex; justify-content: flex-end; gap: 8px; }
.action-btn { border: none; border-radius: 999px; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #fff; cursor: pointer; }
.action-btn--delete { background: #dc2626; }
.close-btn { border: none; border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: #fff; background: #8f0000; cursor: pointer; }
</style>