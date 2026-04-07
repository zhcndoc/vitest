<script setup>
import Footer from '@components/oss/Footer.vue'
// import TrustedBy from '@components/oss/TrustedBy.vue'
import HeadingSection from '@components/oss/HeadingSection.vue'
import Sponsors from '@components/oss/Sponsors.vue'
import Spacer from '@components/shared/Spacer.vue'
import { sponsors } from '../sponsors'
import VitestFeatureGrid from './FeatureGrid.vue'
import Hero from './Hero.vue'
import Intro from './Intro.vue'
</script>

<template>
  <Hero />
  <!-- 'some-company' requires public/trusted-by/some-company.svg -->
  <!-- <TrustedBy :logos="['some-company']" /> -->
  <Intro />
  <HeadingSection heading="快速、轻量、整合" />
  <VitestFeatureGrid />
  <Sponsors
    description="Vitest 是免费且开源的，由优秀的赞助者共同支持。"
    sponsor-link="https://github.com/sponsors/vitest-dev" :sponsors="sponsors"
  />
  <Spacer />
  <Footer
    heading="开始使用 Vitest 测试"
    subheading="为现代 Web 打造的高性能测试体验，全面提升你的测试效率" button-text="立即开始"
    button-link="/guide/"
  />
</template>
