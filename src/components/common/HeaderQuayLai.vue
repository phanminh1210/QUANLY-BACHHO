
<template>
  <div class="header-quay-lai">
    <button
      class="back-button"
      @click="quayLai"
      aria-label="Quay lại"
    >
      ‹
    </button>

    <h2 class="header-title">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
}>()

const router = useRouter()

const quayLai = () => {
  router.back()
}
</script>

<style scoped>
.header-quay-lai {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 0;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #8f0000;
  font-size: 38px;
  font-weight: 400;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.back-button:hover {
  transform: translateX(-3px);
}

.header-title {
  margin: 0;
  color: #8f0000;
  font-size: 17px;
  font-weight: 800;
  line-height: 30px;
  transform: translateY(2px);
}

@media (max-width: 480px) {
  .header-quay-lai {
    gap: 10px;
  }

  .header-title {
    font-size: 16px;
  }
}
</style>
