<template>
  <footer class="footer">
    <div class="footer__inner">
      <span class="footer__brand">@bachhoduong</span>
      <span class="footer__admin">Liên hệ Admin: 0812037991</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  width: 100%;
  background: #f3f4f6;
  border-top: 1px solid #e5e7eb;
  padding: 8px 14px;
  box-sizing: border-box;
}

.footer__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: #6b7280;
}

.footer__brand {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.footer__admin {
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .footer__inner {
    font-size: 10px;
  }
}
</style>