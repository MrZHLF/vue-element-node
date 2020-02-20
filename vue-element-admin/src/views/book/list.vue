<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title"
                placeholder="书名"
                style="width:200px"
                class="filter-item"
                clearable
                @keyup.enter.native="handleFilter"
                @clear="handleFilter"
                @blur="handleFilter" />
      <el-input v-model="listQuery.author"
                placeholder="作者"
                style="width:200px"
                class="filter-item"
                clearable
                @keyup.enter.native="handleFilter"
                @clear="handleFilter"
                @blur="handleFilter" />
      <el-select v-model="listQuery.category"
                 placeholder="分类"
                 class="filter-item"
                 clearable
                 @change="handleFilter">
        <el-option v-for="item in categoryList"
                   :key="item.value"
                   :label="item.label+'('+item.num+')'"
                   :value="item.value" />
      </el-select>
      <el-button type="primary"
                 v-waves
                 icon="el-icon-search"
                 class="filter-item"
                 style="margin-left:10px"
                 @click="handleFilter">查询</el-button>
      <el-button type="primary"
                 class="filter-item"
                 style="margin-left:10px"
                 icon="el-icon-edit"
                 @click="handleCreate">新增</el-button>
      <el-checkbox v-model="showCover"
                   class="filter-item"
                   style="margin-left:5px;"
                   @change="changeShowCover">
        显示封面
      </el-checkbox>
    </div>
    <el-table :key="tabKey"
              v-loading="listLoading"
              :data="list"
              border
              fit
              highlight-current-row
              style="width:100%"
              @sort-change="sortChange">
      <el-table-column label="ID"
                       prop="id"
                       sortable="custom"
                       align="center"
                       width="80" />
      <el-table-column label="书名"
                       width="150"
                       align="center">
        <template slot-scope="{row:{titleWrapper}}">
          <span v-html="titleWrapper"></span>
        </template>
      </el-table-column>
      <el-table-column label="作者"
                       width="150"
                       align="center">
        <template slot-scope="{row:{authorWrapper}}">
          <span v-html="authorWrapper"></span>
        </template>
      </el-table-column>
      <el-table-column label="出版社"
                       prop="publisher"
                       align="center"
                       width="150" />
      <el-table-column label="出版社"
                       prop="publisher"
                       align="center"
                       width="150" />
      <el-table-column label="分类"
                       prop="categoryText"
                       align="center"
                       width="100" />
      <el-table-column label="语言"
                       prop="language"
                       align="center"
                       width="80" />
      <el-table-column label="封面"
                       v-if="showCover"
                       align="center"
                       width="150">
        <template slot-scope="scope">
          <a :href="scope.row.cover"
             target="_blank">
            <img :src="scope.row.cover"
                 style="width:120px;height:180px" />
          </a>
        </template>
      </el-table-column>
      <el-table-column label="文件名"
                       prop="fileName"
                       align="center"
                       width="100" />
      <el-table-column label="文件路径"
                       prop="filePath"
                       align="center"
                       width="100" />
      <el-table-column label="封面路径"
                       prop="coverPath"
                       align="center"
                       width="100" />
      <el-table-column label="解压路径"
                       prop="unzipPath"
                       align="center"
                       width="100" />
      <el-table-column label="上传人"
                       prop="createUser"
                       align="center"
                       width="100" />
      <el-table-column label="上传时间"
                       prop="createDt"
                       align="center"
                       width="100" />
      <el-table-column label="操作"
                       width="120"
                       align="center"
                       fixed="right">
        <template slot-scope="{row}">
          <el-button type="text"
                     icon="el-icon-edit"
                     @click="handleUpdate(row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="0" />
  </div>
</template>
<script>
import Pagination from '../../components/Pagination'
import waves from './../../directive/waves/waves'
import { getCategory, listBook } from './../../api/book'
export default {
  name: "List",
  directives: { waves },
  data () {
    return {
      tabKey: 0,
      listLoading: false,
      listQuery: {},
      showCover: true, //是否显示封面
      categoryList: [],//分类
      list: []
    }
  },
  created () {
    this.parseQuery()
  },
  mounted () {
    this.getList()
    this.getCategoryList()
  },
  methods: {
    parseQuery () {
      const listQuery = {
        page: 1,
        pageSize: 20,
        sort: '+id'
      }
      this.listQuery = { ...listQuery, ...this.listQuery }
    },
    handleUpdate (row) {
      console.log(row, 'row');
      this.$router.push(`/book/edit/${row.fileName}`)

    },
    sortChange (data) {
      console.log('sortChange', data);
      const { prop, order } = data
      this.sortBy(prop, order)
    },
    sortBy (prop, order) {
      if (order === "ascending") {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    wrapperKeyword (k, v) {
      function highlight (value) {
        return `<span style="color:#1890ff">${value}</span>`
      }
      if (!this.listQuery[k]) {
        return v
      } else {
        //   正则表达式 i大小写g全局
        return v.replace(new RegExp(this.listQuery[k], 'ig'), v => highlight(v))
      }
    },
    getList () {
      this.listLoading = true;
      listBook(this.listQuery).then(response => {
        console.log(response);
        const list = response.data.list
        this.list = list
        this.listLoading = false
        this.list.forEach(book => {
          book.titleWrapper = this.wrapperKeyword('title', book.title)
          book.authorWrapper = this.wrapperKeyword('author', book.author)
        })
      })
    },
    getCategoryList () {
      // 分类
      getCategory().then(response => {
        this.categoryList = response.data
      })
    },
    handleFilter () {
      // 查询
      this.getList()

    },
    handleCreate () {
      // 新增
      this.$router.push('/book/create')
    },
    changeShowCover (value) {
      // 是否显示封面
      this.showCover = value
    },
  },
  components: {
    Pagination
  }
};
</script>
