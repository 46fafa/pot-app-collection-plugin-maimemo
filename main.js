/**
 * Pot插件的收藏（collection）功能主入口。
 * @param {string} source 用户划选的文本内容（此处预期为单词）。
 * @param {any} target Pot应用内部使用的目标对象，此处不使用。
 * @param {object} options 包含配置和实用工具的对象。
 * @param {object} options.config 从info.json中定义的配置项，例如authToken, notebookId。
 * @param {object} options.utils 实用工具，例如tauriFetch用于网络请求。
 * @returns {boolean} 添加成功返回true，否则抛出错误。
 */
async function collection(source, target, options = {}) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    // 从插件配置中获取墨墨API Token和目标词本ID
    const { auth_token: authToken, notebook_id: notebookId } = config;

    // 1. 验证关键配置项是否已设置
    if (!authToken || authToken.length === 0) {
        throw "墨墨开放API Token 未设置。请在Pot插件设置中填写。";
    }
    if (!notebookId || notebookId.length === 0) {
        throw "目标词本ID 未设置。请在Pot插件设置中填写。";
    }

    // 假设 source 就是用户划选的单词字符串
    const wordToAdd = source;

    // 2. 构建符合墨墨API要求的请求体
    const requestBody = {
        vocabulary_id: notebookId, // 目标词本的ID
        word: wordToAdd,           // 要添加的单词
        source: "PotApp",          // 标识单词来源为Pot应用
        // 可选：如果Pot未来能提供释义和例句，可以添加到此处
        // meaning: "单词的释义",
        // phrases: [{ phrase: "例句内容" }]
    };

    // 3. 构建请求头，包含认证信息和内容类型
    const requestHeaders = {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json;charset=UTF-8",
    };

    // 墨墨开放平台添加单词的API URL
    const apiUrl = "https://open.maimemo.com/open/api/v1/vocabularies";

    // 4. 使用 tauriFetch 发送 POST 请求
    let res;
    try {
        res = await fetch(
            apiUrl,
            {
                method: "POST",
                headers: requestHeaders,
                // body 需要符合 tauriFetch 的特定格式，对于 JSON 请求是 { type: "Json", payload: your_object }
                body: {
                    type: "Json",
                    payload: requestBody,
                },
            },
        );
    } catch (e) {
        // 捕获网络层面的错误，例如断网、DNS解析失败等
        throw `网络请求失败，请检查网络连接或API地址。\n错误详情: ${e.message || e}`;
    }

    // 5. 处理API响应
    if (res.ok) { // HTTP状态码为2xx表示请求成功
        const result = res.data; // 获取响应数据
        // 根据墨墨API文档，业务成功时code为0
        if (result && result.code === 0) {
            return true; // 单词成功添加到墨墨生词本
        } else {
            // API返回了业务逻辑错误，例如单词已存在、Token无效等
            throw `添加单词失败: ${result.msg || JSON.stringify(result)}`;
        }
    } else {
        // HTTP请求本身失败 (非2xx状态码)，例如401未授权，404未找到等
        const errorData = res.data ? JSON.stringify(res.data) : "无响应数据";
        throw `HTTP请求错误。\n状态码: ${res.status}\n响应详情: ${errorData}`;
    }
}
