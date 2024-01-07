<template>
    <div id="gpt-container">
        <div id="input-part">
            <n-space vertical>
                <h3 style="color: gray">连接状态:{{ status ? '✅' : '❌' }}</h3>
                <h3 style="color: gray">当前模型:GPT-3.5-turbo-0613</h3>
                <h3 v-if="error" v-text="error"></h3>
                <n-space>
                    <n-input
                        v-model:value="currentTalk.question"
                        placeholder="请输入内容"
                        autofocus
                        @keydown.shift.enter="run"
                    ></n-input>
                    <n-button @click="run" type="primary">发送</n-button>
                    <n-button @click="reset" type="warning">重置</n-button>
                </n-space>
            </n-space>
        </div>
        <n-divider />
        <div id="reply-part">
            <n-space vertical>
                <!-- 历史对话展示 -->
                <Gpt-Talk-History-Card
                    v-for="(talk, index) in historyTalks"
                    :key="index"
                    :talk="talk"
                />
                <!-- 当前对话 -->
                <Gpt-Talk-Card
                    :completed="checkedSignal"
                    :waiting="waiting"
                    :question="staticCurrentTalkQuestion"
                    :talk="currentTalk"
                />
            </n-space>
        </div>
    </div>
</template>

<script setup lang="ts">
import GptTalkCard from './Gpt-Talk-Card.vue'
import GptTalkHistoryCard from './Gpt-Talk-History-Card.vue'
import { NInput, NButton, NSpace, NDivider } from 'naive-ui'
import { reactive, ref, toRaw } from 'vue'
import { Talk } from '@/models/talk'

//初始化websocket
//#region
const status = ref(false)
const error = ref('')
const ws = new WebSocket('ws://tyee.life:1145')
ws.onopen = () => {
    status.value = true
}
ws.onclose = () => {
    status.value = false
}
ws.onmessage = (ev) => {
    waiting.value = false
    currentTalk.reply.content += String(ev.data)
}
ws.onerror = (ev) => {
    error.value = String(ev)
}
//#endregion

//状态检测器
//#region
const useIntervalCheck = (interval: number = 1000) => {
    let intervalId: number
    let cache: string
    const checkedSignal = ref(false)
    const startCheck = () => {
        stopCheck()
        //缓存上一次的值
        cache = currentTalk.reply.content
        intervalId = setInterval(() => {
            if (cache !== currentTalk.reply.content) {
                //缓存上一次的值
                cache = currentTalk.reply.content
            } else if (cache !== '') {
                //回答完毕
                console.log('reply over')
                stopCheck()
                checkedSignal.value = true
            }
        }, interval)
    }
    const stopCheck = () => {
        clearInterval(intervalId)
        checkedSignal.value = false
    }
    return {
        startCheck,
        stopCheck,
        checkedSignal
    }
}
const { startCheck, checkedSignal } = useIntervalCheck()
//#endregion

//问答
//#region
//Talk管理
const historyTalks = ref<Array<Talk>>([])
//记录当前对话问题的静态值
let staticCurrentTalkQuestion = ''
const currentTalk = reactive(
    new Talk('', {
        content: '',
        tokenNum: 0
    })
)

//TODO 是否正处于等待中的信号
const waiting = ref(false)
let isFirstTalk = true
const run = () => {
    if (!isFirstTalk) {
        //当前对话完成后才放行
        if (!checkedSignal.value) return
        //添加历史对话
        historyTalks.value.push(
            new Talk(staticCurrentTalkQuestion, { ...toRaw(currentTalk).reply })
        )
    } else {
        isFirstTalk = false
    }
    //开启等待信号
    waiting.value = true
    //重置响应内容
    currentTalk.reply.content = ''
    //发送问题
    ws.send(currentTalk.question)
    //储存talk问题的静态值
    staticCurrentTalkQuestion = currentTalk.question
    //启动对话完成检查
    startCheck()
}
//重置所有对话
const reset = () => {
    currentTalk.reset()
    historyTalks.value = []
}
//#endregion
</script>

<style lang="less" scoped>
#gpt-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: auto;
    #input-part {
        margin: 20px;
    }
    #reply-part {
        margin: 20px;
        max-width: 700px;
    }
}
</style>
