<template>
    <div class="main">
        <div class="list">
            <span class="title">模板:</span>
            <el-select class="input" v-model="currTemp" placeholder="请选择模板" @change="handleChange">
                <el-option v-for="item in TemplateArr" :value="item.title"></el-option>
            </el-select>
            <span class="title">预览:</span>
            <div class="input border" v-html="currPreview"></div>
            <el-button type="primary" @click="applyHandle">应用</el-button>
        </div>
    </div>
</template>
  
<script>
import { reactive, ref } from 'vue';

export default {
    props: {
        $editor: Object,
        TemplateArr: Array,
        selectVal: String,
    },
    data() {
        return {
            content: "",
            defaultProps: {
                children: 'children',
                label: 'title',
            },
            currTemp:'',
            currPreview:''
        };
    },
    methods: {
        saveHandle() {
            this.$emit("insert", this.content);
        },
        handleNodeClick(data) {
            this.content = data.content;
        },
        applyHandle(){
            this.$editor.selection.setContent(this.currPreview);
        },
        handleChange(value){
            let arr=this.$props.TemplateArr;
            let selectVal=this.$editor.selection.getContent();
            let temp;
            for(let i=0;i<arr.length;i++){
                if(arr[i].title===value){
                    temp=arr[i].content;
                }
            }
            this.currPreview=temp.replace(new RegExp("{{}}","gm"),selectVal);
        }
    },
};
</script>
  
<style scoped>
.title {
    font-size: 15px;
}
.input {
    width: 100%;
    margin-bottom: 50px;
}
.border {
    width: 100%;
    height: 300px;
    border: solid 2px black;
}
</style>
  