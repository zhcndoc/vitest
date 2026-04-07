---
layout: page
title: 认识团队
description: Vitest 的开发由一个国际团队指导。
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from '@voidzero-dev/vitepress-theme'
import { teamMembers, teamEmeritiMembers } from './.vitepress/contributors'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>认识团队</template>
    <template #lead>
      Vitest 的开发由一个国际团队指导，其中部分成员选择在此展示。
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="teamMembers" />
  <VPTeamPageSection>
    <template #title>荣誉团队</template>
    <template #lead>
      在此我们致敬一些不再活跃但过去曾做出宝贵贡献的团队成员。
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="teamEmeritiMembers" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
