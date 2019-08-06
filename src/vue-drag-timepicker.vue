<template>
  <div class="time-select">
    <table ref="table">
      <tr>
        <th rowspan="2" class="label">星期/时间</th>
        <th colspan="24">00:00 - 12:00</th>
        <th colspan="24">12:00 - 24:00</th>
      </tr>
      <tr>
        <td v-for="(item,index) in 24" :key="index" colspan="2">{{index}}</td>
      </tr>
      <tr v-for="(item,index) in weeks" :key="index">
        <td class="label">{{item}}</td>
        <td v-for="(t,tindex) in 48" :key="'t'+tindex" class="time" :class="{active:selected[tindex + index*48]===1}" @click="handleClick(tindex + index*48)" :data-index="tindex + index*48">
          <!-- <jh-popover placement="top" trigger="hover" :open-delay="450" v-model="visibles[tindex + index*48]">
            <div slot="reference" @click="visibles[tindex + index*48]=!visibles[tindex + index*48]" style="width:10px;height:22px;outline:none;"></div>
            <div style="text-align:center;color:gray;font-size:12px;">{{getPopoverTitle(index,tindex)}}</div>
          </jh-popover> -->
        </td>
      </tr>
    </table>
    <div class="options" style="position:relative;">
      <span class="span-btn" style="color:#999999;">{{isselect?'已选择时间段':'可拖动鼠标选择时间段'}}</span>
      <span class="span-btn" @click="removeAll()" style="position:absolute;right:0;" v-if="isselect">清空选择</span>
    </div>
    <div v-if="isselect" class="tips">
      <div v-for="item in selectTimes" :key="item.week" class="item">
        <label>{{item.week}}：</label>
        <span>{{item.times.map(o=> o.from + '~' + o.to).join('、')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
// import { JhPopover } from 'jh-popover';
export default {
  components: {
    // JhPopover,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      weeks: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      ismoving: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      tablePosition: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      marker: document.createElement('div'),
      selected: [],
      visibles: [],
    }
  },
  computed: {
    isselect() {
      return this.selected.filter(o => o === 1).length > 0
    },
    selectTimes() {
      const list = [];
      const results = [];
      this.selected.forEach((item, index) => {
        if (item) {
          list.push(this.getPopoverTitle(Math.floor(index / 48), index % 48, true));
        }
      })
      list.forEach(item => {
        if (results.filter(o => o.week === item[0]).length === 0) {
          results.push({ week: item[0], times: [], raws: [] })
        }
        const index = results.findIndex(o => o.week === item[0]);
        results[index].raws.push({
          from: `${item[1]}:${item[2]}`,
          to: `${item[3]}:${item[4]}`
        });
      })
      results.forEach((item, index) => {
        for (let i = 0; i < item.raws.length; i++) {
          if (item.times.length === 0) {
            item.times.push({ from: item.raws[i].from, to: item.raws[i].to });
          } else if (item.raws[i].from === item.times[item.times.length - 1].to) {
            item.times[item.times.length - 1].to = item.raws[i].to;
          } else {
            item.times.push({ from: item.raws[i].from, to: item.raws[i].to });
          }
        }
      })
      return results;
    }
  },
  mounted() {
    this.marker.style.background = 'rgba(47,136,255,0.5)';
    this.marker.style.position = 'fixed';
    this.marker.style.zIndex = '9999';
    this.marker.style.top = '0';
    this.$refs.table.addEventListener('mousedown', e => { this.handleMouseDown(e); });
  },
  methods: {
    handleClick(index) {
      this.$set(this.selected, index, this.selected[index] === 1 ? 0 : 1)
      this.handleChange();
    },
    removeAll() {
      this.selected = this.selected.map(() => 0);
      this.handleChange();
    },
    handleMouseDown(e) {
      this.ismoving = true;
      this.startX = e.x;
      this.startY = e.y;
      this.endX = e.x;
      this.endY = e.y;
      this.marker.style.width = '0';
      this.marker.style.height = '0';
      this.marker.style.top = `${e.x}px`;
      this.marker.style.left = `${e.y}px`;
      document.body.appendChild(this.marker);
      const rects = this.$refs.table.getClientRects()[0];
      this.tablePosition.top = rects.top;
      this.tablePosition.left = rects.left;
      this.tablePosition.right = rects.right;
      this.tablePosition.bottom = rects.bottom;
      this.$refs.table.__handleMouseUp__ = e => { this.handleMouseUp(e); }
      this.$refs.table.__handleMouseMove__ = e => { this.handleMouseMove(e); }
      document.body.addEventListener('mouseup', this.$refs.table.__handleMouseUp__);
      document.body.addEventListener('mousemove', this.$refs.table.__handleMouseMove__);
    },
    handleMouseUp(e) {
      this.ismoving = false;
      try {
        this.marker.parentNode.removeChild(this.marker);
        document.body.removeEventListener('mouseup', this.$refs.table.__handleMouseUp__);
        document.body.removeEventListener('mousemove', this.$refs.table.__handleMouseMove__);
        this.handleDragSelect();
      } catch (err) {
        // todo
      }
    },
    handleMouseMove(e) {
      if (!this.ismoving) {
        return false;
      }
      this.endX = e.x;
      this.endY = e.y;
      const isoverflow = e.x <= this.tablePosition.left || e.x >= this.tablePosition.right || e.y <= this.tablePosition.top || e.y >= this.tablePosition.bottom;
      if (isoverflow) {
        this.handleMouseUp(e);
        return false;
      }
      const width = Math.abs(this.startX - this.endX);
      const height = Math.abs(this.startY - this.endY);
      this.marker.style.width = `${width}px`;
      this.marker.style.height = `${height}px`;
      if (this.startX < this.endX) {
        this.marker.style.left = `${this.startX}px`;
      } else {
        this.marker.style.left = `${this.endX}px`;
      }
      if (this.startY < this.endY) {
        this.marker.style.top = `${this.startY}px`;
      } else {
        this.marker.style.top = `${this.endY}px`;
      }
    },
    handleDragSelect() {
      const startX = Math.min(this.startX, this.endX);
      const endX = Math.max(this.startX, this.endX);
      const startY = Math.min(this.startY, this.endY);
      const endY = Math.max(this.startY, this.endY);
      const shouldClickIndex = [];
      this.$refs.table.querySelectorAll('td.time').forEach((node, index) => {
        const rects = node.getClientRects()[0];
        // 左上角是否进入
        const ltIsCover = rects.right < endX && rects.bottom < endY && rects.right > startX && rects.bottom > startY;
        // 右下角是否进入
        const rbpIsCover = rects.left < endX && rects.top < endY && rects.left > startX && rects.top > startY;
        // 右上角是否进入
        const rtIsCover = rects.left < endX && rects.bottom < endY && rects.left > startX && rects.bottom > startY;
        // 左下角是否进入
        const lbIsCover = rects.right < endX && rects.top > startY && rects.right > startX && rects.top < endY;
        // 左边是否交叉
        const leftIsCover = rects.left > startX && rects.left < endX && rects.top < startY && rects.bottom > endY;
        // 右边是否交叉
        const rightIsCover = rects.right > startX && rects.right < endX && rects.top < startY && rects.bottom > endY;
        // 上边是否交叉
        const topIsCover = rects.top > startY && rects.top < endY && rects.left < startX && rects.right > endX;
        // 下边是否交叉
        const bottomIsCover = rects.bottom > startY && rects.bottom < endY && rects.left < startX && rects.right > endX;
        const isCover = ltIsCover || rbpIsCover || rtIsCover || lbIsCover || leftIsCover || rightIsCover || topIsCover || bottomIsCover;
        if (isCover) {
          shouldClickIndex.push(index);
        }
      });
      shouldClickIndex.forEach(item => {
        this.$set(this.selected, item, this.selected[item] === 1 ? 0 : 1);
      });
      this.handleChange();
    },
    handleChange() {
      this.$emit('change', this.selected.join(''));
    },
    getPopoverTitle(index, tindex, isarr) {
      let hour1 = Number.parseInt(tindex / 2, 10);
      let hour2 = hour1;
      let ext1 = '';
      let ext2 = '';
      if (hour1 === tindex / 2) {
        ext1 = "00";
        ext2 = "30";
      } else {
        hour2 = hour2 + 1;
        ext1 = "30";
        ext2 = "00";
      }
      hour1 = hour1 < 10 ? '0' + hour1 : '' + hour1;
      hour2 = hour2 < 10 ? '0' + hour2 : '' + hour2
      if (isarr) {
        return [this.weeks[index], hour1, ext1, hour2, ext2]
      } else {
        return `${this.weeks[index]}  ${hour1}:${ext1} - ${hour2}:${ext2}`
      }

    }
  },
  watch: {
    value: {
      handler() {
        const num = 48 * 7;
        this.selected = (this.value || '').split('').map(o => Number.parseInt(o) === 1 ? 1 : 0).slice(0, num);
        while (this.selected.length < num) {
          this.selected.push(0);
        }
        for (let i = 0; i < num; i++) {
          this.visibles[i] = false;
        }
      },
      immediate: true
    }
  }
}
</script>


<style lang="less" scoped>
.time-select {
  display: inline-block;
  max-width: 700px;
  table {
    font-family: PingFangSC-Regular, tahoma, arial, 'Hiragino Sans GB',
      'Microsoft yahei', sans-serif;
    text-align: center;
    border-collapse: collapse;
    font-size: 12px;
    color: #333333;
    user-select: none;
    th,
    td {
      border: 1px solid #dee4f5;
      line-height: 1.8em;
    }
    .label {
      padding: 0 5px;
    }
    .time {
      width: 10px;
      height: 22px;
      background: #f5f5f5;
      &.active {
        background: #2f88ff;
      }
    }
  }
  .tips {
    font-size: 12px;
    color: #999;
    .item {
      display: flex;
      align-items: center;
      line-height: 20px;
      margin-top: 3px;
      label {
        flex: none;
        padding-right: 5px;
      }
      span {
        flex: 1;
        color: #333;
      }
    }
  }
  .span-btn {
    color: #409eff;
    font-size: 12px;
    cursor: pointer;
    padding: 7px 0;
    display: inline-block;
  }
}
</style>


