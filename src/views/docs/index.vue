<template>
    <div>
        <el-page-header @back="onBack" title="关闭" content="文件上传" :icon="CloseBold" style="margin-bottom: 15px;"></el-page-header>

            <el-row :gutter="24" style="margin-left: 0;margin-right: 0;">

                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <div class="file-container dashed-border theme-bg">
                        <!-- 文件展示卡片 -->
                        <div class="file-card" v-for="x in files">
                            <img src="@/assets/images/file.svg" alt="File Icon" class="file-icon"/>
                            <div class="file-details">
                                <div class="file-title">{{x.title}}</div>
                                <div class="upload-time">上传时间: {{ formattedTime(x.uuid) }}</div>
                            </div>
                            <button class="delete-btn" @click="delFile(x.uuid)">&#x2715;</button>
                        </div>

                        <div class="upload-card" style="border-bottom: none;">
                            <el-upload
                                class="upload-button"
                                drag
                                action="/local/upload"
                                multiple
                                :on-success="handleSuccess"
                                accept=".pdf,.doc,.docx,.txt"
                                :data="uploadData"
                            >
                                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                <div class="el-upload__text">
                                    将文件拖拽至此处 或 <em>点击上传</em>
                                </div>
                                <template #tip>
                                    <div class="el-upload__tip">
                                        目前仅支持5MB以内的PDF/DOC/DOCX/TXT文件上传，请确保文件格式正确
                                    </div>
                                </template>
                            </el-upload>
                        </div>
                    </div>
                </el-col>

            </el-row>

        </div>
</template>

<script>
import {CloseBold} from "@element-plus/icons-vue";
import { UploadFilled } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
    name: "Docs",
    computed: {
        CloseBold() {
            return CloseBold
        },
        // 获取所有文件
        files: {
            get() {
                return this.$store.state.app.files;
            },
            set(val) {
                this.$store.dispatch('setFiles', val);
            }
        },
    },
    data() {
        return {
            uploadData: {
                prev_id : this.getPrevId(),
            }
        };
    },
    methods: {
        getPrevId() {
            // 如果this.$store.state.app.files数组长度不为0，则返回files[0]的'id'键值
            if (this.files && this.files.length !== 0) {
                return this.files[0].id;
            }
            return ""; // 如果数组为空，返回空字符串或其他默认值
        },
        onBack() {
            // 返回首页
            this.$router.push('/');
        },
        handleSuccess(response, file, fileList) {
            if (response.code === 400) {
                this.$notify({
                    title: '上传失败！',
                    message: response.msg,
                    type: 'error',
                });
            } else if (response.code === 200) {
                let file_data = {"title": response.title,"uuid": response.uuid,"file_type":response.file_type,"id":response.id};
                // 使用解构赋值创建chatList的副本，以避免直接修改原始数组
                let files = [...this.files];
                files.push(file_data)
                this.files = files;

                // 更新prev_id
                this.uploadData.prev_id = response.id;
            }
        },
        // delFile(uuid) {
        //     // 使用filter方法删除具有指定uuid的数据项 此时会触发get函数

        //     this.files = this.files.filter(item => item.uuid !== uuid);
        //     if (this.files.length === 0) {
        //         this.uploadData.prev_id = "";
        //     }
        // },
        async delFile(uuid) {
            try {
                // 发送请求到 FastAPI 接口删除文件
                const response = await axios.post('/local/delete', {
                    prev_id: this.files.find(item => item.uuid === uuid).id, // 假设 prevId 是 Vuex store 中的 prev_id
                    file_name: this.files.find(item => item.uuid === uuid).title
                });

                if (response.data.code === 200) {
                    // 使用 filter 方法删除具有指定 uuid 的数据项，此时会触发 get 函数
                    this.files = this.files.filter(item => item.uuid !== uuid);
                    if (this.files.length === 0) {
                        this.uploadData.prev_id = "";
                        this.$store.commit('settings/CHANGE_SETTING', { key: 'prev_id', value: "" });
                    }
                } else {
                // 处理错误情况
                console.error('删除文件失败:', response.data.msg);
                }
            } catch (error) {
                // 处理请求错误
                console.error('删除文件请求错误:', error);
            }
        },
        /**
         * 格式化时间戳
         * @param timestamp
         * @returns {string}
         */
        formattedTime(timestamp) {
            // 将时间戳转换为Date对象
            const date = new Date(timestamp); // 乘以1000以将时间戳从秒转换为毫秒
            // 创建日期和时间格式化函数
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        },
    },
};
</script>

<style scoped>
.file-container {
    display: flex;
    flex-direction: column;
    padding: 5px;
    border-radius: 8px;
    margin: 5px 0 5px 0;

    /* 卡片样式 */
    > .file-card, .upload-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px dashed grey;

        /* 文件图标样式 */
        > .file-icon {
            width: 40px;
            height: 40px;
            object-fit: cover;
            margin-right: 10px;
            border-radius: 5px;
        }

        /* 文件详情样式 */
        > .file-details {
            flex: 1;

            > .file-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            > .upload-time {
                font-size: 12px;
                color: #777;
            }
        }

        /* 删除按钮样式 */
        > .delete-btn {
            background: none;
            border: none;
            color: #f00;
            cursor: pointer;
            font-size: 18px;
        }

        /* 拖拽上传按钮 */
        > .upload-button {
            width: 100%;
        }
    }
}

:deep(.el-upload-dragger) {
    padding: 0;
    background: none;
}

.el-upload__tip {
    text-align: center;
}

:deep(.el-page-header__content), :deep(.el-page-header__back) {
    color: var(--chat-card-font-color);
}
</style>
