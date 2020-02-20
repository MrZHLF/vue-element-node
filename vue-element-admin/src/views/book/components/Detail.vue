<template>
  <el-form ref="postForm"
           :model="postForm"
           :rules="rules">
    <Sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit"
                 @click="showGuide">显示帮助</el-button>
      <el-button v-loading="loading"
                 @click="submitForm"
                 type="success"
                 style="margin-left:10px">{{ isEdit ? "编辑电子书" : "新增电子书" }}</el-button>
    </Sticky>
    <div class="detail-container">
      <el-row>
        <Warning></Warning>
        <el-col :span="24">
          <!-- 表单控件的具体样式 -->
          <ebook-upload :file-list="fileList"
                        :disabled="isEdit"
                        @onSuccess="onUploadSuccess"
                        @onRemove="onUploadRemove"></ebook-upload>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <MdInput v-model="postForm.title"
                     :maxlength="100"
                     name="name"
                     required>书名</MdInput>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="作者:"
                            prop="author"
                            :label-width="labelWidth">
                <el-input v-model="postForm.author"
                          placeholder="作者"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出版社:"
                            prop="publisher"
                            :label-width="labelWidth">
                <el-input v-model="postForm.publisher"
                          placeholder="出版社"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="语言:"
                            prop="language"
                            :label-width="labelWidth">
                <el-input v-model="postForm.language"
                          placeholder="语言"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="根文件:"
                            prop="rootFile"
                            :label-width="labelWidth">
                <el-input v-model="postForm.rootFile"
                          placeholder="根文件"
                          disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="文件路径:"
                            prop="filePath"
                            :label-width="labelWidth">
                <el-input v-model="postForm.filePath"
                          placeholder="文件路径"
                          disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="解压路径:"
                            prop="unzipPath"
                            :label-width="labelWidth">
                <el-input v-model="postForm.unzipPath"
                          placeholder="解压路径"
                          disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="封面路径:"
                            prop="coverPath"
                            :label-width="labelWidth">
                <el-input v-model="postForm.coverPath"
                          placeholder="封面路径"
                          disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文件名称:"
                            prop="originalName"
                            :label-width="labelWidth">
                <el-input v-model="postForm.originalName"
                          placeholder="文件名称"
                          disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item :label-width="labelWidth"
                            prop="cover"
                            label="封面:">
                <a v-if="postForm.cover"
                   :href="postForm.cover"
                   target="_blank">
                  <img :src="postForm.cover"
                       class="preview-img" />
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item :label-width="labelWidth"
                            label="目录：">
                <div v-if="contentsTree && contentsTree.length > 0"
                     class="contents-wrapper">
                  <el-tree :data="contentsTree"
                           @node-click="onContentClick" />
                </div>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
const defaultForm = {
  title: "", // 书名
  author: "", // 作者
  publisher: "", // 出版社
  language: "", // 语种
  rootFile: "", // 根文件路径
  cover: "", // 封面图片URL
  coverPath: "", // 封面图片路径
  fileName: "", // 文件名
  originalName: "", // 文件原始名称
  filePath: "", // 文件所在路径
  unzipPath: "", // 解压文件所在路径
  contents: [] // 目录
};
const fields = {
  title: "书名",
  author: "作者",
  publisher: "出版社",
  language: "语言"
};
import Sticky from "../../../components/Sticky/index";
import Warning from "./Warning";
import EbookUpload from "./../../../components/EbookUpload/index";
import MdInput from "./../../../components/MDinput/index";
import { createBook, getBook, updateBook } from "./../../../api/book";
export default {
  name: "Book",
  props: {
    isEdit: Boolean
  },
  data () {
    const validateRequire = (rule, value, callback) => {
      console.log(rule, value);

      if (value.length == "") {
        callback(new Error(fields[rule.field] + "必须填写"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      postForm: {},
      fileList: [],
      labelWidth: "120px",
      contentsTree: [],
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      }
    };
  },
  components: {
    Sticky,
    Warning,
    EbookUpload,
    MdInput
  },
  created () {
    if (this.isEdit) {
      const fileName = this.$route.params
      this.getBookData(fileName)
    }
  },
  methods: {
    getBookData (fileName) {
      // 获取书
      getBook(fileName).then(response => {
        this.setData(response.data)
      })
    },
    showGuide () {
      console.log(111);
    },
    setData (data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        originalName,
        url,
        contents,
        contentsTree,
        fileName,
        coverPath,
        filePath,
        unzipPath
      } = data
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        rootFile,
        cover,
        url,
        originalName,
        contentsTree,
        contents,
        fileName,
        coverPath,
        filePath,
        unzipPath,
        language
      };
      this.contentsTree = contentsTree;
      this.fileList = [{ name: originalName || fileName, url }]
    },
    onUploadSuccess (data) {
      // 上传成功
      console.log('onUploadSuccess', data);
      this.setData(data);
    },
    onContentClick (data) {
      const { text } = data;
      if (text) {
        window.open(text);
      }
    },
    setDefault () {
      // this.postForm = Object.assign({}, defaultForm)
      this.contentsTree = [];
      this.fileList = [];
      this.$refs.postForm.resetFields();
    },
    onUploadRemove () {
      // 删除
      this.setDefault();
      console.log("删除");
    },
    submitForm () {
      // const onSuccess = (response) => {
      //   const { msg } = response;
      //   this.$notify({
      //     title: "操作成功",
      //     message: msg,
      //     type: "success",
      //     duration: 2000
      //   });
      //   this.loading = false;
      // }
      this.loading = true;
      this.$refs.postForm.validate((valid, fields) => {
        if (valid) {
          const book = Object.assign({}, this.postForm);
          delete book.contentsTree;
          if (!this.isEdit) {
            // 新增电子书
            createBook(book)
              .then(response => {
                const { msg } = response;
                this.$notify({
                  title: "操作成功",
                  message: msg,
                  type: "success",
                  duration: 2000
                });
                this.loading = false;
                this.loading = false;
                this.setDefault();
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            // 更新电子书
            updateBook(book).then(response => {
              console.log(response, '更新成功')
              const { msg } = response;
              this.$notify({
                title: "操作成功",
                message: msg,
                type: "success",
                duration: 2000
              });
              this.loading = false;
            }).catch(() => {
              this.loading = false;
            })
          }
        } else {
          const message = fields[Object.keys(fields)[0]][0].message;
          this.$message({
            message,
            type: "error"
          });
          this.loading = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.detail-container {
  padding: 40px 50px 20px;
  .preview-img {
    width: 200px;
    height: 270px;
  }
}
// @import "~@/styles/mixin.scss";

// .createPost-container {
//   position: relative;

//   .createPost-main-container {
//     padding: 40px 45px 20px 50px;

//     .preview-img {
//       width: 200px;
//       height: 270px;
//     }

//     .contents-wrapper {
//       padding: 5px 0;
//     }
//   }
// }
</style>
