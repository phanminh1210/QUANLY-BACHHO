
<template>
  <div class="thanh-tim-kiem">
    <div class="search-box">
      <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <button
  class="sort-button"
  type="button"
  aria-label="Sắp xếp"
  @click="$emit('sort')"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M8 17V4" />
    <path d="M4 8l4-4 4 4" />
    <path d="M16 7v13" />
    <path d="M12 16l4 4 4-4" />
  </svg>
</button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: 'Tìm kiếm...'
})

defineEmits<{
  'update:modelValue': [value: string]
  sort: []
}>()
</script>

<style scoped>
.thanh-tim-kiem {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  height: 42px;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #ffffff;
}

.search-icon {
  flex-shrink: 0;
  color: #8f0000;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #333333;
  font-size: 13px;
}

.search-box input::placeholder {
  color: #9ca3af;
}

.sort-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #ffffff;
  color: #8f0000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-button:hover {
  background: #fff1f1;
  border-color: #8f0000;
}

@media (max-width: 480px) {
  .search-box,
  .sort-button {
    height: 40px;
  }

  .sort-button {
    width: 40px;
  }
}
</style>
