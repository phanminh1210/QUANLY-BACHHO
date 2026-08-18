import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import MainLayout from '../layouts/MainLayout.vue'
import Dashboard from '../pages/Dashboard.vue'
import Home from '../pages/Home.vue'
import TatCaLichDien from '../pages/TatCaLichDien.vue'
import ChiTietShow from '../pages/ChiTietShow.vue'
import ShowChuaDien from '../pages/ShowChuaDien.vue'
import ShowDaDien from '../pages/ShowDaDien.vue'
import ChamCong from '../pages/ChamCong.vue'

const routes = [
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
        path: 'chi-tiet-show/:id',
        name: 'ChiTietShow',
        component: ChiTietShow,
        props: true,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router