<script setup>
import esmAnimation from '@assets/vitest/animations/640_x_300_esm.riv'
import vitePoweredAnimation from '@assets/vitest/animations/650_x_300_vite_powered.riv'
import RiveAnimation from '@components/shared/RiveAnimation.vue'
</script>

<template>
  <section class="wrapper wrapper--ticks border-t grid lg:grid-cols-2 divide-x divide-y divide-nickel">
    <div class="flex flex-col gap-3">
      <div class="p-5 sm:p-10 pb-0 sm:pb-0 flex flex-col gap-3">
        <h5 class="text-balance sm:text-pretty text-white">
          由 Vite 驱动
        </h5>
        <p class="sm:max-w-120 text-pretty">
          复用 <code
            class="mr-1 outline-none bg-nickel/50 text-vite"
          >Vite</code> 的配置和插件，在应用与测试之间保持一致。
          但使用 Vitest 并不要求你必须使用 Vite！
        </p>
      </div>
      <RiveAnimation
        :desktop-src="vitePoweredAnimation"
        :desktop-width="650"
        :desktop-height="300"
        canvas-class="w-full"
      />
    </div>
    <div class="flex flex-col gap-3 border-r-0 justify-between">
      <div class="p-5 sm:p-10 pb-0 sm:pb-0 flex flex-col gap-3">
        <h5 class="text-white">
          兼容 Jest
        </h5>
        <p class="max-w-md text-pretty">
          断言、快照、覆盖率等功能一应俱全 - 从 <code
            class="mr-1 outline-none bg-nickel/50 text-zest"
          >Jest</code> 迁移过来很轻松。
        </p>
      </div>
      <div class="flex-1 flex items-center justify-center p-5 sm:p-10">
        <img src="@assets/vitest/vitest-jest-compatible.png" inert loading="lazy" alt="兼容 Jest" class="w-full max-w-50">
      </div>
    </div>
    <div class="flex flex-col gap-3 justify-between">
      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5 class="text-white">
          智能且即时的监听模式
        </h5>
        <p class="max-w-92 text-pretty">
          只重新运行相关变更，就像测试版的 HMR 一样！
        </p>
      </div>
      <div class="card-bg px-5 sm:px-10 pt-5 sm:pt-10 flex justify-center">
        <img src="@assets/vitest/vitest-watcher.png" inert loading="lazy" alt="typed api">
      </div>
    </div>
    <div class="flex flex-col gap-3 justify-between">
      <div class="p-5 sm:p-10 pb-0 sm:pb-0 flex flex-col gap-3">
        <h5 class="text-white">
          ESM、TypeScript、JSX
        </h5>
        <p class="max-w-100 text-pretty">
          开箱即用的 ESM、TypeScript 和 JSX 支持，由 <code class="mx-1 outline-none bg-nickel/50 text-aqua">Oxc</code> 提供支持。
        </p>
      </div>
      <RiveAnimation
        :desktop-src="esmAnimation"
        :desktop-width="640"
        :desktop-height="300"
        canvas-class="w-full"
      />
    </div>
  </section>
  <section class="wrapper border-t py-10 flex items-center justify-center">
    <a href="/guide/features" class="button">查看完整功能列表</a>
  </section>
</template>

<style scoped>
.card-bg {
  background-image: url('@assets/vitest/vitest-watcher-background.jpg');
  background-size: cover;
  background-position: center;
}
</style>
