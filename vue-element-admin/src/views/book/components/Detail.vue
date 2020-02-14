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
          <ebook-upload></ebook-upload>
        </el-col>
        <el-col :span="24"></el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Sticky from '../../../components/Sticky/index'
import Warning from './Warning'
import EbookUpload from './../../../components/EbookUpload/index'
export default {
  name: "Book",
  props: {
    isEdit: Boolean
  },
  data () {
    return {
      loading: false,
      postForm: {}
    }
  },
  components: {
    Sticky,
    Warning,
    EbookUpload
  },
  methods: {
    showGuide () {
      console.log(111);
    },
    submitForm () {
      this.loading = true
    }
  }
};
</script>
<style lang="scss" scoped>
.detail-container {
  padding: 40px 50px 20px;
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
