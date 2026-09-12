<template>
  <div class="staff-section">
    <div class="staff-header">
      <span class="staff-title">Danh sách nhân sự tham gia</span>
    </div>

    <div v-if="loadingStaff" class="staff-loading">Đang tải nhân sự...</div>
    <div v-else-if="localStaffList.length === 0 && !canEdit" class="staff-empty">Chưa có nhân sự nào tham gia.</div>

    <div v-else class="staff-table-wrapper">
      <table class="staff-table">
        <thead>
          <tr>
            <th class="col-stt">#</th>
            <th class="col-name">Tên</th>
            <th class="col-role">Vai trò</th>
            <th class="col-salary">Lương</th>
            <th class="col-note">Ghi chú</th>
            <th v-if="canEdit" class="col-action"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in localStaffList" :key="index">
            <td class="col-stt">{{ index + 1 }}</td>

            <!-- Tên -->
            <td class="col-name">
              <template v-if="canEdit">
                <select v-model="item.ten_ns" class="cell-input">
                  <option value=""></option>
                  <option v-if="item.ten_ns && !danhSachTen.includes(item.ten_ns)" :value="item.ten_ns">{{ item.ten_ns }}</option>
                  <option v-for="ten in danhSachTen" :key="ten" :value="ten">{{ ten }}</option>
                </select>
              </template>
              <span v-else class="staff-text">{{ item.ten_ns || '—' }}</span>
            </td>

            <!-- Vai trò -->
            <td class="col-role">
              <template v-if="canEdit">
                <select v-model="item.vai_tro" class="cell-input">
                  <option value=""></option>
                  <option v-if="item.vai_tro && !defaultRoles.includes(item.vai_tro)" :value="item.vai_tro">{{ item.vai_tro }}</option>
                  <option v-for="role in defaultRoles" :key="role" :value="role">{{ role }}</option>
                </select>
              </template>
              <span v-else class="staff-text">{{ item.vai_tro || '—' }}</span>
            </td>

            <!-- Lương -->
            <td class="col-salary">
              <template v-if="canEdit">
                <input
                  v-if="item.isCustomSalary"
                  v-model="item.luong"
                  type="text"
                  class="cell-input"
                  placeholder="Số tiền..."
                  inputmode="numeric"
                  @input="handleCustomSalaryInput(item, $event)"
                  @blur="handleCustomSalaryBlur(item)"
                />
                <select
                  v-else
                  v-model="item.selectedSalaryMode"
                  class="cell-input"
                  @change="handleSalaryModeChange(item)"
                >
                  <option value=""></option>
                  <option v-for="s in defaultSalaries" :key="s" :value="s">{{ s }}</option>
                  <option value="custom">Khác...</option>
                </select>
              </template>
              <span v-else class="staff-text">{{ item.luong || '—' }}</span>
            </td>

            <!-- Ghi chú -->
            <td class="col-note">
              <template v-if="canEdit">
                <input v-model="item.ghi_chu" type="text" class="cell-input" placeholder="Ghi chú" />
              </template>
              <span v-else class="staff-text">{{ item.ghi_chu || '—' }}</span>
            </td>

            <!-- Xóa -->
            <td v-if="canEdit" class="col-action">
              <button type="button" class="btn-remove" @click="removeStaffRow(index)">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="canEdit" class="staff-footer">
      <button type="button" class="btn-add-staff" @click="addStaffRow">+ Thêm nhân sự</button>
      
      <!-- Nút Lưu danh sách nhân sự CHỈ xuất hiện khi vừa chọn tạm sang 'đã diễn' -->
      <button v-if="isDaDienPendingSave" type="button" class="btn-save-staff" :disabled="isSavingStaff" @click="$emit('save-staff')">
        {{ isSavingStaff ? 'Đang lưu...' : 'Lưu trạng thái và nhân sự' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { API_ENDPOINTS } from '../config/api'

type StaffItem = {
  ten_ns: string; vai_tro: string; luong: string; ghi_chu: string
  rowIndex?: number; selectedSalaryMode?: string; isCustomSalary?: boolean; isNew?: boolean
}

const props = defineProps<{
  staffList: StaffItem[]
  loadingStaff: boolean
  isEditing: boolean
  isDaDienPendingSave?: boolean
  isSavingStaff?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:staffList', value: StaffItem[]): void
  (e: 'save-staff'): void
}>()

// ── DANH SÁCH TÊN ──
const danhSachTen = ref<string[]>([])
const fetchDanhSachTen = async () => {
  try {
    const res  = await fetch(API_ENDPOINTS.LAY_TAT_CA_TEN_NHAN_SU, { redirect: 'follow' })
    const json = JSON.parse(await res.text())
    if (json && Array.isArray(json.data)) danhSachTen.value = json.data
  } catch {}
}
onMounted(fetchDanhSachTen)

const defaultRoles    = ['Lân','Trống chính','Thần tài','Xỏa','Lò','Trống hội','Rồng đơn','Rồng gậy','Rồng khúc']
const defaultSalaries = ['50.000','100.000','200.000','300.000']

// Kích hoạt sửa khi ở chế độ isEditing HOẶC khi tạm thời chuyển sang 'đã diễn'
const canEdit = computed(() => props.isEditing || !!props.isDaDienPendingSave)

const localStaffList = computed({
  get: () => props.staffList || [],
  set: (val) => emit('update:staffList', val),
})

// ── KHỞI TẠO SALARY MODE ──
const initSalaryMode = (list: StaffItem[]) => {
  list.forEach((item) => {
    if (!item.luong) {
      item.selectedSalaryMode = ''; item.isCustomSalary = false
    } else if (defaultSalaries.includes(item.luong)) {
      item.selectedSalaryMode = item.luong; item.isCustomSalary = false
    } else {
      item.selectedSalaryMode = 'custom'; item.isCustomSalary = true
    }
  })
}

watch(() => props.staffList, (v) => { if (v?.length) initSalaryMode(v) }, { immediate: true, deep: false })
watch(canEdit, (val) => { if (val && localStaffList.value.length) initSalaryMode(localStaffList.value) })

// ── XỬ LÝ LƯƠNG ──
const handleSalaryModeChange = (item: StaffItem) => {
  if (item.selectedSalaryMode === 'custom') { item.isCustomSalary = true; item.luong = '' }
  else { item.isCustomSalary = false; item.luong = item.selectedSalaryMode || '' }
}

const handleCustomSalaryInput = (item: StaffItem, event: Event) => {
  const el = event.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '')
  item.luong = digits
  el.value = digits
}

const handleCustomSalaryBlur = (item: StaffItem) => {
  if (!item.luong) { 
    item.isCustomSalary = false
    item.selectedSalaryMode = '' 
    return
  }
  
  const digits = item.luong.replace(/\D/g, '')
  if (digits) {
    item.luong = new Intl.NumberFormat('vi-VN').format(BigInt(digits))
  } else {
    item.luong = ''
    item.isCustomSalary = false
    item.selectedSalaryMode = ''
  }
}

// ── THÊM / XÓA ──
const addStaffRow = () => {
  emit('update:staffList', [
    ...localStaffList.value,
    {
      ten_ns: '', vai_tro: '', luong: '', ghi_chu: '',
      rowIndex: localStaffList.value.length,
      selectedSalaryMode: '', isCustomSalary: false,
      isNew: true,
    },
  ])
}

const removeStaffRow = (index: number) => {
  const list = [...localStaffList.value]
  list.splice(index, 1)
  emit('update:staffList', list)
}
</script>

<style scoped>
.staff-section {
  background: #fff; border-radius: 14px; padding: 14px; margin-top: 12px;
  border: 1px solid #ececec; box-shadow: 0 4px 10px rgba(143,0,0,.04); overflow: hidden;
}
.staff-header { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.staff-title  { color: #8f0000; font-size: 14px; font-weight: 800; }
.staff-loading, .staff-empty { text-align: center; padding: 20px; font-size: 13px; color: #666; }

.staff-table-wrapper { overflow-x: visible; }
.staff-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.staff-table th {
  color: #8f0000; font-size: 11px; font-weight: 700;
  padding: 7px 3px; text-align: left;
  border-bottom: 2px solid #fca5a5; background: #fef2f2; white-space: nowrap;
}
.staff-table td { padding: 4px 2px; vertical-align: middle; }
.staff-table tr:not(:last-child) td { border-bottom: 1px solid #f8f8f8; }
.staff-table tr:hover td { background: #fafafa; }

.col-stt    { width: 16px; text-align: center; font-size: 10px; color: #94a3b8; padding: 0 2px !important; }
.col-name   { width: 28%; }
.col-role   { width: 24%; }
.col-salary { width: 22%; }
.col-note   { width: auto; }
.col-action { width: 20px; text-align: center; }

.cell-input {
  display: block; width: 100%;
  font-size: 13px; padding: 4px 6px;
  border: 1px solid #e2e8f0; border-radius: 7px;
  outline: none; background: #fff; color: #1e293b;
  box-sizing: border-box; appearance: auto; -webkit-appearance: auto;
}
@supports (-webkit-touch-callout: none) {
  .cell-input { font-size: 16px; }
}
.cell-input:focus { border-color: #8f0000; }

.staff-text { font-size: 12px; color: #334155; padding: 0 2px; display: block; word-break: break-word; }

.btn-remove {
  background: #ef4444; color: #fff; border: none;
  width: 20px; height: 20px; border-radius: 5px;
  font-size: 10px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; margin: 0 auto;
}
.btn-remove:hover { background: #dc2626; }

.staff-footer { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
.btn-add-staff {
  background: #10b981; color: #fff; border: none;
  padding: 7px 18px; border-radius: 999px;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .2s;
}
.btn-add-staff:hover { opacity: .88; }

.btn-save-staff {
  background: #8f0000; color: #fff; border: none;
  padding: 7px 18px; border-radius: 999px;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity .2s;
}
.btn-save-staff:hover { opacity: .88; }
.btn-save-staff:disabled { opacity: .6; cursor: not-allowed; }
</style>