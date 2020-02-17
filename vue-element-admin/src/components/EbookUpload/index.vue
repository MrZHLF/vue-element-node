<template>
  <div class="upload-container">
    <el-upload :action="action"
               :headers="headers"
               :multiple="false"
               :limit="1"
               :before-upload="beforeUpload"
               :on-success="onSuccess"
               :on-error="onError"
               :on-remove="onRemove"
               :file-list="fileList"
               :on-exceed="onExcedd"
               :disabled="disabled"
               drag
               show-file-list
               accept="application/epub+zip"
               class="images-upload">
      <i class="el-icon-upload"></i>
      <div class="el-upload_text"
           v-if="fileList.length===0">请将电子书拖入或<em>点击上传</em></div>
      <div class="el-upload_text"
           v-else>图书已上传</div>
    </el-upload>
  </div>
</template>
<script>
import { getToken } from './../../utils/auth'
export default {
  name: "EbookUpload",
  props: {
    fileList: {
      type: Array,
      default () {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      action: `${process.env.VUE_APP_BASE_API}/book/upload`
    }
  },
  computed: {
    headers () {
      return {
        Authorization: `Bearer ${getToken()}`
      }
    }
  },
  methods: {
    beforeUpload (file) {
      console.log(file);
      this.$emit('beforeUpload', file)
    },
    onSuccess (response, file) {
      console.log(response, file);
      const { code, msg, data } = response;
      if (code) {
        this.$message({
          message: msg,
          type: 'success'
        })
        this.$emit('onSuccess', data)
      } else {
        this.$message({
          message: (msg && `上传失败,失败原因是:${msg}`) || '上传失败',
          type: 'error'
        })
      }
      this.$emit('onError', file)

    },
    onError (err) {
      const errMsg = err.message && JSON.parse(err.message)
      this.$message({
        message: (errMsg && errMsg.msg && `上传失败,失败原因是:${errMsg.msg}`) || '上传失败',
        type: 'error'
      })
      this.$emit('onError', err)
    },
    onRemove () {
      // 删除
      this.$message({
        message: '电子书删除成功',
        type: 'success'
      })
      this.$emit('onRemove')
    },
    onExcedd () {
      this.$message({
        message: '每次只能上传一本书',
        type: 'waring'
      })
    }
  }
};
</script>
