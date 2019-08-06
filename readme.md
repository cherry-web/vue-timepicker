# vue-drag-timepicker 可拖拽时间区间选择器

> 用于选择时间区间，可拓展可点击

![demo](https://gitee.com/zhkumsg/vue-drag-timepicker/raw/master/examples/demo.png)


## Installation

```bash
$ npm install vue-drag-timepicker
```

## Example

```js
import VueDragTimepicker from 'vue-drag-timepicker';
// import {VueDragTimepicker} from 'vue-drag-timepicker';
Vue.use(VueDragTimepicker);
```

```xml
<vue-drag-timepicker v-model="value" />
```

## Attributes

|     参数      |       说明       |   类型   |
| :-----------: | :--------------: | :------: |
| value/v-model | 所选择的时间区间 |  String  |
|    change     |  内容变化时触发  | Function |

_`value`为`24x2x7`的字符串，意思为已半小时为一个区间，一天共 48 区间，一周有 7x48 个区间，其中`0`代表未选中，`1`代表已选中_

## Events

-   `change` 内容变化时触发
