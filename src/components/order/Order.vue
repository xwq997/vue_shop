<!-- 订单 -->
<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表 -->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{
            scope.row.create_time | dateFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
               <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox(scope.row.order_id)"
            ></el-button>
            <!-- 查看物流 -->
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgress(scope.row.order_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[3, 5, 7, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址的对话框 -->
    <el-dialog
  title="修改地址"
  :visible.sync="addressVisible"
  width="50%"
  @close="addressDialogClosed"
  >
  <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" >
  <el-form-item label="省市区/县" prop="addressCity">
     <el-cascader
        size="large"
        :options="options"
        :props="{ expandTrigger: 'hover' }"
        v-model="addressForm.addressCity"
        @change="handleChange"
      >
      </el-cascader>
  </el-form-item>
  <el-form-item label="详细地址" prop="addressDetail">
    <el-input v-model="addressForm.addressDetail"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
</el-dialog>
<!-- 查看物流的对话框 -->
<el-dialog
  title="物流信息"
  :visible.sync="ProgressVisible"
  width="50%"
  >
  <!-- 时间线 -->
   <el-timeline >
    <el-timeline-item
      v-for="(item, index) in progressInfo"
      :key="index"
      :timestamp="item.time">
      {{item.context}}
    </el-timeline-item>
  </el-timeline>
  
</el-dialog>
  </div>
</template>

<script>
import { regionData } from 'element-china-area-data'
export default {
  data() {
    return {
      // 给后台发送的获取页面信息的数据
      queryInfo: {
        query: "", //查询数据
        pagenum: 1, //当前页数
        pagesize: 10, //一页显示多少
      },
      // 总条数
      total: 0,
      // 商品数据
      orderList: [],
    //   控制修改地址对话框的显示隐藏
    addressVisible:false,
    // 修改地址的表单
    addressForm:{
        addressCity:[],
        addressDetail:""
    },
    // 修改地址的验证规则
    addressFormRules:{
        addressCity:[
            { required: true, message: '请选择地址', trigger: 'blur' }
        ],
        addressDetail:[
            { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
    },
    // 省市区三级联动
    options: regionData,
    // 查看物流的对话框
    ProgressVisible:false,
    // 物流信息
    progressInfo:[
    {
      "time": "2018-05-10 09:39:00",
      "ftime": "2018-05-10 09:39:00",
      "context": "已签收,感谢使用顺丰,期待再次为您服务",
      "location": ""
    },
    {
      "time": "2018-05-10 08:23:00",
      "ftime": "2018-05-10 08:23:00",
      "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
      "location": ""
    },
    {
      "time": "2018-05-10 07:32:00",
      "ftime": "2018-05-10 07:32:00",
      "context": "快件到达 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-10 02:03:00",
      "ftime": "2018-05-10 02:03:00",
      "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-09 23:05:00",
      "ftime": "2018-05-09 23:05:00",
      "context": "快件到达 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 21:21:00",
      "ftime": "2018-05-09 21:21:00",
      "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 13:07:00",
      "ftime": "2018-05-09 13:07:00",
      "context": "顺丰速运 已收取快件",
      "location": ""
    },
    {
      "time": "2018-05-09 12:25:03",
      "ftime": "2018-05-09 12:25:03",
      "context": "卖家发货",
      "location": ""
    },
    {
      "time": "2018-05-09 12:22:24",
      "ftime": "2018-05-09 12:22:24",
      "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
      "location": ""
    },
    {
      "time": "2018-05-08 21:36:04",
      "ftime": "2018-05-08 21:36:04",
      "context": "商品已经下单",
      "location": ""
    }
    ],
    };
  },

  created() {
    this.getOrderList();
  },

  methods: {
    async getOrderList() {
      const { data: res } = await this.$axios.get("orders", {
        params: this.queryInfo,
      });
      console.log("订单列表", res);
      if (res.meta.status !== 200)
        return this.$message.error("获取订单列表失败");
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    // 每页显示多少条
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 当前是第几页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 修改地址
    showBox(id) {
        this.addressVisible=true
    },
    // 选择省市区
    handleChange (value) {
        console.log(value)
    },
    // 清空修改地址的对话框
    addressDialogClosed(){
        this.$refs.addressFormRef.resetFields()
    },
    // 查看物流
     showProgress(id){
        this.ProgressVisible=true
    }
    // 随便修改
  },
};
</script>
<style scoped>
.el-table {
  margin-top: 20px;
}
.el-cascader{
    width: 100%;
}
</style>