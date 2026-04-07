<template>
  <div class="wrapper wrapper--ticks grid md:grid-cols-2 w-full border-nickel divide-x">
    <div class="flex flex-col p-10 justify-center items-center md:items-start">
      <div class="flex flex-col gap-5 max-w-120 text-center md:text-left items-center md:items-start">
        <a class="flex items-center gap-2" href="https://voidzero.dev" target="_blank">
          <span class="text-grey text-xs font-mono uppercase tracking-wide">来自</span>
          <img src="@assets/logos/voidzero-light.svg" alt="VoidZero" class="h-2.5">
        </a>
        <h1 class="text-white text-pretty">
          下一代测试框架
        </h1>
        <p class="text-white/70 text-lg max-w-100 text-pretty">
          基于 Vite 的原生测试框架，速度很快！
        </p>
        <div class="flex items-center gap-5 mt-8">
          <a href="/guide/" class="button button--primary inline-block w-fit">
            <span>开始使用</span>
          </a>
          <a href="https://github.com/vitest-dev/vitest" target="_blank" rel="noopener noreferrer" class="button inline-block w-fit">
            在 GitHub 查看
          </a>
        </div>
      </div>
    </div>
    <div class="flex flex-col min-h-88 sm:min-h-120">
      <div class="relative pl-6 sm:pl-16 h-full flex flex-col justify-center overflow-clip py-8 sm:py-16 hero-background">
        <img src="@assets/vitest/hero-terminal.png" alt="Vitest 终端界面" class="w-full h-full object-contain">
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-background {
  background-image: url('@assets/vitest/hero-background.jpg');
  background-size: cover;
  background-position: center;
}
</style>
