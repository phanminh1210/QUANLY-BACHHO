<template>
  <div class="home-page">
    <section class="home-top">
      <div class="home-top__inner">
        <p class="home-subtitle">Hệ thống quản lý LSR BẠCH HỔ ĐƯỜNG</p>

        <div class="home-menu">
          <router-link class="home-menu__item" to="/tat-ca-lich-dien">
            Tất cả lịch diễn
          </router-link>

          <router-link class="home-menu__item" to="/show-chua-dien">
            Show chưa diễn
          </router-link>

          <router-link class="home-menu__item" to="/show-da-dien">
            Show đã diễn
          </router-link>

          <button class="home-menu__item" type="button">
            Thông tin nhân sự
          </button>

          <button class="home-menu__item" type="button">
            Thông tin khách hàng
          </button>

          <router-link class="home-menu__item" to="/cham-cong">
            Danh sách chấm công
          </router-link>
        </div>
      </div>
    </section>

    <section class="home-bottom">
      <div class="next-show-card">
        <div class="next-show-card__header">
          <span class="next-show-card__label">Lịch diễn tiếp theo gần nhất</span>
          <span class="next-show-card__badge">Sắp diễn</span>
        </div>

        <div class="next-show-card__content">
          <div class="next-show-card__line">
            <span class="next-show-card__key">Tên Show:</span>
            <span class="next-show-card__value">ABS</span>
          </div>

          <div class="next-show-card__line">
            <span class="next-show-card__key">Ngày:</span>
            <span class="next-show-card__value">20/08/2026</span>
            <span class="next-show-card__key next-show-card__key--inline">Giờ:</span>
            <span class="next-show-card__value">09:00</span>
          </div>

          <div class="next-show-card__line">
            <span class="next-show-card__key">Địa điểm:</span>
            <span class="next-show-card__value">Hưng Yên</span>
          </div>

          <div class="next-show-card__line">
            <span class="next-show-card__key">SĐT:</span>
            <span class="next-show-card__value">09987777q37</span>
          </div>

          <div class="next-show-card__actions">
            <button class="next-show-card__detail-btn" type="button">
              Chi tiết
            </button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stats-card stats-card--gold">
          <div class="stats-title-row">
            <span class="stats-title-icon">💰</span>
            <span class="stats-label">Doanh thu năm</span>
          </div>

          <div class="money-row">
            <button class="money-toggle" type="button" @click="toggleMoney">
              <span v-if="showMoney">🙈</span>
              <span v-else>👁️</span>
            </button>
            <strong class="stats-value">{{ showMoney ? '1,250,000,000đ' : '***' }}</strong>
          </div>

          <span class="stats-note">Tổng doanh thu cả năm</span>
        </div>

        <div class="stats-card stats-card--red">
          <div class="stats-title-row">
            <span class="stats-title-icon">💵</span>
            <span class="stats-label">Doanh thu quý</span>
          </div>

          <div class="money-row">
            <button class="money-toggle" type="button" @click="toggleMoney">
              <span v-if="showMoney">🙈</span>
              <span v-else>👁️</span>
            </button>
            <strong class="stats-value">{{ showMoney ? '320,000,000đ' : '***' }}</strong>
          </div>

          <span class="stats-note">Tổng doanh thu 3 tháng gần nhất</span>
        </div>

        <div class="stats-card stats-card--soft">
          <div class="stats-title-row">
            <span class="stats-title-icon">💸</span>
            <span class="stats-label">Doanh thu tháng</span>
          </div>

          <div class="money-row">
            <button class="money-toggle" type="button" @click="toggleMoney">
              <span v-if="showMoney">🙈</span>
              <span v-else>👁️</span>
            </button>
            <strong class="stats-value">{{ showMoney ? '85,000,000đ' : '***' }}</strong>
          </div>

          <span class="stats-note">Doanh thu trong tháng hiện tại</span>
        </div>

        <div class="stats-card stats-card--dark">
          <div class="stats-title-row">
            <span class="stats-title-icon">🪙</span>
            <span class="stats-label">Doanh thu tuần</span>
          </div>

          <div class="money-row">
            <button class="money-toggle" type="button" @click="toggleMoney">
              <span v-if="showMoney">🙈</span>
              <span v-else>👁️</span>
            </button>
            <strong class="stats-value">{{ showMoney ? '18,500,000đ' : '***' }}</strong>
          </div>

          <span class="stats-note">Doanh thu trong 7 ngày qua</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showMoney = ref(false)

const toggleMoney = () => {
  showMoney.value = !showMoney.value
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
}

.home-top {
  background: linear-gradient(180deg, #8f0000 0%, #a50000 55%, #cf0000 100%);
  color: #fff;
  padding: 14px 16px 16px;
}

.home-top__inner {
  max-width: 760px;
  margin: 0 auto;
}

.home-subtitle {
  margin: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.home-menu {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.home-menu__item {
  border: none;
  border-radius: 999px;
  padding: 9px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #8f0000;
  background: #fff;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-menu__item:hover {
  background: #ffd700;
  color: #8f0000;
}

.home-menu__item:last-child {
  grid-column: 1 / -1;
}

.home-bottom {
  flex: 1;
  background: #f3f4f6;
  padding: 16px 14px;
  box-sizing: border-box;
}

.next-show-card {
  max-width: 760px;
  margin: 0 auto 12px;
  background: #fff;
  border-radius: 16px;
  padding: 12px 14px 10px;
  box-shadow: 0 8px 16px rgba(143, 0, 0, 0.06);
  border: 1px solid #f1f1f1;
}

.next-show-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.next-show-card__label {
  font-size: 13px;
  font-weight: 800;
  color: #8f0000;
}

.next-show-card__badge {
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #8f0000;
  background: #ffd700;
}

.next-show-card__content {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.next-show-card__line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.next-show-card__key {
  font-size: 12px;
  font-weight: 700;
  color: #8f0000;
}

.next-show-card__key--inline {
  margin-left: 12px;
}

.next-show-card__value {
  font-size: 13px;
  font-weight: 500;
  color: #444;
}

.next-show-card__actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.next-show-card__detail-btn {
  border: none;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #8f0000;
  cursor: pointer;
}

.next-show-card__detail-btn:hover {
  background: #a50000;
}

.stats-grid {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.stats-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 10px 12px 9px;
  color: #fff;
  box-shadow: 0 10px 18px rgba(143, 0, 0, 0.10);
  min-height: 88px;
}

.stats-card::before {
  content: "";
  position: absolute;
  top: -18px;
  right: -16px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.stats-card--gold {
  background: linear-gradient(135deg, #8f0000 0%, #a50000 100%);
}

.stats-card--red {
  background: linear-gradient(135deg, #6f0000 0%, #8f0000 100%);
}

.stats-card--soft {
  background: linear-gradient(135deg, #a50000 0%, #cf0000 100%);
}

.stats-card--dark {
  background: linear-gradient(135deg, #5d0000 0%, #8f0000 100%);
}

.stats-title-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-title-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.16);
  flex-shrink: 0;
}

.stats-label {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255, 215, 0, 0.95);
  line-height: 1.1;
}

.money-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
}

.money-toggle {
  border: none;
  background: rgba(255, 255, 255, 0.16);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  color: #fff;
  flex-shrink: 0;
}

.stats-value {
  display: block;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.1px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.stats-note {
  position: relative;
  z-index: 1;
  margin-top: 6px;
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.35;
}

@media (max-width: 640px) {
  .home-menu {
    grid-template-columns: 1fr;
  }

  .home-menu__item:last-child {
    grid-column: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .stats-card {
    min-height: 84px;
    padding: 9px 10px 8px;
  }

  .stats-label {
    font-size: 11px;
  }

  .stats-value {
    font-size: 14px;
  }

  .stats-note {
    font-size: 9px;
  }
}
</style>