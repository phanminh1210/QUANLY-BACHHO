<script setup lang="ts">
const modelValue = defineModel<string>({ default: 'all' })
</script>

<template>
  <div class="filter-text-item">
    <!-- Icon Hình Cái Phễu SVG -->
    <svg 
      class="filter-icon" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>

    <select v-model="modelValue" class="filter-text-select">
      <option value="all">Tất cả</option>
      <option value="chưa diễn">Chưa diễn</option>
      <option value="đã diễn">Đã diễn</option>
      <option value="đã hủy">Đã hủy</option>
    </select>
  </div>
</template>

<style scoped>
.filter-text-item {
  display: flex;
  align-items: center;
  background: #ffffff; /* Nền trắng tinh đồng bộ với file chính */
  border: none;       /* Bỏ viền hoàn toàn */
  border-radius: 6px;
  padding: 4px 6px;
  min-width: 100px;
  width: 100%;
  box-sizing: border-box;
}

.filter-icon {
  width: 13px;
  height: 13px;
  margin-right: 4px;
  flex-shrink: 0;
  stroke: #475569;
}

.filter-text-select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  width: 100%;
  white-space: nowrap;
}

@media (max-width: 639px) {
  .filter-text-item {
    min-width: 90px;
    padding: 3px 4px;
  }
  
  .filter-icon {
    width: 12px;
    height: 12px;
    margin-right: 3px;
  }

  .filter-text-select {
    font-size: 11px;
  }
}
</style>