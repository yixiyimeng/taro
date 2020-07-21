import Taro, { Component, requirePlugin } from "@tarojs/taro";
import {
  View,
  Swiper,
  SwiperItem,
  Image,
  Picker,
  Text,
  Radio,
  RadioGroup
} from "@tarojs/components";
import "./payment.scss";
import {
  AtNavBar,
  AtDivider,
  AtInput,
  AtCheckbox,
  AtRadio,
  AtTextarea,
  AtButton,
  AtSteps
} from "taro-ui";
import axios from "axios";
import IconFont from "../../components/iconfont/index";

export default class Payment extends Taro.Component {

    /**
     * 解析微信redirect_uri地址中的code
     */
    getCodeFromUrl = (cur_url) => {
      let code = ''
      let index = cur_url.indexOf('?')
      let paramStr =cur_url.substring(index+1,cur_url.length);
      let params = paramStr.split('&')
      params.forEach(element => {
        if (element.indexOf('code') >= 0) {
          code = element.substring(element.indexOf('=')+1,element.length)
        }
      });
      return code
    }
  constructor() {
    super(...arguments);
    this.token = process.env.TOKEN;
    this.baseUrl = process.env.BASE_URL;
    this.state = {
      current: 1,
      payment_method: "WeChatPay",
      price: 0,
      openid:'12334'
    };
  }
  /* 获取openid*/
getOpenid(code){
  const api = 'http://pro1.pro-shield.cn/index.php/api/api/getOpenid?code='+code;
  axios
    .get(api, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })
    .then(res => {
       let openid=res.data.data.openid||'o-duz51mAJzr7i6Z_YmrRmcKXpZg'
               this.setState({
                     openid:openid
                })
               this.getjspackage(openid);
    })
    .catch(error => {
      console.log(`An error occurred when check the seat:  ${JSON.stringify(error)}`);
      Taro.showModal({title:"错误提示", content:"后台服务器错误，请联系工作人员",showCancel:false});
    });
}
/* 获取支付jspackage*/
getjspackage(openid){
  const api = 'http://pro1.pro-shield.cn/index.php/api/api/pay';
  console.log(this.state.openid)
  axios
    .post(api,{
        openid:openid,
        amount:this.state.price
      }, {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
    })
    .then(res => {
      console.log(res)
if(res.data.code==0){
  let data=res.data.data;
  let param={
    timeStamp:data.timeStamp,
    nonceStr:data.nonceStr,
    package:data.package,
    signType:data.signType,
    timeStamp:data.timeStamp,
    paySign:data.paySign
  }
 this.setState({
       jspackage:param
  })
  console.log(this.state)

}
    })
    .catch(error => {
      console.log(`An error occurred when check the seat:  ${JSON.stringify(error)}`);
      Taro.showModal({title:"错误提示", content:"后台服务器错误，请联系工作人员",showCancel:false});
    });
}
  onReturnClick() {
    Taro.redirectTo({
      url: "../index/index"
    });
  }

  handlePaymentMethodChange(value) {
    this.setState({
      payment_method: value
    });
  }

  btnOnClick() {
   console.log(this.state)
       Taro.requestPayment({
       ...this.state.jspackage,
         success: function (res) {

         },
         fail: function (res) { }
       })

  }

  componentWillMount() {
    this.setState({
      price: this.$router.params.price||0.01
    });
    //this.$router.params.code获取不到，原因见：https://www.jianshu.com/p/9282d33e3eeb
    //let code = this.$router.params.code
    let appid = 'wx3f9a218ca6657448' //公众号appId
    let cur_url = window.location.href
    let code='081uL0QM0QyrO72vKVQM0ko1QM0uL0Q-'
    this.getOpenid(code)
    return false
    console.log('redirect_uri: ' + cur_url)
    if (cur_url.indexOf('code') < 0){
      //当前地址不含code,则需要请求code,通过回调当前页面来返回code
      Taro.navigateTo({
        url: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(cur_url)}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`
      })
    } else {
      //解析地址的方式获取code
      let code = this.getCodeFromUrl(cur_url)
      //继续发送code至服务端获取openid
    }

  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: "完成支付"
  };

  render() {
    const step_items = [
      {
        title: "提交订单",
        icon: {
          value: "check",
          size: "14"
        }
      },
      { title: "完成支付" },
      { title: "点亮供灯", error: true }
    ];
    return (
      <View>
        <AtNavBar
          color="#000"
          title="完成支付"
          leftIconType="close"
          onClickLeftIcon={this.onReturnClick}
        />

        <AtSteps
          className="stepBar"
          items={step_items}
          current={this.state.current}
          //   onChange={this.onStepsChange.bind(this)}
        />

        <AtDivider />

        <View className="title_container_payment">
          <View>需支付法金</View>
          <View className="payment_price_text">¥ {this.state.price}</View>
          <View className="at-article__info">
            订单编号 33062063543003434995
          </View>
        </View>

        {/* <AtDivider /> */}

        <AtRadio
          options={[
            { label: "微信支付", value: "WeChatPay", desc: "微信安全支付" },
            {
              label: "支付宝支付",
              value: "AliPay",
              desc: "即将到来",
              disabled: true
            }
          ]}
          value={this.state.payment_method}
          onClick={this.handlePaymentMethodChange.bind(this)}
        />

        <AtButton
          className="btnPayment"
          type="primary"
          size="normal"
          circle
          //   disabled={disable_btnNext}
          onClick={this.btnOnClick.bind(this)}
        >
          确认支付
        </AtButton>
      </View>
    );
  }
}
