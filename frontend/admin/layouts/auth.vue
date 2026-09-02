<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#16110d] p-4 text-foreground selection:bg-[#f59e0b] selection:text-[#16110d]">
    <!-- Ambient Pixel Background Glow -->
    <div
      class="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#f59e0b]/10 blur-[120px]"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#22c55e]/10 blur-[120px]"
    ></div>

    <!-- Centered Login Box -->
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
