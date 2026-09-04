<template>
  <div class="relative min-h-[100dvh] w-full overflow-y-auto bg-[#2d1b0e] text-foreground selection:bg-[#f0d060] selection:text-[#2d1b0e] flex flex-col justify-center">
    <!-- Ambient Campus Hero Backdrop (Bright & Clearly Visible matching User Maba localhost:3000) -->
    <div class="pointer-events-none fixed inset-0 z-0">
      <img
        src="/unu-hero.jpeg"
        alt="Gedung Kampus UNU Yogyakarta"
        class="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] saturate-[1.05]"
      />
      <!-- Soft translucent warm gradient overlay so building stays clearly visible -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#120b06]/75 via-transparent to-[#160d07]/90" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(18,11,6,0.4)_100%)]" />
    </div>

    <!-- Main Container -->
    <div class="relative z-10 w-full py-6 px-3 sm:px-6">
      <slot />
    </div>
  </div>
</template>
