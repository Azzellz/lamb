type TalkReply = {
    content: string
    tokenNum: number
}
export class Talk {
    public question: string
    public reply: TalkReply
    constructor(question: string, reply: TalkReply) {
        this.question = question
        this.reply = reply
    }

    public reset() {
        this.question = ''
        this.reply = {
            tokenNum: 0,
            content: ''
        }
    }
}