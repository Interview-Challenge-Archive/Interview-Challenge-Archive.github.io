<template>
  <section class="site-maintenance">
    <q-card flat bordered class="site-maintenance__card">
      <q-card-section class="site-maintenance__copy">
        <div class="text-overline text-grey-7">Maintenance mode</div>
        <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">Site is being updated</div>
        <p class="text-body1 text-grey-8 q-mb-none">
          The site is currently under maintenance. Please check back again soon.
        </p>
      </q-card-section>
    </q-card>
  </section>
</template>

<script setup>
defineOptions({
  name: 'SiteMaintenancePage'
})
</script>

<style scoped lang="scss">
.site-maintenance {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(25, 118, 210, 0.12), transparent 46%),
    #f5f7fa;
}

.site-maintenance__card {
  width: min(100%, 560px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.site-maintenance__copy {
  padding: 40px;
}
</style>