import Vue from 'vue';
// import ElementUI from 'element-ui';
import { 
  Button,
  Row,
  Col,
  Input,
  Icon,
  Message,
  MessageBox,
  Form,
  FormItem,
  Loading,
} from 'element-ui';

Vue.prototype.$ELEMENT = {
  size: 'small',
  zIndex: 19999,
};

Vue.use(Row);
Vue.use(Col);
Vue.use(Loading);
Vue.use(Button);
Vue.use(Input);
Vue.use(Icon);
Vue.component(Message.name, Message);
Vue.component(MessageBox.name, MessageBox);
Vue.use(Form);
Vue.use(FormItem);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
// Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;