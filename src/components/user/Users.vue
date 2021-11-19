<!--  -->
<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type='index' label="#"></el-table-column>
         <el-table-column label="姓名" prop="username"></el-table-column>
         <el-table-column label="邮箱" prop="email"></el-table-column>
         <el-table-column label="电话" prop="mobile"></el-table-column>
         <el-table-column label="角色" prop="role_name"></el-table-column>
         <el-table-column label="状态">
           <template slot-scope="scope">
             <el-switch
              v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
           </template>
         </el-table-column>
         <el-table-column label="操作" width="180px">
           <template slot-scope="scope">
              <!-- 修改 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              <!-- 删除 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
              <!-- 分配角色 -->
              <el-tooltip content="分配角色" placement="top" :enterable='false'>
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
              </el-tooltip>
           </template>
         </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1,2,5,10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
    <!-- 添加用户信息表单 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>
      <!-- 确认取消 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 修改用户的对话框 -->
  <el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%" @close="editDialogClosed"
  >
  <!-- 修改用户的表格 -->
  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" >
    <el-form-item label="用户名" >
      <el-input v-model="editForm.username" disabled></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="editForm.email"></el-input>
    </el-form-item>
    <el-form-item label="手机号" prop="mobile">
      <el-input v-model="editForm.mobile"></el-input>
    </el-form-item>
  </el-form>
  <!-- 确认取消 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配觉得的对话框 -->
<el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%"
  @close="setRoleDialogClosed"
  >
  <el-form :model="userInfo" >
     <el-form-item label="当前的用户" label-width='90px'>
      <el-input v-model="userInfo.username" disabled></el-input>
    </el-form-item>
    <el-form-item label="当前的角色" label-width='90px'>
      <el-input v-model="userInfo.role_name" disabled></el-input>
    </el-form-item>
    <!-- 下拉菜单 -->
    <el-form-item label="分配新角色" label-width='90px'>
    <el-select v-model="selectedRoleId" placeholder="请选择新角色">
      <el-option v-for="item in rolesList" :value="item.id"  :label="item.roleName" :key="item.id" ></el-option>
    </el-select>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    //自定义验证邮箱的规则
    let checkEmail=(rule,value,cb)=>{
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)){
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
     //自定义验证手机号的规则
    let checkMobile=(rule,value,cb)=>{
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if(regMobile.test(value)){
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    
    return {
        //需要发送给后台的（获取用户列表的参数对象）
        queryInfo:{
            query:"", //查询
            pagenum:1, //当前页数
            pagesize:2  //当前每页显示多少条
        },
        userList:[], //用户列表
        total:0, //总共多少条数据
        pageCount:0,//总共多少页
        addDialogVisible:false, //控制显示隐藏添加用户对话框
        //添加用户的表单数据
        addForm:{
          username:"",  //用户名
          password:"",  //密码
          email:"",     //邮箱
          mobile:""     //手机
        }, 
        //验证添加用户表单的规则
        addFormRules:{
          username:[
            { required: true, message: "请输入用户名", trigger: "blur" },
            { min: 3, max: 10, message: "用户名的长度在 3 到 10 个字符之间", trigger: "blur",},
          ],
          password:[
            { required: true, message: "请输入密码", trigger: "blur" },
            { min: 6, max: 15, message: "用户名的长度在 6 到 15 个字符之间", trigger: "blur",},
          ],
          email:[
            { required: true, message: "请输入邮箱", trigger: "blur" },
            {validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            { required: true, message: "请输入手机号", trigger: "blur" },
            {validator:checkMobile,trigger:'blur'}
          ]
        },
        editDialogVisible:false, //控制显示隐藏修改用户对话框
        // 点击修改应该查询到的用户信息
        editForm:{},
        // 修改用户的验证规则
        editFormRules:{
         email:[
            { required: true, message: "请输入邮箱", trigger: "blur" },
            { validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            { required: true, message: "请输入手机号", trigger: "blur" },
            { validator:checkMobile,trigger:'blur'}
          ]
        },
        //控制分配角色对话框的显示和隐藏
        setRoleDialogVisible:false,
        // 当前点击分配角色的用户信息
        userInfo:{},
        //当前被点击分配角色的用户的当前角色
        nowRoles:"",
        //所有角色的数据列表
        rolesList:[],
        // 点击分配角色，被选中的id
        selectedRoleId:""
    };
  },
  created(){
    this.getUserList()

  },
  components: {
    
  },
  
  methods: {
      //获取用户列表
      async getUserList(){
        const {data:res} = await this.$axios.get('users',{params:this.queryInfo})
        if(res.meta.status !== 200) return this.$message.error('获取用户列表失败');
        // console.log('获取用户列表',res)
        this.userList=res.data.users
        this.total=res.data.total
      },
      //每页显示多少条
      handleSizeChange(newSize){
        this.queryInfo.pagesize=newSize
        this.getUserList()
        console.log('每页多少条',this.queryInfo.pagesize)
      },
      //选择页数
      handleCurrentChange(newPage){
        this.queryInfo.pagenum=newPage
        console.log('选择第几页',this.queryInfo.pagenum)
        this.getUserList()
      },
      //把改变的状态传给后台
      async userStateChanged(userInfo){
        const {data:res}=await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        // const {data:res}=await this.$axios.put('users/'+userInfo.id+'/state/'+userInfo.mg_state)
        // console.log(res)
        if(res.meta.status !==200) {
          userInfo.mg_state=!userInfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      },
      //关闭添加用户对话框以后清空
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
        // console.log(this.$refs)
      },
      //点击添加新用户的确定按钮
      addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          if(!valid) return
          const {data:res}=await this.$axios.post('users',this.addForm)
          if(res.meta.status !==201) return this.$message.error('添加用户失败')
          this.addDialogVisible=false
          this.$message.success('添加用户成功') 
          // console.log(res)
          this.getUserList() //重新获取用户列表
       })
      },
      //展示修改用户的对话框(要查询数据放进对话框)
      async showEditDialog(id){
        const{ data:res }=await this.$axios.get('users/'+id)
        if(res.meta.status !== 200 ) return this.$message.error('查询用户信息失败')
        this.editForm = res.data
        this.editDialogVisible = true;
        // console.log(this.editForm)
      },
      // 修改用户对话框关闭时候里面数据还原
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      // 点击修改的确定按钮
      editUserInfo(){
        this.$refs.editFormRef.validate(async valid=>{
          if(!valid) return
          // 发起修改请求
          const {data:res}=await this.$axios.put('users/'+this.editForm.id,
          { email : this.editForm.email, mobile : this.editForm.mobile})
          if(res.meta.status !==200) return this.$message.error('修改用户信息失败')
          this.editDialogVisible=false
          this.$message.success('修改用户信息成功') 
          // console.log('修改用户',res)
          this.getUserList() //重新获取用户列表
       })
      },
      //点击删除（根据id删除用户）
      removeUserById(id){
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          const {data:res}=await this.$axios.delete('users/'+id)
          if(res.meta.status !== 200) return this.$message.error('删除用户失败')
          /*
          需求：我有5条数据，每页显示2条，一共3页。
                我删除最后一条，就只有4条了，应该马上跳到第二页。因为当前第3页已经没有自己的数据了。
          1、先算出删除数据以后的总页数  总页数=(当前页数-删掉的1条  除以 每页显示的数量) 
             总页数=（5-1)/2 结果是2爷。
              假如我有4条数据，我删了一条就只有3条了，但是我每页显示2条，
             （4-1）/2是1.5页，数据肯定要显示2页啊！所以要向上取整。
          2、如果当前页数 > 总页数，显示总页数。不然就显示当前页数  
          3、如果当前页数 < 1 ,就显示第一页。不然就显示当前页数
          total 总页数  this.queryInfo.pagenum代表当前页数  this.queryInfo.pagesize代表每页显示多少
          */
         console.log('当前页数',this.queryInfo.pagenum)
          const total = Math.ceil((this.total-1) / this.queryInfo.pagesize)
          this.queryInfo.pagenum = this.queryInfo.pagenum > total ? total : this.queryInfo.pagenum
          this.queryInfo.pagenum = this.queryInfo.pagenum  < 1 ? 1 :this.queryInfo.pagenum
          console.log('总页数',total)
          this.$message.success('删除用户成功')

          this.getUserList() //重新获取用户列表
        }).catch(() => {
          this.$message.info('取消删除')       
        });
      },
      //点击分配角色按钮
      async setRole(row){
        //当前被点击的用户。
        this.userInfo=row
        //
        this.nowRoles=row.role_name
        this.selectedRoleId=this.nowRoles
        console.log('我被点击了',row)
        //获取所有的角色列表
        const {data:res} = await this.$axios.get('roles')
        if(res.meta.status!==200) return this.$message.error('获取角色列表失败')
        this.rolesList=res.data
        console.log('所有角色',this.rolesList)
        this.setRoleDialogVisible=true
      },
      // 点击分配角色的确认按钮
      async saveRoleInfo(){
        if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
        const {data:res} = await this.$axios.put('users/'+this.userInfo.id+'/role',{rid:this.selectedRoleId})
        if(res.meta.status!==200) return this.$message.error('分配角色失败')
        this.$message.success('分配角色成功')
        console.log('分配角色成功',res)
        this.getUserList()
        this.setRoleDialogVisible=false
      },
      // 清空分配角色下拉框
      setRoleDialogClosed(){
        this.selectedRoleId=""
        this.userInfo={}
      }
  },
};
</script>
<style lang="less" scoped>
.el-table{
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination{
  margin-top: 15px;
}
/deep/.el-select{
  width: 100%;
}
</style>