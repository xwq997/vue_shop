<!--商品分类页面  -->
<template>
  <div>
       <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 添加按钮 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
    <!-- 表格 -->
    <tree-table class="treeTable" :data="cateList" :columns="columns" 
    :selection-type="false" :expand-type="false"
    show-index index-text="" border>
    <!-- 是否有效 -->
    <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted===false"></i>
        <i class="el-icon-error" v-else></i>
    </template>
    <!-- 排序 -->
    <template slot="order" slot-scope="scope">
        <el-tag size="mini"  v-if="scope.row.cat_level==0">一级</el-tag>
        <el-tag size="mini" type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
        <el-tag size="mini" type="warning" v-else>三级</el-tag>
    </template>
    <!-- 操作 -->
    <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="edit(scope)">删除</el-button>
    </template>
    </tree-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3,5,10,15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%"
    @close="addCateDialogClosed"
    >
     <!-- 添加分类的表单 -->
    <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
            <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children',checkStrictly: 'true' }"
            @change="parentCateChanged" clearable>
            </el-cascader>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
        // 商品分类的数据列表（就是商品名字之类的）
        cateList:[],
        // 获取分类数据需要给后台传递的数据
        querInfo:{
            type:3,   //一共获取多少级
            pagenum:1,  //当前是第几页
            pagesize:5  //每页显示数量
        },
        // 总数据条数
        total:0,
        // 为树形表格指定列
        columns:[
            {
                label:"分类名称",
                prop:"cat_name"
            },
            {
                label:"是否有效",
                type:"template", //设置为自定义模板列
                template:"isok"  //这一列使用的模板名称
            },
            {
                label:"排序",
                type:"template", //设置为自定义模板列
                template:"order"  //这一列使用的模板名称
            },
            {
                label:"操作",
                type:"template", //设置为自定义模板列
                template:"opt"  //这一列使用的模板名称
            }
        ],
        // 添加分类的对话框的显示隐藏
        addCateDialogVisible:false,
        //添加分类的表单
        addCateForm:{
            cat_name:"", //分类名称
            cat_pid:0,  //父级分类的id 
            cat_level:0  //分类等级，默认添加1级分类
        },
        // 添加分类表单的验证规则
        addCateFormRules:{
            cat_name:[{
                required: true, message: '请输入分类名称', trigger: 'blur'
            }]
        },
        // 父级分类的列表
        parentCateList:[],
        //级联选中的父级id
        selectedKeys:[]
    }
  },

  created(){
      this.getCateList()
  },


  methods: {
      async getCateList(){
        const {data:res} = await this.$axios.get('categories',{params:this.querInfo})
        // console.log('获取商品分类列表数据',res)
        if(res.meta.status!==200) return this.$message.error('获取商品分类失败')
        // console.log(res.data)
        //把从后台接收到的数据，赋值给cateList商品列表
        this.cateList = res.data.result
        // 赋值总数量
        this.total=res.data.total
      },
    //   每页显示多少条(不用传实参，饿了么自动传) 
    handleSizeChange(newSize){
        this.querInfo.pagesize=newSize
        this.getCateList()
    },
    // 页数的改变
    handleCurrentChange(newPage){
        this.querInfo.pagenum=newPage
        this.getCateList()
    },
    // 点击添加按钮
    showAddCateDialog(){
        this.getParentCateList()
        this.addCateDialogVisible=true
        
    },
    // 获取父级分类的数据列表
    async getParentCateList(){
        const {data:res} = await this.$axios.get('categories',{params:{type:2}})
        console.log('获取商品分类列表数据',res)
        if(res.meta.status!==200) return this.$message.error('获取父级分类失败')
        this.parentCateList=res.data
        
    },
    // 选择发生变化
    parentCateChanged(){
        //如果selectedKeys 数组中的长度>0,证明他是二级或者3级，他的父级就是1级
        //  或者2级。是数组的最后一个。
        //如果=0，就说明他自己是1级
        // 0就是一级，1就是2级，和下标一样。
        if(this.selectedKeys.length>0){
            // 父级id
            this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
            //为当前分类的等级赋值
            this.addCateForm.cat_level=this.selectedKeys.length
            return
        }else{
             this.addCateForm.cat_pid=0
            //为当前分类的等级赋值
             this.addCateForm.cat_level=0
        }
    },
    // 点击确认添加新的分类
    addCate(){
        // 验证
        this.$refs.addCateFormRef.validate( async valid=>{
            if(!valid) return
            const {data:res}=await this.$axios.post('categories',this.addCateForm)
            // console.log(res)
            if(res.meta.status!==201) return this.$message.error('添加分类失败')
            this.$message.success('添加分类成功')
            this.getCateList()
            this.addCateDialogVisible=false
        })
    },
    // 关闭添加对话框，清空
    addCateDialogClosed(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys=[]
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
    }
  }
}

</script>
<style lang="less" scoped>
.el-icon-success{
    color:lightgreen
}
.el-icon-error{
    color:red
}
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>