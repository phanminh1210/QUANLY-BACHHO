<template>
  <div class="detail-page">
    <section class="detail-page__header">
      <div class="detail-page__inner">
        <h2 class="detail-page__title">Chi tiết show</h2>
        <p class="detail-page__subtitle">Thông tin show và danh sách nhân sự tham gia</p>
      </div>
    </section>

    <section class="detail-page__content">
      <div class="detail-card">
        <div class="detail-info">
          <div class="detail-info__row">
            <span class="detail-info__label">Tên show:</span>
            <span class="detail-info__value">{{ show.name }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">Loại show:</span>
            <span class="detail-info__value">{{ show.type }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">Ngày:</span>
            <span class="detail-info__value">{{ show.date }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">Giờ:</span>
            <span class="detail-info__value">{{ show.time }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">Địa điểm:</span>
            <span class="detail-info__value">{{ show.location }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">SĐT:</span>
            <span class="detail-info__value">{{ show.phone }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">Giá:</span>
            <span class="detail-info__value">{{ show.price }}</span>
          </div>

          <div class="detail-info__row">
            <span class="detail-info__label">Tiền xe:</span>
            <span class="detail-info__value">{{ show.transportFee }}</span>
          </div>
        </div>
      </div>

      <div class="staff-card">
        <h3 class="staff-card__title">Danh sách nhân sự tham gia</h3>

        <div class="staff-table">
          <div class="staff-table__header">
            <span>STT</span>
            <span>Tên</span>
            <span>Vai trò</span>
            <span>Mức lương</span>
            <span>Ghi chú</span>
          </div>

          <div v-for="(staff, index) in show.staffs" :key="index" class="staff-table__row">
            <span>{{ index + 1 }}</span>
            <span>{{ staff.name }}</span>
            <span>{{ staff.role }}</span>
            <span>{{ staff.salary }}</span>
            <span>{{ staff.note }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const show = {
  name: 'ABS',
  type: 'Show ca nhạc',
  date: '20/08/2026',
  time: '09:00',
  location: 'Hưng Yên',
  phone: '09987777q37',
  price: '50,000,000đ',
  transportFee: '2,000,000đ',
  staffs: [
    { name: 'Nguyễn Văn A', role: 'Ca sĩ', salary: '5,000,000đ', note: 'Đúng giờ' },
    { name: 'Trần Thị B', role: 'Vũ công', salary: '3,500,000đ', note: 'Trang phục đầy đủ' },
    { name: 'Lê Văn C', role: 'MC', salary: '4,000,000đ', note: 'Chuẩn bị kịch bản' },
  ],
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f6f1f1;
}

.detail-page__header {
  background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%);
  color: #fff;
  padding: 14px 16px;
}

.detail-page__inner {
  max-width: 760px;
  margin: 0 auto;
}

.detail-page__title {
  margin: 0;
  text-align: center;
  font-size: 20px;
  color: #ffd700;
}

.detail-page__subtitle {
  margin: 4px 0 0;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.95);
}

.detail-page__content {
  max-width: 760px;
  margin: 0 auto;
  padding: 12px;
}

.detail-card,
.staff-card {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ececec;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-info__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-info__label {
  min-width: 92px;
  color: #8f0000;
  font-size: 13px;
  font-weight: 700;
}

.detail-info__value {
  color: #333;
  font-size: 14px;
}

.staff-card__title {
  margin: 0 0 10px;
  font-size: 16px;
  color: #8f0000;
  font-weight: 800;
}

.staff-table {
  width: 100%;
  overflow-x: auto;
}

.staff-table__header,
.staff-table__row {
  display: grid;
  grid-template-columns: 50px 1.2fr 1fr 1fr 1.2fr;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
}

.staff-table__header {
  background: #f8eaea;
  color: #8f0000;
  font-size: 12px;
  font-weight: 800;
  border-radius: 10px;
}

.staff-table__row {
  border-bottom: 1px solid #f1f1f1;
  font-size: 13px;
  color: #333;
}

@media (max-width: 640px) {
  .detail-info__label {
    min-width: 84px;
    font-size: 12px;
  }

  .detail-info__value {
    font-size: 13px;
  }

  .staff-table__header,
  .staff-table__row {
    grid-template-columns: 42px 1.1fr 1fr 1fr 1.1fr;
    font-size: 12px;
  }

  .detail-page__title {
    font-size: 19px;
  }
}
</style>