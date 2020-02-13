<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta"
                :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)"
                      :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)"
                :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else
                ref="subMenu"
                :index="resolvePath(item.path)"
                popper-append-to-body>
      <template slot="title">
        <item v-if="item.meta"
              :icon="item.meta && item.meta.icon"
              :title="item.meta.title" />
      </template>
      <sidebar-item v-for="child in item.children"
                    :key="child.path"
                    :is-nest="true"
                    :item="child"
                    :base-path="resolvePath(child.path)"
                    class="nest-menu" />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data () {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {}
  },
  methods: {
    hasOneShowingChild (children = [], parent) {
      const showingChildren = children.filter(item => {
        // 如果 children 中的路由包含 hidden 属性，则返回 false
        if (item.hidden) {
          return false
        } else {
          // 将子路由赋值给 onlyOneChild，用于只包含一个路由时展示 
          this.onlyOneChild = item
          return true
        }
      })

      // 如果过滤后，只包含展示一个路由，则返回 true
      if (showingChildren.length === 1) {
        return true
      }

      // 如果没有子路由需要展示，则将 onlyOneChild 的 path 设置空路由，并添加 noShowingChildren 属性，表示虽然有子路由，但是不需要展示子路由
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }
      // 返回 false，表示不需要展示子路由，或者超过一个需要展示的子路由
      return false
    },
    resolvePath (routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
