<!-- 添加商品 -->
<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="Number(activeIndex)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 下面表格整体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 左侧标签页 :before-leave="beforeTabLeave" -->
        <el-tabs
          v-model="activeIndex"
          tabPosition="left"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数tab -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item2"
                  v-for="(item2, index2) in item.attr_vals"
                  :key="index2"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性tab -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 上传图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="headerObj"
              action="http://www.ysqorz.top:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单
      addForm: {
        goods_name: "", //名字
        goods_price: 1, //价格
        goods_weight: 2, //重量
        goods_number: 3, //数量
        goods_cat: [], //商品所在的分类数组
        pics: [], // 上传图片的数组
        goods_introduce: "", //商品介绍
        attrs: [], //商品的动态静态参数
      },
      // 添加的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      // 商品分类的数据
      cateList: [],
      //  商品参数页面的数据
      manyTableData: [],
      //  商品属性页面的数据
      onlyTableData: [],
      // 上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 预览的图片地址
      previewPath: "",
      // 预览图片的对话框的显示和隐藏
      previewVisible: false,
      // 深拷贝需要传给后台的addForm
      form: null,
    };
  },

  created() {
    this.getCateList();
  },
  computed: {
    //   计算选中的3级id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
  methods: {
    //   获取商品分类
    async getCateList() {
      const { data: res } = await this.$axios.get("categories");
      if (res.meta.status !== 200) return this.$message.error("获取分类失败");
      this.cateList = res.data;
      //   console.log(this.cateList)
    },
    //   选中的级联选择器
    handleChange() {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return this.$message.info("请选择三级分类");
      }
    },
    // 用户如果未输入基本信息，不允许切换其他标签页
    rulesToggleTab() {
      let result = new Promise((resolve, reject) => {
        this.$refs.addFormRules.validata(async (valid) => {
          valid ? resolve() : reject();
        });
      });
      return result;
    },
    async beforeTabLeave() {
      this.$message.error("请输入信息");
      return await this.rulesToggleTab();
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$axios.get(
          "categories/" + this.cateId + "/attributes",
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取商品参数失败");
        res.data.forEach((item) => {
          if (item.attr_vals.length == 0) {
            return (item.attr_vals = []);
          } else {
            item.attr_vals = item.attr_vals.split(" ");
          }
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$axios.get(
          "categories/" + this.cateId + "/attributes",
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取商品属性失败");
        this.onlyTableData = res.data;
        //  console.log(this.onlyTableData)
      }
    },
    // 预览图片
    handlePreview(file) {
      console.log(file);
      const userPath = "http://www.ysqorz.top:8888/";
      this.previewPath = userPath + file.response.data.tmp_path;
      this.previewVisible = true;
    },
    // 图片上传成功
    handleSuccess(res) {
      // 1、拼接图片信息
      const picInfo = { pic: res.data.tmp_path };
      // 2、将图片信息push到pics数组里面
      this.addForm.pics.push(picInfo);
    },
    // 移除图片
    handleRemove(file) {
      //1、获取要删除的图片临时路径
      const filePath = file.response.data.tmp_path;
      // 2、通过findIndex查找符合条件的下标
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 3、通过splice从pics数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 添加商品
    add() {
      // 处理校验
      this.$refs.addFormRef.validate(async(valid) => {
        if (!valid) {
          return this.$message.error("请填写必填项");
        }
        //  处理静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理动态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        // 调用深拷贝赋值给form  form=addForm
        this.form = this.deepClone(this.addForm);
        this.form.goods_cat = this.form.goods_cat.join(",");
        // 提交给后台
        const{data:res}=await this.$axios.post('goods',this.form)
        if(res.meta.status!==201) return this.$message.error('添加失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      });
    },
    // 深拷贝addForm
    deepClone(old) {
      let newData = null;
      if (typeof old == "object" && old !== null) {
        newData = old instanceof Array ? [] : {};
        for (let i in old) {
          newData[i] = this.deepClone(old[i]);
        }
      } else {
        newData = old;
      }
      return newData;
    },
  },
};
</script>
<style lang='less' scoped>
.el-steps {
  margin: 15px 0;
}
/deep/ .el-step__title {
  font-size: 13px;
}
/deep/ .el-checkbox {
  margin-left: 10px;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 20px;
}
</style>