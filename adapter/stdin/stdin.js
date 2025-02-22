import fs from "fs"
import { createInterface } from "readline"
import common from "../../model/common.js"
import pluginsLoader from "../../../../lib/plugins/loader.js"

const uin = "stdin"

/** 自定义标准输入头像 */
let avatar = "default_avatar.jpg"
if (fs.existsSync(process.cwd() + "/plugins/Lain-plugin/resources/avatar.jpg")) {
    avatar = "avatar.jpg"
}

/** 构建基本参数 */
Bot[uin] = {
    fl: new Map(),
    gl: new Map(),
    gml: new Map(),
    id: uin,
    name: Bot.lain.cfg.stdin_nickname,
    nickname: Bot.lain.cfg.stdin_nickname,
    avatar: `../../../../../plugins/Lain-plugin/resources/${avatar}`,
    stat: { start_time: Date.now() / 1000, recv_msg_cnt: 1 },
    version: { id: "stdin", name: "标准输入", version: Bot.lain.adapter.stdin },
    /** 转发 */
    makeForwardMsg: async (forwardMsg) => {
        return await makeForwardMsg(forwardMsg)
    },
    pickUser: (userId) => {
        return {
            sendMsg: async (msg, quote = false) => {
                return await sendMsg(msg)
            },
            /** 转发 */
            makeForwardMsg: async (forwardMsg) => {
                return await makeForwardMsg(forwardMsg)
            }
        }
    }
}

Bot.adapter.unshift(uin)

if (Bot.lain.cfg.YenaiState == 1 || Bot.lain.cfg.YenaiState == 6) {
    Bot[uin].uin = uin
}

/** 监听控制台输入 */
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.on('SIGINT', () => { rl.close(); process.exit() })
function getInput() {
    rl.question('', async (input) => {
        await pluginsLoader.deal(msg(input.trim()))
        getInput()
    })
}
getInput()

function msg(msg) {
    const user_id = 55555
    const time = Date.now() / 1000

    let e = {
        adapter: "stdin",
        message_id: "test123456",
        message_type: "private",
        post_type: "message",
        sub_type: "friend",
        self_id: uin,
        seq: 888,
        time,
        uin: uin,
        user_id,
        message: [{ type: "text", text: msg }],
        raw_message: msg,
        isMaster: true,
        toString: () => { return msg },
    }
    /** 用户个人信息 */
    e.sender = {
        card: Bot.lain.cfg.stdin_nickname,
        nickname: Bot.lain.cfg.stdin_nickname,
        role: "",
        user_id
    }

    /** 构建member */
    const member = {
        info: {
            user_id,
            nickname: Bot.lain.cfg.stdin_nickname,
            last_sent_time: time,
        },
        /** 获取头像 */
        getAvatarUrl: () => {
            return `https://q1.qlogo.cn/g?b=qq&s=0&nk=528952540`
        }
    }

    /** 赋值 */
    e.member = member

    /** 构建场景对应的方法 */
    e.friend = {
        sendMsg: async (reply) => {
            return await sendMsg(reply)
        },
        recallMsg: async (msg_id) => {
            return await common.log(uin, `撤回消息：${msg_id}`)
        },
        makeForwardMsg: async (forwardMsg) => {
            return await makeForwardMsg(forwardMsg)
        }
    }

    /** 快速撤回 */
    e.recall = async () => {
        return await common.log(uin, `撤回消息：${msg_id}`)
    }
    /** 快速回复 */
    e.reply = async (reply) => {
        return await sendMsg(reply)
    }
    return e
}

async function makeForwardMsg(forwardMsg) {
    const msg = []
    try {
        for (const i of forwardMsg) {
            if (i?.message) {
                msg.push(i.message)
            } else {
                msg.push(JSON.stringify(i).slice(0, 2000))
            }
        }
        return msg
    } catch (error) {
        return forwardMsg
    }
}

/** 发送消息 */
async function sendMsg(msg) {
    if (!Array.isArray(msg)) msg = [msg]
    const log = []
    for (const i of msg) {
        if (typeof i === "string") {
            log.push(i)
        } else {
            log.push(JSON.stringify(msg).slice(0, 2000))

        }
    }
    return await common.log(uin, `发送消息：${log.join('\n')}`)
}

await common.log(uin, `加载完成...您可以在控制台输入指令哦~`)