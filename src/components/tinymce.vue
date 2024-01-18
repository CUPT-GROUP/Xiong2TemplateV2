<template>
  <div :class="{ fullscreen: fullscreen }" class="tinymce-container" :style="{ width: containerWidth }">
    <!--    文本框-->
    <textarea :id="tinymceId" class="tinymce-textarea" />

    <el-dialog title="添加图片" :visible.sync="dialogAddVisible" width="80%" :before-close="handleClose">

      <vue-select-image :dataImages="dataImages" :is-multiple="true" :w='200' :h='200'
        @onselectmultipleimage="onSelectMultipleImage" ref="vueSelectImage">
      </vue-select-image>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelShowImage()">取 消</el-button>
        <el-button type="primary" @click="showImage()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="上传图片" :visible.sync="dialogUploadVisible" width="80%" :on-preview="handlePictureCardPreview">
      <el-upload action="http://localhost:8080/api1/template_img/upload" list-type="picture-card">
        <img v-if="dialogImageUrl" :src="dialogImageUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </el-dialog>

    <el-dialog title="敏感词检测" :visible.sync="dialogScannerVisible" width="40%">
      <scanner :$editor="editor" :word-list="wordList" ref="scannerCheck"></scanner>
    </el-dialog>
    <el-dialog title="添加模板" :visible.sync="dialogTempAddVisible" width="40%">
      <TemAdd :$editor="editor" :new-template="content" ref="TemAdd"></TemAdd>
    </el-dialog>
    <el-dialog title="应用模板" :visible.sync="dialogTempInsertVisible" width="40%">
      <TemInsert :$editor="editor" :TemplateArr="TemplateArr" :selectVal="selectVal" ref="TemInsert"></TemInsert>
    </el-dialog>
    <el-dialog title="代码编辑" :visible.sync="dialogCodeEditVisible" width="40%">
      <CodeEdit :$editor="editor" :editContent="content" ref="CodeEdit"></CodeEdit>
    </el-dialog>
  </div>
</template>

<script>

import plugins from './plugins'
import toolbar from './toolbar'
import load from './dynamicLoadScript'
import VueSelectImage from 'vue-select-image'
import "vue-select-image/dist/vue-select-image.css";
import scanner from "@/components/scanner.vue";
import TemInsert from "@/components/templateInsert.vue";
import TemAdd from "@/components/templateAdd.vue";
import CodeEdit from "@/components/CodeEdit";
import axios from "axios";
const tinymceCDN = 'https://fastly.jsdelivr.net/npm/tinymce-all-in-one@4.9.3/tinymce.min.js'

export default {
  name: 'tinymce',
  components: {
    CodeEdit,
    // eslint-disable-next-line vue/no-unused-components
    VueSelectImage,
    // eslint-disable-next-line vue/no-unused-components
    scanner,
    TemInsert,
    TemAdd

  },
  props: {
    id: {
      type: String,
      default: function () {
        return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    value: {
      type: String,
      default: ''
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    menubar: {
      type: String,
      default: 'file edit insert view format table'
    },
    height: {
      type: [Number, String],
      required: false,
      default: 360
    },
    width: {
      type: [Number, String],
      required: false,
      default: 'auto'
    }
  },
  data() {
    return {
      //控制敏感词汇的组件显示与隐藏
      isScannerShow: true,
      //敏感词汇列表
      wordList: [],
      //要上传的图片
      dialogImageUrl: '',
      dialogVisible: false,
      initialSelected: [],
      editor: null,
      selectedImage: [],
      dialogAddVisible: false,
      dialogUploadVisible: false,
      //控制敏感词汇的显示与隐藏
      dialogScannerVisible: false,
      //添加模板显示
      dialogTempAddVisible: false,
      dialogTempInsertVisible: false,
      dialogCodeEditVisible: false,
      hasChange: false,
      hasInit: false,
      tinymceId: this.id,
      fullscreen: false,
      languageTypeList: {
        en: 'en',
        zh: 'zh_CN',
        es: 'es_MX',
        ja: 'ja'
      },
      dataImages: [],
      content: '111',
      TemplateArr: [],
      selectVal: ''
    }
  },
  computed: {
    language() {
      return this.languageTypeList['zh']
    },
    containerWidth() {
      const width = this.width
      if (/^[\d]+(\.[\d]+)?$/.test(width)) {
        // matches `100`, `'100'`
        return `${width}px`
      }
      return width
    },
  },
  watch: {
    value(val) {
      if (!this.hasChange && this.hasInit) {
        this.$nextTick(() => window.tinymce.get(this.tinymceId).setContent(val || ''))
      }
    },
    language() {
      // this.destroyTinymce()
      this.$nextTick(() => this.initTinymce())
    }
  },
  mounted() {
    this.init()
    //发送请求获取照片，然后复制给dataImages
    this.selectSensitiveWord()
  },
  destroyed() {
    this.destroyTinymce()
  },
  methods: {
    //查询所有敏感词汇
    selectSensitiveWord() {
      this.$axios.get('/api1/sensitive_word/get', {
        params: {
          currentPage: 1,
          size: 5
        }
      }).then((res) => {
        if (res.data.code === 200) {
          console.log(res.data.data.records)
          for (let i = 0; i < res.data.data.records.length; i++) {
            this.wordList.push(res.data.data.records[i].content)
            console.log(this.wordList)
          }
        }
      });
    },
    //图片的预览功能
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //弹出框--取消选择
    cancelShowImage() {
      this.$refs['vueSelectImage'].resetMultipleSelection()
      this.dialogAddVisible = false
    },
    //弹出框--确认选择
    showImage() {
      console.log(this.selectedImage)
      const editor = this.editor
      for (let i = 0; i < this.selectedImage.length; i++) {
        editor.insertContent(`<img class='goodsImg' style='width:100px;height:100px' src='${this.selectedImage[i].src}'/>`)
      }
      this.$refs['vueSelectImage'].resetMultipleSelection()
      this.dialogAddVisible = false
    },
    onSelectMultipleImage(images) {
      this.selectedImage = images
      // console.log(images)
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        // eslint-disable-next-line no-unused-vars
        .then(_ => {
          done();
        })
        // eslint-disable-next-line no-unused-vars
        .catch(_ => { });
    },
    // CloseTemp(done) {
    //   this.$confirm('确认关闭？')
    //     // eslint-disable-next-line no-unused-vars
    //     .then(_ => {
    //       console.log(this.dialogTemAddVisible);

    //       this.dialogTempAddVisible = false
    //       done();
    //     })
    //     // eslint-disable-next-line no-unused-vars
    //     .catch(_ => { });
    // },
    init() {
      // dynamic load tinymce from cdn
      load(tinymceCDN, (err) => {
        if (err) {
          this.$message.error(err.message)
          return
        }
        this.initTinymce()
      })
    },
    initTinymce() {
      const _this = this
      window.tinymce.init({
        language: this.language,
        selector: `#${this.tinymceId}`,
        height: this.height,
        body_class: 'panel-body',
        branding: false,
        object_resizing: false,
        toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
        menubar: this.menubar,
        plugins: plugins,
        toolbar_drawer: true,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        paste_data_images: true, //允许粘贴base64图片
        paste_enable_default_filters: false, //word文本设置
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'default,circle,disc,square',
        //advlist_number_styles: 'default',
        imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
        default_link_target: '_blank',
        link_title: true,
        fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
        font_formats:
          '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        statusbar: false,
        init_instance_callback: (editor) => {
          console.log('init_instance_callback', editor)
          if (_this.value) {
            editor.setContent(_this.value)
          }
          _this.hasInit = true
          editor.on('NodeChange Change KeyUp SetContent', () => {
            this.hasChange = true
            this.$emit('input', editor.getContent())
          })
        },
        setup(editor) {
          editor.on('FullscreenStateChanged', (e) => {
            _this.fullscreen = e.state
          })
          editor.addButton('addImageButton', {
            // 按钮名
            text: '添加图片',
            // 是否显示图标
            icon: false,
            //onclick事件
            onclick: async function () {
              // console.log( _this.$refs['vueSelectImage'])
              // 在这里写一个弹出框
              _this.editor = editor
              // _this.$axios.get('/api1/template_img/get', {
              //   params: {
              //     currentPage: 1,
              //     size: 5
              //   }
              // }).then((res)=>{
              //     if(res.data.code===200){
              //       console.log(res.data.data.records)
              //       _this.dataImages = res.data.data.records
              //     }
              //   });
              _this.dialogAddVisible = true
            }

          })
          editor.addButton('uploadImageButton', {
            // 按钮名
            text: '上传图片',
            // 是否显示图标
            icon: false,
            //onclick事件
            onclick: function () {
              // console.log( _this.$refs['vueSelectImage'])
              // 在这里写一个弹出框
              _this.editor = editor
              _this.dialogUploadVisible = true
            }

          })
          editor.addButton('CodeEditButton', {
            // 按钮名
            text: '正文格式化',
            // 是否显示图标
            icon: false,
            //onclick事件
            onclick: function () {
              // console.log( _this.$refs['vueSelectImage'])
              // 在这里写一个弹出框
              let titleTemplate = '<p class="MsoNormal" style="margin-bottom: 12.0pt; mso-para-margin-bottom: 1.0gd; text-align: center; line-height: 22.0pt; mso-line-height-rule: exactly; layout-grid-mode: char;" align="center"><span style="font-size: 18.0pt; font-family: 黑体; mso-bidi-font-family: 宋体;">{{}}</span></p>'
              let contentTemplate = '<p class="MsoNormal" style="text-indent: 21.0pt; line-height: 150%;"><span style="font-size: 12.0pt; line-height: 150%; font-family: 宋体; mso-ascii-font-family: \'Times New Roman\'; mso-bidi-font-family: \'Times New Roman\';">{{}}</span></p>'
              let imageTemplate = '<p class="MsoNormal" style="text-align: center; line-height: 150%;"><img src="{{image}}" alt="图片1描述" style="display: block; margin: 0 auto;"></p>';

              _this.editor = editor
              // _this.dialogCodeEditVisible = true
              _this.$nextTick(() => {
                _this.content = _this.getContent();
                var regexContent = /(<([^>]+)>)/ig;//匹配html标签文本内容
                let pArr = [];//每个段落
                var regex = /<p(?:(?!<\/p>).|\n)*?<\/p>/gm;//匹配每个p标签
                var regexKeepImgSrc = /<img.*?src=['"](.*?)['"].*?>/i//匹配所有的url
                var regexImg = /<img[^>]*>/i;

                //将取到的段落压入数组
                _this.content.replace(regex, str => { pArr.push(str) });
                let contentArr = [];//每个段落的每个内容
                pArr.forEach((item) => {
                  // 首先将有img 标签的p分开转换，防止被过滤掉
                  let temp = "";
                  if (regexImg.test(item)) {
                    // 获取到url
                    temp = "{{{url}}}" + item.match(regexKeepImgSrc);
                  } else {
                    //获取到文本值
                    temp = item.replace(regexContent, "");
                  }

                  if (!(temp == '&nbsp;')) {
                    contentArr.push(temp);
                  }
                })

                let domStr = '';
                contentArr.forEach((item, index) => {
                  if (index === 0) {
                    domStr += titleTemplate.replace('{{}}', item);
                  } else {
                    if (item.includes("{{{url}}}")) {
                      item.replace("{{{url}}}", "");
                      imageTemplate.replace('{{image}}', item);
                    }
                    domStr += contentTemplate.replace('{{}}', item);
                  }
                })
                _this.editor.execCommand('SelectAll');
                _this.editor.execCommand('Strikethrough', false);
                _this.editor.selection.setContent(domStr);
              });
            }
          })
          editor.addButton('TempInsertButton', {
            // 按钮名
            text: '应用模板',
            // 是否显示图标
            icon: false,
            //onclick事件
            onclick: function () {
              // 在这里写一个弹出框
              _this.editor = editor
              _this.dialogTempInsertVisible = true
              _this.selectVal = _this.editor.selection.getContent({ format: 'text' })
              _this.$axios.get('/api1/template/getAll').then(res => {
                _this.TemplateArr = res.data.data;
              }, err => {
                console.log(error);
              })
              _this.$nextTick(() => {

              });
            }
          })
          editor.addButton('TempAddButton', {
            // 按钮名
            text: '添加模板',
            // 是否显示图标
            icon: false,
            //onclick事件
            onclick: function () {
              // console.log( _this.$refs['vueSelectImage'])
              // 在这里写一个弹出框
              _this.editor = editor
              _this.dialogTempAddVisible = true
              _this.$nextTick(() => {
                _this.content = _this.getContent()
                // console.log(_this.content);

              });
            }
          })
        },
        // it will try to keep these URLs intact
        // https://www.tiny.cloud/docs-3x/reference/configuration/Configuration3x@convert_urls/
        // https://stackoverflow.com/questions/5196205/disable-tinymce-absolute-to-relative-url-conversions
        convert_urls: false,
        // 整合七牛上传
        // images_dataimg_filter(img) {
        //   setTimeout(() => {
        //     const $image = $(img);
        //     $image.removeAttr('width');
        //     $image.removeAttr('height');
        //     if ($image[0].height && $image[0].width) {
        //       $image.attr('data-wscntype', 'image');
        //       $image.attr('data-wscnh', $image[0].height);
        //       $image.attr('data-wscnw', $image[0].width);
        //       $image.addClass('wscnph');
        //     }
        //   }, 0);
        //   return img
        // },
        images_upload_handler(blobInfo, success, failure, progress) {
          // progress(0);
          // const token = _this.$store.getters.token;
          // getToken(token).then(response => {
          //   const url = response.data.qiniu_url;
          //   const formData = new FormData();
          //   formData.append('token', response.data.qiniu_token);
          //   formData.append('key', response.data.qiniu_key);
          //   formData.append('file', blobInfo.blob(), url);
          //   upload(formData).then(() => {
          //     success(url);
          //     progress(100);
          //   })
          // }).catch(err => {
          //   failure('出现未知问题，刷新页面，或者联系程序员')
          //   console.log(err);
          // });
          //在这里把已经选择的图片上传到富文本编辑器中
          const img = `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`
          success(img)
        }

      })
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId)
      if (this.fullscreen) {
        tinymce.execCommand('mceFullScreen')
      }
      if (tinymce) {
        tinymce.destroy()
      }
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value)
    },
    getContent() {
      return window.tinymce.get(this.tinymceId).getContent()
    },
    imageSuccessCBK(arr) {
      arr.forEach((v) => window.tinymce.get(this.tinymceId).insertContent(`<img class="wscnph" src="${v.url}" >`))
    }
  }
}
</script>

<style lang="less" scoped>
.tinymce-container {
  position: relative;
  line-height: normal;

  /deep/ * {
    border-color: #efefef;
    white-space: pre-wrap;
  }
}

.tinymce-container {
  ::v-deep {
    .mce-fullscreen {
      z-index: 10000;
    }
  }
}

.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}

.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}

.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}

.editor-upload-btn {
  display: inline-block;
}
</style>

