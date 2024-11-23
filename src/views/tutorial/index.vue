<template>
    <div>
        <el-page-header @back="onBack" title="关闭" content="系统文档" :icon="CloseBold" style="margin-bottom: 15px;"></el-page-header>

        <el-row :gutter="24" justify="center">
            <el-col :md="18" :sm="24" :xs="24">
                    <div class="file-container dashed-border theme-bg">
                        <v-md-preview :text="text" @copy-code-success="handleCopyCodeSuccess"></v-md-preview>
                    </div>
                </el-col>

            </el-row>

        </div>
</template>

<script>
import {CloseBold} from "@element-plus/icons-vue";

export default {
    name: "Tutorial",
    data() {
        return {
            text:
`# 等待更新...`
        };
    },
    computed: {
        CloseBold() {
            return CloseBold
        }
    },
    methods: {
        onBack() {
            // 返回首页
            this.$router.push('/');
        },
        // 复制代码成功
        handleCopyCodeSuccess(code) {
            this.$notify({
                title: '复制成功！',
                type: 'success',
            });
        },
    }
};
</script>

<style scoped>
.file-container {
    display: flex;
    flex-direction: column;
    padding: 5px;
    border-radius: 8px;
    margin: 5px 0 5px 0;
}

:deep(.el-page-header__content), :deep(.el-page-header__back) {
    color: var(--chat-card-font-color);
}

:deep(.v-md-editor-preview) {
    width: 100%;
}

:deep(.vuepress-markdown-body:not(.custom)) {
    padding: 0.4rem 0.8rem;
}

@media (max-width: 419px) {
    :deep(.vuepress-markdown-body div[class*=v-md-pre-wrapper-]) {
        margin: 0;
    }
}

:deep(.vuepress-markdown-body blockquote) {
    font-size: 12px;
}

:deep(.vuepress-markdown-body) {
    font-size: 12px;
    color: var(--chat-card-font-color);
    background: none;
    word-wrap: break-word;
    margin: 0;
}
</style>
