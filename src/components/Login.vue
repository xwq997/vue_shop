<!-- 登陆 -->
<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/headerImg.jpg" />
      </div>
      <!-- 登陆 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            show-password
            placeholder="请输入登陆密码"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //登陆表单
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入登陆密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },

  components: {},
  methods:{
    //重置按钮
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields()
      
    },
    // 登陆按钮
    login(){
      this.$refs.loginFormRef.validate((async valid=>{
        if(!valid) return;
        const {data:res}=await this.$axios.post('login',this.loginForm); 
        console.log(res)
        if(res.meta.status!==200) return this.$message.error('登陆失败');
        this.$message.success('登陆成功')
        //保存token到session里面
        window.sessionStorage.setItem('token',res.data.token);
        this.$router.push('/home');
      }))
    }
  }
};
</script>
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .avatar_box {
    width: 130px;
    height: 130px;
    // border: 1px solid pink;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    margin-top: -75px;
    background-color: #fff;
    align-self: center;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .btn {
    display: flex;
    justify-content: flex-end;
  }

  .el-form {
    width: 90%;
    margin: 0 auto;
  }
}
</style>