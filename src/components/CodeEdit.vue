<template>
    <div>
        <span class="title">HTML源码:</span>
        <div>
            <el-input
                    type="textarea" :rows="18" v-model="currContent">
            </el-input>
        </div>
        <el-button type="primary" @click="applyCode()">应用</el-button>
    </div>
</template>

<script>
    export default {
        name: "CodeEdit",
        props: {
            $editor: Object,
            editContent: String,
            contentArr: Array
        },
        data(){
            return {
                currContentArr:this.contentArr,
                currTemplate:'<p class="MsoNormal" style="text-indent: 21.0pt; line-height: 150%;"><span style="font-size: 12.0pt; line-height: 150%; font-family: 宋体; mso-ascii-font-family: \'Times New Roman\'; mso-bidi-font-family: \'Times New Roman\';">\n' +
                    '</span></p>'
            }
        },
        watch: {
            contentArr:function(newV,oldV){
                this.currContentArr=newV;
            }
        },
        methods: {
            handleChange(value){
                this.currContent=value;
            },
            applyCode(){
                console.log(this.currContent);
                this.$editor.execCommand('SelectAll');
                this.$editor.execCommand('Strikethrough',false);
                this.$editor.selection.setContent(this.currContent);
            }
        }
    }
</script>

<style scoped>
.title {
    font-size: 15px;
    }
.input {
    width: 100%;
    margin-bottom: 30px;
    }
.border {
    width: 100%;
    height: 400px;
    border: solid 2px black;
    }
.el-input {
    width: 100%;
    height: 400px;
}
</style>