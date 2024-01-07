<template>
    <n-card
        :title="talk.question"
        :segmented="{
            content: true
        }"
    >
        <h3 v-html="talk.reply.content"></h3>
        <p style="margin-top: 20px; color: gray">回答完毕✅ 字数:{{ talk.reply.content.length }}</p>
    </n-card>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'
import { Talk } from '../../models/talk'
const { talk } = defineProps<{
    talk: Talk
}>()
</script>

<style scoped></style>
