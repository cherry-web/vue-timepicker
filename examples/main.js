import App from './App.vue';

import VueDragTimepicker from '../src/index';
Vue.use(VueDragTimepicker);

new Vue({
	el: '#app',
	components: { App },
	template: '<App/>',
});
