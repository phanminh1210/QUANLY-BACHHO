
<template>
  <div class="show-card" :class="statusClass">
    <div class="corner-decoration"></div>

    <div class="show-content">
      <h3 class="show-name">{{ tenShow }}</h3>

      <div class="show-info">
        <div class="info-item">
          <span class="info-label">Ngày:</span>
          <span class="info-value">{{ ngay }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Giờ:</span>
          <span class="info-value">{{ gio }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Trạng thái:</span>
          <span class="show-status" :class="statusClass">
            {{ trangThai }}
          </span>
        </div>
      </div>
    </div>

    <div class="show-actions">
      <ButtonDangKyShow
        :show-id="showId"
        text="Đăng ký"
        :disabled="!showId"
      />

      <ButtonChiTiet
        :show-id="showId"
        text="Chi tiết"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ButtonDangKyShow from './common/ButtonDangKyShow.vue'
import ButtonChiTiet from './common/ButtonChiTiet.vue'

const props = defineProps<{
  showId: string | number
  tenShow: string
  ngay: string
  gio: string
  trangThai: string
}>()

const statusClass = computed(() => {
  const status = String(props.trangThai || '')
    .trim()
    .toLowerCase()

  if (status === 'chưa diễn') return 'status-pending'
  if (status === 'đã diễn') return 'status-done'
  if (status === 'đã hủy') return 'status-cancelled'

  return 'status-default'
})
</script>

<style scoped>
.show-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 12px 14px;
  border-radius: 11px;
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.show-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.09);
}

.corner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-top: 25px solid #facc15;
  border-right: 25px solid transparent;
}

.show-card.status-pending .corner-decoration {
  border-top-color: #facc15;
}

.show-card.status-done .corner-decoration {
  border-top-color: #16a34a;
}

.show-card.status-cancelled .corner-decoration {
  border-top-color: #dc2626;
}

.show-name {
  margin: 0 0 8px;
  padding-left: 18px;
  font-size: 17px;
  font-weight: 800;
  color: #8f0000;
  line-height: 1.3;
}

.show-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.info-label {
  min-width: 65px;
  color: #111111;
  font-size: 12px;
  font-weight: 700;
}

.info-value {
  color: #8f0000;
  font-size: 13px;
  font-weight: 800;
}

.show-status {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
}

.show-status.status-pending {
  color: #8f0000;
  background: #facc15;
}

.show-status.status-done {
  color: #ffffff;
  background: #16a34a;
}

.show-status.status-cancelled {
  color: #ffffff;
  background: #dc2626;
}

.show-status.status-default {
  color: #8f0000;
  background: #f1f5f9;
}

.show-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .show-card {
    padding: 10px 11px;
  }

  .show-name {
    font-size: 16px;
  }

  .info-label {
    min-width: 58px;
  }
}
</style>
