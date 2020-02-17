<template>
  <el-form ref="postForm"
           :model="postForm">
    <Sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit"
                 @click="showGuide">显示帮助</el-button>
      <el-button v-loading="loading"
                 @click="submitForm"
                 type="success"
                 style="margin-left:10px">{{isEdit ? '编辑电子书' :'新增电子书'}}</el-button>
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
                            :label-width="labelWidth">
                <el-input v-model="postForm.author"
                          placeholder="作者"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出版社:"
                            :label-width="labelWidth">
                <el-input v-model="postForm.publisher"
                          placeholder="出版社"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="语言:"
                            :label-width="labelWidth">
                <el-input v-model="postForm.language"
                          placeholder="语言"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="根文件:"
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
                            :label-width="labelWidth">
                <el-input v-model="postForm.filePath"
                          placeholder="文件路径"
                          disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="解压路径:"
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
                            :label-width="labelWidth">
                <el-input v-model="postForm.coverPath"
                          placeholder="封面路径"
                          disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文件名称:"
                            :label-width="labelWidth">
                <el-input v-model="postForm.originalname"
                          placeholder="文件名称"
                          disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item :label-width="labelWidth"
                            label="封面:">
                <a v-if="postForm.cover"
                   :href="postForm.cover"
                   target="_blank">
                  <img :src="postForm.cover"
                       class="preview-img">
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item :label-width="labelWidth"
                            label="目录：">
                <div v-if="postForm.contents && postForm.contents.length > 0"
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
  title: '', // 书名
  author: '', // 作者
  publisher: '', // 出版社
  language: '', // 语种
  rootFile: '', // 根文件路径
  cover: '', // 封面图片URL
  coverPath: '', // 封面图片路径
  filename: '', // 文件名
  originalName: '', // 文件原始名称
  filePath: '', // 文件所在路径
  unzipPath: '', // 解压文件所在路径
  contents: [] // 目录
}
import Sticky from '../../../components/Sticky/index'
import Warning from './Warning'
import EbookUpload from './../../../components/EbookUpload/index'
import MdInput from './../../../components/MDinput/index'
export default {
  name: "Book",
  props: {
    isEdit: Boolean
  },
  data () {
    return {
      loading: false,
      postForm: {
        ebook_uri: ''
      },
      fileList: [],
      labelWidth: '120px',
      contentsTree: [],
    }
  },
  components: {
    Sticky,
    Warning,
    EbookUpload,
    MdInput
  },
  methods: {
    showGuide () {
      console.log(111);
    },
    submitForm () {
      this.loading = true
    },
    setData (data) {
      const {
        title,
        author,
        publisher,
        rootFile,
        cover,
        url,
        originalname,
        contentsTree,
        contents,
        filename,
        coverPath,
        filePath,
        unzipPath,
        language
      } = data
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        rootFile,
        cover,
        url,
        originalname,
        contents,
        filename,
        coverPath,
        filePath,
        unzipPath,
        language
      }
      this.contentsTree = contentsTree
    },
    onUploadSuccess (data) {
      // 上传成功
      console.log(data)
      this.setData(data)

    },
    onContentClick (data) {
      const { text } = data
      if (text) {
        window.open(text)
      }
    },
    setDefault () {
      this.postForm = Object.assign({}, defaultForm)
      this.contentsTree = []
    },
    onUploadRemove () {
      // 删除
      this.setDefault()
      console.log('删除');

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
