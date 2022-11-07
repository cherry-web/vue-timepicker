<template>
  <div style="margin:10px;">
    <vue-drag-timepicker v-model="value" :thData="thData" @change="handleChange" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      // value为24x2x7的字符串，意思为已半小时为一个区间，一天共 48 区间，一周有 7x48 个区间
      // 其中0代表未选中，1代表已选中
      value: '01111011',
      // table 表头
      thData: ['任务']
    };
  },
  methods: {
    // change 内容变化时触发
    handleChange(val) {
    }
  },
};
</script>

<style lang="less" scoped>
</style>
