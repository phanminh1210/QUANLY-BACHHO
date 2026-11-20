<template>
  <div class="product-page">
    <!-- TOP BAR -->
    <div class="page-topbar">
      <button
        type="button"
        class="galaxy-login-btn"
        @click="goToLogin"
      >
        Đăng nhập
      </button>
    </div>

    <!-- BODY -->
    <section class="page-body">
      <!-- Loading skeleton -->
      <div v-if="loading" class="product-list">
        <article v-for="n in 3" :key="n" class="product-row">
          <div class="product-row__media skeleton-box"></div>
          <div class="product-row__body">
            <div class="skeleton-text skeleton-text--title"></div>
            <div class="skeleton-text skeleton-text--medium"></div>
          </div>
        </article>
      </div>

      <!-- Danh sách hàng (Mỗi hàng chia đôi 50/50: 50% Ảnh | 50% Tiêu đề & Nội dung) -->
      <div v-else-if="products.length > 0" class="product-list">
        <article
          v-for="(item, index) in products"
          :key="item.id ?? index"
          class="product-row"
          @click="handleSelectProduct(item)"
        >
          <!-- Phần 1: Nửa trái Ảnh -->
          <div class="product-row__media">
            <img
              :src="item.url"
              :alt="item.tieu_de"
              class="product-row__img"
              loading="lazy"
            />
          </div>

          <!-- Phần 2: Nửa phải Tiêu đề & Nội dung -->
          <div class="product-row__body">
            <h2 class="product-row__title">{{ item.tieu_de }}</h2>
            <p class="product-row__content">{{ item.noi_dung }}</p>
          </div>
        </article>
      </div>

      <!-- Trạng thái rỗng -->
      <div v-else class="empty-state">
        Chưa có sản phẩm nào để hiển thị.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GET_SAN_PHAM_API } from '../config/api'

export type ProductItem = {
  id?: string | number
  url: string
  tieu_de: string
  noi_dung: string
}

const router = useRouter()
const loading = ref(true)
const products = ref<ProductItem[]>([])

const goToLogin = () => {
  router.push('/login')
}

const handleSelectProduct = (item: ProductItem) => {
  console.log('Đã chọn sản phẩm:', item)
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await fetch(GET_SAN_PHAM_API)
    const result = await res.json()

    if ((result.code === 200 || result.success === true) && Array.isArray(result.data)) {
      products.value = result.data.map((d: any) => ({
        id: d.id,
        url: String(d.url || '').trim(),
        tieu_de: String(d.tieu_de || '').trim(),
        noi_dung: String(d.noi_dung || '').trim(),
      }))
    } else {
      products.value = []
    }
  } catch (e) {
    console.error('Lỗi tải danh sách sản phẩm:', e)
    products.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
@import '../styles/loading.css';

.product-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #0b0d12;
  background-image:
    radial-gradient(circle at 50% 25%, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.52) 100%),
    url('/anhsp/anhnensp.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
}

.page-topbar {
  max-width: 840px;
  width: 100%;
  margin: 0 auto;
  padding: 14px 16px 2px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  z-index: 2;
}

.galaxy-login-btn {
  padding: 9px 20px;
  border-radius: 999px;
  border: 1px solid rgba(165, 243, 252, 0.5);
  background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 38%, #2563eb 75%, #06b6d4 100%);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow:
    0 6px 20px rgba(37, 99, 235, 0.45),
    0 0 16px rgba(139, 92, 246, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.35);
}

.galaxy-login-btn:active {
  transform: scale(0.97);
}

.page-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 16px 76px;
  overscroll-behavior-y: contain;
}

.product-list {
  max-width: 840px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-row {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 16px;
  background: linear-gradient(160deg, rgba(16, 18, 26, 0.88) 0%, rgba(7, 8, 12, 0.94) 100%);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 14px 32px rgba(0, 0, 0, 0.65),
    0 4px 10px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -10px 20px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  overflow: hidden;
}

.product-row::after {
  content: '';
  position: absolute;
  left: -8%;
  right: -8%;
  bottom: -14px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 72%);
  pointer-events: none;
}

/* Nửa trái: Ảnh chiếm 50% chiều ngang hàng */
.product-row__media {
  position: relative;
  flex: 1 1 50%;
  width: 50%;
  min-height: 192px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #040507;
  box-shadow:
    inset 0 0 18px rgba(0, 0, 0, 0.65),
    0 6px 16px rgba(0, 0, 0, 0.55);
}

.product-row__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Nửa phải: Chữ chiếm 50% chiều ngang hàng */
.product-row__body {
  position: relative;
  z-index: 1;
  flex: 1 1 50%;
  width: 50%;
  min-width: 0;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.product-row__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #fde047;
  line-height: 1.3;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.16);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

.product-row__content {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #e5e7eb;
  line-height: 1.55;
  white-space: pre-line;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65);
}

.empty-state {
  max-width: 840px;
  margin: 28px auto;
  text-align: center;
  font-size: 15px;
  color: #e5e7eb;
  background: rgba(7, 8, 12, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
  padding: 16px 20px;
  border-radius: 14px;
}

.skeleton-box {
  min-height: 192px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.07);
}

@media (max-width: 640px) {
  .page-topbar {
    padding: 12px 12px 2px;
  }
  .galaxy-login-btn {
    padding: 8px 16px;
    font-size: 12.5px;
  }
  .page-body {
    padding: 12px 12px 68px;
  }
  .product-list {
    gap: 16px;
  }
  .product-row {
    padding: 12px;
    gap: 12px;
    border-radius: 16px;
  }
  .product-row__media,
  .skeleton-box {
    min-height: 156px;
    border-radius: 10px;
  }
  .product-row__body {
    gap: 8px;
  }
  .product-row__title {
    font-size: 16px;
  }
  .product-row__content {
    font-size: 13.5px;
    line-height: 1.48;
  }
}
</style>