<script setup lang="ts">
defineProps<{
  keyword?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
}>()

const onInput = (e: Event) => {
  emit('update:keyword', (e.target as HTMLInputElement).value)
}

const clearSearch = () => {
  emit('update:keyword', '')
}
</script>

<template>
  <div class="group">
    <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon">
      <g>
        <path
          d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
        ></path>
      </g>
    </svg>

    <input
      :value="keyword"
      class="input"
      type="search"
      :placeholder="placeholder || 'Tìm kiếm...'"
      @input="onInput"
    />

    <button v-if="keyword" type="button" class="clear-btn" @click="clearSearch">✕</button>
  </div>
</template>

<style scoped>
.group {
  display: flex;
  line-height: 28px;
  align-items: center;
  position: relative;
  max-width: 170px;
  width: 100%;
}

.input {
  font-family: inherit;
  width: 100%;
  height: 28px;
  padding-left: 2.1rem;
  padding-right: 1.8rem;
  box-shadow: 0 0 0 1px #cbd5e1;
  border: 0;
  border-radius: 999px; /* Bo tròn hoàn toàn dạng capsule */
  background-color: #ffffff;
  outline: none;
  color: #334155;
  font-size: 12px;
  transition: all 0.2s ease;
  cursor: text;
  z-index: 0;
}

.input::placeholder {
  color: #94a3b8;
  font-size: 11px;
}

.input:hover {
  box-shadow: 0 0 0 1.5px #8f0000;
}

.input:focus {
  box-shadow: 0 0 0 2px #8f0000;
}

.search-icon {
  position: absolute;
  left: 0.75rem; /* Căn chỉnh lại khoảng cách icon cho cân đối với viền tròn */
  fill: #64748b;
  width: 0.85rem;
  height: 0.85rem;
  pointer-events: none;
  z-index: 1;
}

/* Nút xóa nhanh từ khóa */
.clear-btn {
  position: absolute;
  right: 0.6rem; /* Căn chỉnh nút xóa lùi vào trong khung tròn */
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  padding: 0 4px;
  z-index: 1;
}

.clear-btn:hover {
  color: #dc2626;
}
</style>