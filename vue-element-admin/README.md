## 关于路由处理

- vue-element-admin 对所有访问的路由进行拦截；
- 访问路由时会从 Cookie 中获取 Token，判断 Token 是否存在：
  - 如果 Token 存在，将根据用户角色生成动态路由，然后访问路由，生成对应的页面组件。这里有一个特例，即用户访问 /login 时会重定向至 / 路由；
  - 如果 Token 不存在，则会判断路由是否在白名单中，如果在白名单中将直接访问，否则说明该路由需要登录才能访问，此时会将路由生成一个 redirect 参数传入 login 组件，实际访问的路由为：/login?redirect=/xxx。

## 关于动态路由和权限校验

- vue-element-admin 将路由分为：constantRoutes 和 asyncRoutes
- 用户登录系统时，会动态生成路由，其中 constantRoutes 必然包含，asyncRoutes 会进行过滤；
- asyncRoutes 过滤的逻辑是看路由下是否包含 meta 和 meta.roles 属性，如果没有该属性，所以这是一个通用路由，不需要进行权限校验；如果包含 roles 属性则会判断用户的角色是否命中路由中的任意一个权限，如果命中，则将路由保存下来，如果未命中，则直接将该路由舍弃；
- asyncRoutes 处理完毕后，会和 constantRoutes 合并为一个新的路由对象，并保存到 vuex 的 permission/routes 中；
- 用户登录系统后，侧边栏会从 vuex 中获取 state.permission.routes，根据该路由动态渲染用户菜单。
