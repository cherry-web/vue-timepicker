<template>
<!-- 工时选择器 -->
  <div class="time-select">
    <table ref="table">
      <tr>
        <th rowspan="2" class="label" v-for="(val, thIndex) in thData" :key="thIndex">{{val}}</th>
        <th colspan="24">00:00 - 12:00</th>
        <th colspan="24">12:00 - 24:00</th>
      </tr>
      <tr>
        <td v-for="(item,index) in 24" :key="index" colspan="2">{{index}}</td>
      </tr>
      <tr v-for="(item,index) in weeks" :key="index" class="selectAxea">
        <td class="label">{{item}}</td>
        <td v-for="(t,tindex) in 48" :key="'t'+tindex" class="time" :class="{active:selected[tindex + index*48]===1}" @click="handleClick(tindex + index*48)" :data-index="tindex + index*48">
          <div :class="'timeDiv cls' + (tindex + index*48)"></div>
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
    },
    thData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      weeks: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      addRowArr: [],
      arrayData: [],
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
    // 是否选中(1选中，0未选中)
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
    // 鼠标框选div,设置css
    this.marker.style.background = 'rgba(47,136,255,0.5)';
    this.marker.style.position = 'fixed';
    this.marker.style.zIndex = '9999';
    this.marker.style.top = '0';
    this.$refs.table.addEventListener('mousedown', e => { this.handleMouseDown(e); });
    this.disTdFn()
  },
  methods: {
    getNum(list, thatEl) {
      let el = thatEl;
      let thisList = list;
      let lastVal;
      let lastIndex;
      return thisList.reduce((res, item, index) => {
        if (item === el) {
          if (lastVal === el) {
            res[lastIndex]++;
          } else {
            lastIndex = index;
            res[lastIndex] = 1;
          }
        }
        lastVal = item;
        return res;
      }, {})
    },
    handleClick(index) {
      // this.$set(this.selected, index, this.selected[index] === 1 ? 0 : 1)
      this.handleChange();
    },
    removeAll() {
      this.selected = this.selected.map(() => 0);
      this.handleChange();
    },
    // 鼠标点击
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
    // 鼠标点击释放
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
    // 鼠标移动
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
    // td是否被选中
    handleDragSelect() {
      const startX = Math.min(this.startX, this.endX);
      const endX = Math.max(this.startX, this.endX);
      const startY = Math.min(this.startY, this.endY);
      const endY = Math.max(this.startY, this.endY);
      const shouldClickIndex = [];
      this.$refs.table.querySelectorAll('td.time').forEach((node, index) => {
        const rects = node.getClientRects()[0];
        // 框选td底部判断
        const bottomData = (rects.bottom >startY && rects.bottom < endY) || (rects.bottom >startY && rects.bottom > endY)
        // 框选左上角在td内
        const rightBottomArea = rects.right < endX && rects.right > startX && rects.top < startY && rects.top < endY && bottomData
        // 框选右上角在td内/框选上边横过贯穿td
        const leftBottomArea = rects.left < endX && rects.left > startX && rects.top < startY && rects.top < endY && bottomData
        // 框选在td内
        const rightTopArea = rects.left < startX && rects.right > endX && rects.top < startY && rects.top < endY && bottomData

        // 框选
        const isCover = rightBottomArea || leftBottomArea || rightTopArea
        if (isCover) {
          shouldClickIndex.push(index);
        }
      });
      shouldClickIndex.forEach(item => {
        const tdColor = this.$refs.table.querySelector('.cls' + item).parentNode.getAttribute('class')
        if(tdColor.indexOf('tdColor') === -1){
          this.$set(this.selected, item, this.selected[item] === 1 ? 0 : 1);
        }
      });
      this.handleChange();
    },
    handleChange() {
      this.$emit('change', this.selected.join(''));
    },
    disTdFn() {
      const _this = this
      const selectData = this.getNum(this.selected, 1)
      this.addRowArr = Object.entries(selectData);
      let X = 0
      let Y = 0
      let Z = 0
      let P = 0
      let d = []
      if (this.addRowArr.length > 0) {
        this.addRowArr.forEach((val, index) => {
          this.weeks.forEach((leng, indexW) => {
            // 向下
            X = Number(val[0]) + (48  * (indexW + 1)) // 第一个td下标
            Y = X + Number(val[1]) - 1 // 最后一个被选中td下标
            // 向上
            Z = Number(val[0]) - (48  * (indexW + 1)) < 0 ? -1 : Number(val[0]) - (48  * (indexW + 1))
            P = Z < 0 ? -1 : Z + Number(val[1]) - 1
            let o = []
            let c = []
            if (X < this.selected.length) {
              if (X < Y) {
                o.push(X)
                o.push(Y)
              }else{
                // X=Y
                o.push(X)
                o.push(Y)
              }
            }
            if (Z > -1) {
              c.push(Z)
              c.push(P)
            }
            if(o.length > 0){
              d.push(o)
            }
            if(c.length > 0){
              d.push(c)
            }
          })
        })
      }
      this.arrayData = []
      if(d.length > 0){
        d.forEach((value)=>{
          for(let j = value[0];j<value[1]+1;j++){
            this.arrayData.push(j)
            // this.selected[j] = 0
          }
        })
        for(var i = 0;i < this.selected.length;i++) {
          if(this.arrayData.indexOf(i) !== -1){
            this.$refs.table.querySelector('.cls' + i).parentNode.classList.add('tdColor')
          }else{
            this.$refs.table.querySelector('.cls' + i).parentNode.classList.remove('tdColor')
          }
        }
      } else {
        for(var i = 0;i < this.selected.length;i++) {
          this.$refs.table.querySelector('.cls' + i).parentNode.classList.remove('tdColor')
        }
      }
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
        const num = 48 * this.weeks.length;
        this.selected = (this.value || '').split('').map(o => Number.parseInt(o) === 1 ? 1 : 0).slice(0, num);
        while (this.selected.length < num) {
          this.selected.push(0);
        }
        for (let i = 0; i < num; i++) {
          this.visibles[i] = false;
        }
      },
      immediate: true
    },
    thData: {
      handler() {
        console.log(this.thData, 'thData')
      },
      immediate: true
    },
    selected: {
      handler(newValue) {
        this.disTdFn()
        return newValue
      },
      immediate: false,
      deep: true
    },
    arrayData: {
      handler(newValue) {
        return newValue
      },
      immediate: false,
      deep: true
    }
  }
}
</script>


<style lang="less" scoped>
.selectAxea .time.tdColor{
  background-color: #f5f5f5;
  cursor: no-drop;
}
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
      background: #fff;
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


