import { fetchEventSource } from "@microsoft/fetch-event-source"
// 引入 store
import store from '../store';

/**
 * 本地接口
 * @param model_version 模型名
 * @param prompt 用户输入的问题
 * @param history 历史对话消息 在SendBox中限制最多三轮
 * @param controller 控制请求的取消
 * @param onopen 连接成功时的回调函数
 * @param onmessage 接收到消息时的回调函数
 * @param onclose 连接关闭时的回调函数
 * @param onerror 处理错误时的回调函数
 * @returns {Promise<void>}
 */
export async function local({prompt, history, files, controller, onopen, onmessage, onclose, onerror}) {
    // 本地接口设置了多种模式，根据store中的chat_type来选择 ['chat','search','rag','file']
    let type = store.state.setting.chat_type;
    if (store.state.setting.chat_type === 'search') type = 'url_info'

    const URL = '/local/chat/' + type;
   
    const response = await fetchEventSource(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept':'text/event-stream',
            'X-DashScope-SSE': 'enable'
        },
        body: getParams(prompt, history, files),
        signal: controller.signal,
        // 连接成功时的处理
        onopen,
        // 接收到消息时的处理
        onmessage,
        // 连接关闭时的处理
        onclose,
        // 处理错误
        onerror

    })
}

/**
 * 拼接请求参数
 * @param prompt 用户输入的问题
 * @param history 历史对话消息 在SendBox中限制最多三轮
 * @param files 上传的文件数据
 * @returns {string}
 */
function getParams(prompt, history, files) {
    if (store.state.setting.chat_type == 'chat' ||
        store.state.setting.chat_type == 'search') 
        return JSON.stringify({
            user_input: prompt,
            history: getHistory(history),
    });
    else if (store.state.setting.chat_type =='rag')
        return JSON.stringify({
            user_input: prompt,
            history: getHistory(history),
            kb_uuid: '75899b8f-8b25-48e0-9c42-781efc655c72'
    });
    else if (store.state.setting.chat_type =='file')
        return JSON.stringify({
            prompt: prompt,
            history: getHistory(history),
            id: store.state.app.files[0].id,
    });
}

/**
 * 拼接历史对话
 * @param history
 * @returns {*[]}
 */

function getHistory(history) {
    const array = [];
    for (let i = 0; i < history.length; i++) {
        const chat = history[i];
        array.push({
            role: "user",
            content: chat.query,
        });
        array.push({
            role: "assistant",
            content: chat.answer,
        });
    }

    return array;
}

// function getHistory(history) {
//     const array = [];
//     for (let i = 0; i < history.length; i++) {
//         const chat = history[i];
//         array.push({
//             user: chat.query,
//             assistant: chat.answer,
//         });
//     }

//     return array;
// }