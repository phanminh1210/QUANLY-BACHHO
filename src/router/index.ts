import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import các trang chính
import Login from '../pages/Login.vue'
import MainLayout from '../layouts/MainLayout.vue'
import Home from '../pages/Home.vue'
import Dashboard from '../pages/Dashboard.vue'
import TatCaLichDien from '../pages/TatCaLichDien.vue'
import ShowChuaDien from '../pages/ShowChuaDien.vue'
import ShowDaDien from '../pages/ShowDaDien.vue'
import ChiTietShow from '../pages/ChiTietShow.vue'  
import ChamCong from '../pages/ChamCong.vue'
import NhanSu from '../pages/NhanSu.vue'

// Import trang Đăng ký show (sử dụng Lazy Load)
const DangKyShow = () => import('../pages/DangKyShow.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home,
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'tat-ca-lich-dien',
        name: 'TatCaLichDien',
        component: TatCaLichDien,
      },
      {
        path: 'show-chua-dien',
        name: 'ShowChuaDien',
        component: ShowChuaDien,
      },
      {
        path: 'show-da-dien',
        name: 'ShowDaDien',
        component: ShowDaDien,
      },
      {
        path: 'cham-cong',
        name: 'ChamCong',
        component: ChamCong,
      },
      {
        path: 'nhan-su',
        name: 'NhanSu',
        component: NhanSu,
      },
      {
        path: 'chi-tiet-show/:id',
        name: 'ChiTietShow',
        component: ChiTietShow,
        props: true,
      },
      {
        path: 'dang-ky-show/:id',
        name: 'DangKyShow',
        component: DangKyShow,
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router