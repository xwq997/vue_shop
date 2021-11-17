<!-- 主页 -->
<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="黑马" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">
          <span v-if="isCollapse"><i class="el-icon-caret-right"></i></span>
          <span v-else><i class="el-icon-caret-left"></i></span>
        </div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          background-color="#323743"
          text-color="#fff"
          active-text-color="#4297F7"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="String(item.id)"
            v-for="(item, index) in menuList"
            :key="index"
          >
            <template slot="title">
              <div v-for="(icon, index) in iconListObj" :key="index"></div>
              <i :class="iconListObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              @click="saveNavState('/' + subItem.path)"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>用户列表</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconList: [
        "iconfont icon-user",
        "iconfont icon-tijikongjian",
        "iconfont icon-shangpin",
        "iconfont icon-danju",
        "iconfont icon-baobiao",
      ],
      iconListObj: {}, //合并成的图标
      isCollapse: false, //合并菜单栏状态
      activePath: "", //当前所在的二级菜单地址
    };
  },
  created() {
    this.getMenuList(),
      (this.activePath = window.sessionStorage.getItem("activePath"));
  },
  mounted() {},
  computed: {},

  methods: {
    //点击退出按钮
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取左侧菜单
    async getMenuList() {
      const { data: res } = await this.$axios.get("menus");
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      //获取图标
      for (let i = 0; i < this.menuList.length; i++) {
        this.iconListObj[this.menuList[i].id] = this.iconList[i];
      }
      // console.log('图标对象',this.iconListObj)
    },
    //切换菜单栏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //当前二级菜单显示为高亮
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    background-color: #373d3f;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #323743;
    .el-menu {
      border: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4a5064;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.4rem;
    cursor: pointer;
  }
}
</style>
