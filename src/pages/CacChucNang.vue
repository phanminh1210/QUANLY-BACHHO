
<template>
  <div class="cac-chuc-nang">
    <div class="section-title margin-top-lg">{{ title }}</div>

    <div class="home-menu">
      <router-link
        v-for="item in visibleMenuItems"
        :key="item.to"
        class="home-menu__item"
        :to="item.to"
      >
        <img :src="item.icon" :alt="item.label" class="menu-icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import iconDaDien from '../assets/icondadien.jpg'
import iconchuadien from '../assets/iconchuadien.jpg'
import iconChamCong from '../assets/chamcong.jpg'
import iconTatCaShow from '../assets/tatcashow.jpg'
import iconNhanSu from '../assets/nhansu.jpg'
import iconKhachHang from '../assets/khachhang.jpg'
import iconTienUng from '../assets/tienung.png'
import iconUngTienChoNS from '../assets/ungtienchons.png'

export type ChucNangItem = {
  label: string
  to: string
  icon: string
  adminOnly?: boolean
}

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean
    title?: string
    items?: ChucNangItem[]
  }>(),
  {
    isAdmin: false,
    title: 'Các chức năng hệ thống',
    items: () => [
      {
        label: 'Tất cả lịch diễn',
        to: '/tat-ca-lich-dien',
        icon: iconTatCaShow,
      },
      {
        label: 'Show chưa diễn',
        to: '/show-chua-dien',
        icon: iconchuadien,
      },
      {
        label: 'Show đã diễn',
        to: '/show-da-dien',
        icon: iconDaDien,
      },
      {
        label: 'Danh sách chấm công',
        to: '/cham-cong',
        icon: iconChamCong,
      },
      {
        label: 'Nhân sự',
        to: '/nhan-su',
        icon: iconNhanSu,
        adminOnly: true,
      },
      {
        label: 'Khách hàng',
        to: '/khach-hang',
        icon: iconKhachHang,
        adminOnly: true,
      },
      {
        label: 'Lịch sử ứng tiền',
        to: '/tien-ung',
        icon: iconTienUng,
      },
      {
        label: 'Ứng tiền cho NS',
        to: '/add-ung-tien-cho-ns',
        icon: iconUngTienChoNS,
        adminOnly: true,
      },
    ],
  }
)

const visibleMenuItems = computed(() => {
  return props.items.filter((item) => !item.adminOnly || props.isAdmin)
})
</script>

<style scoped>
.section-title {
  max-width: 760px;
  margin: 0 auto 8px;
  font-size: 15px;
  font-weight: 800;
  color: #8f0000;
}

.margin-top-lg {
  margin-top: 26px;
}

.home-menu {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  justify-content: start;
  gap: 14px 8px;
  padding: 4px 0;
}

.home-menu__item {
  background: transparent;
  border: none;
  padding: 4px 2px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  text-align: center;
  transition: transform 0.2s ease;
}

.home-menu__item:hover {
  transform: translateY(-3px);
}

.home-menu__item span {
  font-size: 13px;
  font-weight: 800;
  color: #8f0000;
  line-height: 1.35;
  word-break: break-word;
}

.menu-icon {
  width: 58px;
  height: 58px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.home-menu__item:hover .menu-icon {
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .menu-icon {
    width: 50px;
    height: 50px;
  }

  .home-menu__item span {
    font-size: 12px;
  }

  .home-menu {
    gap: 12px 6px;
  }
}
</style>
