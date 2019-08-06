<template>
  <div style="margin:10px;">
    <vue-drag-timepicker v-model="value" @change="handleChange" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: ''
    };
  },
  methods: {
    handleChange(val) {
      console.log(val);
    }
  },
};
</script>

<style lang="less" scoped>
</style>
