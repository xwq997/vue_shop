<!-- 角色列表 -->
<template>
  <div>
      <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
        <!-- 添加角色 -->
        <el-row>
            <el-col>
                <el-button type="primary">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表 -->
        <el-table :data="rolesList" border stripe>
            <!-- 展开 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id" :class="['bdbottom','vcenter',index1==0?'bdtop':'']">
                        <!-- 一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col >
                        <!-- 二级和三级权限 -->
                        <el-col :span="19">
                            <el-row v-for="(item2,index2) in item1.children" :key="item2.id" :class="['vcenter',index2==0?'':'bdtop']">
                              <!-- 二级 -->
                              <el-col :span="6">
                                  <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                  <i class="el-icon-caret-right"></i>
                              </el-col>
                              <!-- 三级 -->
                              <el-col :span="13">
                                  <el-tag type="warning" closable v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                              </el-col>
                          </el-row> 
                        </el-col>
                    </el-row> 
                </template>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column type='index'></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="350px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mine" @click="edit(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mine">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mine" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="50%" >
    <!-- 树形控件 -->
    <el-tree :data="rightsList" :props="treeProps" show-checkbox 
    node-key="id" default-expand-all
    :default-checked-keys="defKeys" ref='treeRef'
    >
    </el-tree>
    <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
        // 所有角色列表数据
        rolesList:[],
        // 分配角色对话框的显示隐藏
        setRightDialogVisible:false,
        //所有权限的数据
        rightsList:[],
        // 树形
        treeProps:{
            label:'authName',
            children:'children'
        },
        // 默认树形选中的数组
        defKeys:[],
        //当前分配权限的id
        roleId:""
    }
  },

  created() {
      this.getRolesList()
  },

  methods: {
    //   获取所有角色
     async getRolesList(){
        const {data:res}=await this.$axios.get('roles')
        if(res.meta.status !== 200 ) return this.$message.error('获取角色列表失败')
        this.rolesList=res.data
        console.log('获取角色',this.rolesList)
      },

    //   点击删除权限
     removeRightById(row,rightId){
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
            const{data:res}=await this.$axios.delete('roles/'+row.id+'/rights/'+rightId)
            // console.log('删除3级权限',res)
            if(res.meta.status == !200) return  this.$message.error('删除权限失败')
            row.children=res.data
            this.$message.success('删除成功')
        }).catch(() => {
            this.$message.info('取消删除')      
        });
    },
    //点击分配权限
    async showSetRightDialog(row){
        //拿到当前被选择id
        this.roleId=row.id
        //清空3级节点数组
        this.defKeys=[] //不清空的话，每次都在往里面加id
        //获取所有权限数据
        const { data: res } = await this.$axios.get("rights/tree");
        if (res.meta.status !== 200) return this.$message.error("获取权限数据失败");
        this.rightsList = res.data;
        // console.log('权限数据',this.rightsList)
        
        // 获取新的3级节点的数组
        this.getTreeKeys(row,this.defKeys)
        this.setRightDialogVisible=true
    },
    
    // // 获取角色下所有三级权限的id
    getTreeKeys(node,arr){
        //如果当前节点没有children属性，就是3级节点（返回的只有3级，只有最后没有children）
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item => {
            this.getTreeKeys(item,arr)
        });
    },
    // 点击分配权限的确定按钮
    async allotRights(){
        const keys=[
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
        const idStr = keys.join(',')
        const {data:res}=await this.$axios.post('roles/'+this.roleId+'/rights',{rids:idStr})
        // const {data:res}=await this.$axios.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status!==200) return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible=false
        
        console.log(res)
    }
    
    
  }
}

</script>
<style lang="less" scoped>
.el-tag{
    margin: 10px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>