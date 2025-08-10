# Pot-App 墨墨云词本插件——将pot翻译的单词加入墨墨云词本

### 安装方法

**在releases页面下载插件——pot-app服务设置——生词本——添加外部插件**

### 1. 插件配置

### Token获取

**墨墨app——我的——更多设置——实验功能——开放API——复制Token填入**

### 目标词本ID

打开墨墨开放API[查询云词本](https://open.maimemo.com/#/operations/maimemo.openapi.notepad.v1.NotepadService.ListNotepads),输入Token(此处Token前面要加参数Bearer)，limit：云词本数量，offset:0,然后点击查询，复制出现内容里的id:后面引号里的字符串，输入到配置中的词本ID中

<img src="C:\Users\ABC\AppData\Roaming\Typora\typora-user-images\image-20250810084614377.png" alt="image-20250810084614377" style="zoom: 50%;" />

### 感谢

- **Gemini**，本次插件开发全程使用AI完成。
- **[bob-plugin-maimemo-notebook](https://github.com/chriscurrycc/bob-plugin-maimemo-notebook)**:参考了[chriscurrycc](https://github.com/chriscurrycc)开发的墨墨背单词云词本 Bob 插件。

