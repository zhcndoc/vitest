<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'

const props = defineProps<{
  prompt: string
}>()

const state = ref<'idle' | 'copied' | 'error'>('idle')
const label = computed(() => (state.value === 'copied' ? '已复制' : '复制提示词'))

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(props.prompt)
    state.value = 'copied'
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <button type="button" class="button button--brand" @click="copyPrompt">
    <Icon :icon="state === 'copied' ? 'carbon:checkmark' : 'carbon:copy'" aria-hidden="true" />
    <span>{{ label }}</span>
  </button>
  <span class="sr-only" role="status" aria-live="polite">
    {{
      state === 'copied' ? '提示词已复制到剪贴板。' : state === 'error' ? '无法复制提示词。' : ''
    }}
  </span>
</template>
