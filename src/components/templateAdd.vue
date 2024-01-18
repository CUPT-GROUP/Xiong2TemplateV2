<template>
    <div>
        <div class="main">
            <div class="option">
                <div class="title">Option:</div>
                <el-form :model="formData" label-width="100px">
                    <el-form-item label="Title:">
                        <el-input v-model="formData.title" />
                    </el-form-item>
                    <el-form-item label="Description:">
                        <el-input v-model="formData.description" />
                    </el-form-item>
                </el-form>
                <el-button type="primary" @click="saveHandle">保存</el-button>
            </div>
            <div class="preview">
                <div class="title">PREVIEW:</div>
                <div class="content" v-html="newTemplate"></div>
            </div>
        </div>
    </div>
</template>
  
<script>

// import { addTemplateApi } from "@/api/templateApi.js";
// import { Message } from "element";

import {reactive} from "vue";

export default {
    props: {
        $editor: Object,
        newTemplate: String
    },
    data() {
        return {
            formData: {
                title: "",
                description: "",
                content:this.newTemplate
            }
        };
    },
    methods: {
        saveHandle() {
            let template = {
                content: this.newTemplate,
                title: this.formData.title,
                description: this.formData.description
            }
            // console.log(template);
            this.$axios.post("/api1/template/add", template).then((res) => {
                let data = res.data;
                if (data.code === 0) {
                    this.$message({
                        message: '保存成功',
                        type: 'success'
                    });
                } else {
                    // 处理失败逻辑
                }
            });

            // addTemplateApi(template).then((res) => {
            //     let data = res.data;
            //     if (data.code === 0) {
            //         Message({
            //             message: '添加成功',
            //             type: 'success',
            //         });
            //         this.$emit("add");
            //     } else {
            //         // 处理失败逻辑
            //     }
            // });
        }
    }
};
</script>
  
<style scoped>
.main {
    display: flex;
    flex-direction: row;
}

.option {
    width: 30%;
}

.title {
    font-size: 50px;
}

.preview {
    width: 70%;
    margin-left: 40px;
}

.content {
    width: 100%;
    height: auto;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
}
</style>
  