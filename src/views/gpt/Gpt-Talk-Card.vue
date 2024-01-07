<template>
    <n-card
        v-if="talk.reply.content || waiting"
        :title="question"
        :segmented="{
            content: true
        }"
    >
        <h3 v-html="talk.reply.content"></h3>
        <n-skeleton v-if="waiting" text :repeat="4" />
        <template #footer>
            <p v-show="completed" style="margin-top: 20px; color: gray">
                回答完毕✅ 字数:{{ talk.reply.content.length }}
            </p>
        </template>
    </n-card>
</template>

<script setup lang="ts">
import { NCard, NSkeleton } from 'naive-ui'
import { Talk } from '../../models/talk'
const { question, talk, waiting } = defineProps<{
    question: string //将作为卡片标题的问题文本
    talk: Talk
    completed: boolean //对话完成信号
    waiting: boolean //等待信号
}>()
</script>

<style scoped></style>
