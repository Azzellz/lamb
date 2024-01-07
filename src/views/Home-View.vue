<template>
    <div id="gpt-container">
        <div id="input-part">
            <n-space vertical>
                <h3 style="color: gray">连接状态:{{ status ? '已连接' : '未连接' }}</h3>
                <h3 style="color: gray">当前模型:GPT-3.5-turbo-0613</h3>
                <h3 v-if="error" v-text="error"></h3>
                <n-space>
                    <n-input
                        v-model:value="ask"
                        placeholder="请输入内容"
                        type="textarea"
                        autofocus
                        @keydown.shift.enter="run"
                    ></n-input>
                    <n-button @click="run">发送</n-button>
                </n-space>
            </n-space>
        </div>
        <n-divider />
        <div id="reply-part">
            <h3 v-html="reply"></h3>
            <n-skeleton v-if="waiting" text :repeat="4" />
            <p v-show="signal" style="margin-top: 20px; color: gray">
                回答完毕✔ 字数:{{ reply.length }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NInput, NButton, NSpace, NDivider, NSkeleton } from 'naive-ui'
import { ref } from 'vue'

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
    reply.value += String(ev.data)
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
    const signal = ref(false)
    const start = () => {
        close()
        //缓存上一次的值
        cache = reply.value
        intervalId = setInterval(() => {
            if (cache !== reply.value) {
                //缓存上一次的值
                cache = reply.value
            } else if (cache !== '') {
                //检查完毕
                console.log('reply over')
                close()
                signal.value = true
            }
        }, interval)
    }
    const close = () => {
        clearInterval(intervalId)
        signal.value = false
    }
    return {
        start,
        close,
        signal
    }
}
const { start, close, signal } = useIntervalCheck()
//#endregion

//问答
//#region
const ask = ref('')
const reply = ref('')
const waiting = ref(false)
const run = () => {
    reply.value = ''
    ws.send(ask.value)
    waiting.value = true
    start()
}
//#endregion
</script>

<style lang="less" scoped>
#gpt-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    #input-part {
        margin: 10px auto;
        width: 500px;
    }
    #reply-part {
        margin: 10px auto;
        width: 500px;
    }
}
</style>
