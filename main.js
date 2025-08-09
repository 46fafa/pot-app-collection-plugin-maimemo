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
    // 在墨墨API中，此ID对应的是云词本（notepad）的ID
    const { auth_token: authToken, notebook_id: notepadId } = config;

    // 墨墨开放平台API基础URL
    const apiEndpoint = "https://open.maimemo.com/open/api/v1";

    // 1. 验证关键配置项是否已设置
    if (!authToken || authToken.length === 0) {
        throw "墨墨开放API Token 未设置。请在Pot插件设置中填写。";
    }
    if (!notepadId || notepadId.length === 0) {
        throw "目标云词本ID 未设置。请在Pot插件设置中填写。";
    }

    // 假设 source 就是用户划选的单词字符串
    const wordToAdd = source;
    // 墨墨云词本的日期标题格式，例如 "# 2023-10-27"
    const todayDate = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD 格式

    // 2. 构建请求头，包含认证信息和内容类型
    function getHeaders() {
        return {
            "Content-Type": "application/json;charset=UTF-8",
            // 确保Token以 "Bearer " 开头
            "Authorization": authToken.startsWith("Bearer") ? authToken : `Bearer ${authToken}`,
        };
    }
    const requestHeaders = getHeaders();

    let res;
    let currentNotepad;

    // --- 步骤 1: 获取当前云词本的内容 ---
    try {
        res = await fetch(
            `${apiEndpoint}/notepads/${notepadId}`,
            {
                method: "GET",
                headers: requestHeaders,
            },
        );
    } catch (e) {
        throw `获取云词本内容失败，请检查网络连接或云词本ID。\n错误详情: ${e.message || e}`;
    }

    if (res.ok) {
        const result = res.data;
        // Bob插件的响应结构是 { success: boolean, data: { notepad: ... } }
        if (result && result.success && result.data && result.data.notepad) {
            currentNotepad = result.data.notepad;
        } else {
            throw `获取云词本内容失败: ${result.msg || JSON.stringify(result)}`;
        }
    } else {
        throw `HTTP请求错误（获取云词本内容）。\n状态码: ${res.status}\n响应详情: ${JSON.stringify(res.data) || "无响应数据"}`;
    }

    // --- 步骤 2: 修改云词本内容，添加新单词 ---
    let { status, content, title, brief, tags } = currentNotepad;
    const lines = content.split("\n").map((line) => line.trim());
    let targetLineIndex = lines.findIndex((line) =>
        line.startsWith(`# ${todayDate}`)
    );

    // 如果今天日期的标题不存在，则在内容顶部添加
    if (targetLineIndex === -1) {
        lines.unshift(""); // 添加空行
        lines.unshift(`# ${todayDate}`); // 添加日期标题
        targetLineIndex = 0; // 新的日期标题在数组中的位置
    }
    
    // 在日期标题下添加单词
    lines.splice(targetLineIndex + 1, 0, wordToAdd);

    // 构建更新后的notepad对象
    const updatedNotepad = {
        status,
        content: lines.join("\n"),
        title,
        brief,
        tags,
    };

    // --- 步骤 3: 提交更新后的云词本内容 ---
    try {
        res = await fetch(
            `${apiEndpoint}/notepads/${notepadId}`,
            {
                method: "POST", // 注意：更新也是POST请求到特定ID
                headers: requestHeaders,
                body: {
                    type: "Json",
                    payload: { notepad: updatedNotepad }, // Bob插件的body结构
                },
            },
        );
    } catch (e) {
        throw `更新云词本失败，请检查网络连接或API地址。\n错误详情: ${e.message || e}`;
    }

    if (res.ok) {
        const result = res.data;
        // Bob插件的响应结构是 { success: boolean, data: ... }
        if (result && result.success) {
            return true; // 单词成功添加到墨墨云词本
        } else {
            throw `添加单词失败: ${result.msg || JSON.stringify(result)}`;
        }
    } else {
        throw `HTTP请求错误（更新云词本）。\n状态码: ${res.status}\n响应详情: ${JSON.stringify(res.data) || "无响应数据"}`;
    }
}
