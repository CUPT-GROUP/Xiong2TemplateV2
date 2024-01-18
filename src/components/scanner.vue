<!-- 尚未检测编辑器内容的改变 -->
<template>
  <div class="container">
    <div class="scanner">
      <div class="output">
        <div class="info">
          <el-badge v-for="(val, key, index) in targetWords" :key="index" :value="val" class="targetwords">
            <el-popover placement="bottom" width="300" trigger="click">
              <div class="replaceContainer">
                <div class="search">
                  <el-input placeholder="请输入替换内容" v-model="replaceText"></el-input>
                </div>
                <div class="seekButton">
                  <el-button size="mini" style="margin:2px 0px;" icon="el-icon-arrow-up" @click="handleUp()"></el-button>
                  <el-button size="mini" style="margin:2px 0px;" icon="el-icon-arrow-down"
                    @click="handleDown()"></el-button>
                </div>
                <div class="replaceButton">
                  <el-button size="mini" style="margin:2px 0px;" @click="replaceSingle">替换单个</el-button>
                  <el-button size="mini" style="margin:2px 0px;" @click="replaceAll(key)">替换全部</el-button>
                </div>
              </div>
              <el-button size="small" slot="reference" @click="handleSeek(key)">{{ key }}</el-button>
            </el-popover>
          </el-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FastScanner from 'fastscan'

export default {
  props: {
    // editorContent:{type:String},
    $editor: { type: Object },
    wordList: { type: Array }
  },
  mounted() {
    // console.log(this.wordList)
    // console.log(this.$editor.getContent())
  },

  data() {
    return {
      // 编辑器文本内容
      editorContent: '',
      // 敏感词列表,
      // wordList: [],
      // 匹配后返回的敏感词及出现次数
      targetWords: {},
      // 当前编辑器
      // $editor: {},
      // 查找替换插件实例
      searchReplacePlugin: {},
      // 替换内容
      replaceText: '',
      // 测试文本
      testText: '我是涉政词汇，涉恐词汇，我不是敏感词，色情，色情词汇222，涉恐词汇'
    }
  },
  watch: {
    $editor() {
      this.searchReplacePlugin = this.$editor.plugins.searchreplace
    }
  },
  methods: {
    check() {
      // 获取编辑器内容
      this.editorContent = this.$editor.getContent()
      const scanner = new FastScanner(this.wordList)
      // 返回敏感词及出现次数
      this.targetWords = scanner.hits(this.editorContent)
      // 获取searchReplace插件实例
      this.searchReplacePlugin = this.$editor.plugins.searchreplace
    },
    handleSeek(word) {
      this.searchReplacePlugin.find(word)
    },
    handleUp() {
      this.searchReplacePlugin.prev()
    },
    handleDown() {
      this.searchReplacePlugin.next()
    },
    replaceSingle() {
      this.searchReplacePlugin.replace(this.replaceText)
      this.check()
    },
    replaceAll(target) {
      const regex = new RegExp(target, 'g')
      let modifiedText = this.editorContent.replace(regex, this.replaceText)
      this.$editor.setContent(modifiedText)
      this.check()
    },
    // 从数据库查找所有敏感词
    queryWord() {
      // let h = { head: { module: "cqupt_forbidden" } }
      // http.post("/api/sei/data/public/query", h, true, true).then(res => {
      //   this.wordList = [...new Set(res.data.rows.map(obj => obj.WORD))]
      // })
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
}

.scanner {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
}

.input,
.output {
  width: 45%;
}

.info {
  margin: 10px;
}

.targetwords {
  margin: 5px;
}

.replaceContainer {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.seekButton,
.replaceButton {
  width: 25%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.search {
  width: 50%;
}
</style>
