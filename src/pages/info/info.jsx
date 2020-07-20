import Taro, { Component, requirePlugin } from "@tarojs/taro";
import {
  View,
  Swiper,
  SwiperItem,
  Image,
  Picker,
  Text
} from "@tarojs/components";
import "./info.scss";
import {
  AtNavBar,
  AtDivider,
  AtInput,
  AtCheckbox,
  AtRadio,
  AtTextarea,
  AtButton
} from "taro-ui";
import axios from "axios";
import IconFont from "../../components/iconfont/index";
import {seatNameMapper} from "./constants";
import { v4 as uuidv4 } from 'uuid';


export default class Info extends Taro.Component {
  constructor() {
    super(...arguments);
    this.token = process.env.TOKEN;
    this.baseUrl = process.env.BASE_URL;
    this.state = {
      name: "",
      phone: "",
      dateSel: "2018-04-01",
      dateSelectorChecked: "请选择生日",
      genderSelector: ["男性", "女性"],
      genderSelectorChecked: "男性",
      textAreaValue: "",
      price: 0,
      years: "一年",
      light:"灯位",
      floor: 0,
    };
  }

  onReturnClick() {
    Taro.redirectTo({
      url: "../index/index"
    });
  }

  onGenderChange = e => {
    this.setState({
      genderSelectorChecked: this.state.genderSelector[e.detail.value]
    });
  };

  onDateChange = e => {
    this.setState({
      dateSel: e.detail.value,
      dateSelectorChecked: e.detail.value
    });
  };

  btnOnClick() {
    // const transactionCreateAPI = `${this.baseUrl}seat-names?ZoneID.id=${selectedZoneId}`;
    const customerCheckAPI = `${this.baseUrl}customers?Tel1=${this.state.phone}`;
    const customerAddAPI = `${this.baseUrl}customers`;
    let isWriteCustomer = false;
    let isWriteTrans = false;
    axios.get(customerCheckAPI, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).then(
      res=>{

        if(res.data && res.data instanceof Array && res.data.length>0)
        {
           const existedCustomer = res.data[0];
          existedCustomer.Name = this.state.name;
          existedCustomer.Gender = this.state.genderSelectorChecked;
          existedCustomer.Birthday = new Date(this.state.dateSel);
          const customerUpdateAPI = `${this.baseUrl}customers/${existedCustomer.id}`;

          axios.put(customerUpdateAPI,existedCustomer,  {
            headers: {
              Authorization: `Bearer ${this.token}`
            }       
          }).then(
            res=>{
              isWriteCustomer = true;
              console.log(`Successfully update the data as ${JSON.stringify(res)}`);
            }
          ).catch((error)=>{
            console.log(`An error occurred when check the level:  ${JSON.stringify(error)}`);
            Taro.showModal({title:"错误提示", content:"后台服务器错误，无法更新您的信息，请联系工作人员",showCancel:false});
          })

        }
        else
        {
           const newCustomer = {
             Name:this.state.name,
             Tel1:this.state.phone,
             Gender:this.state.genderSelectorChecked,
             Birthday:new Date(this.state.dateSel)
           }

           axios.post(customerAddAPI,
            newCustomer, 
            {
            headers: {
              Authorization: `Bearer ${this.token}`
            }       
          }).then((res)=>{ 
            isWriteCustomer = true;
            console.log(`Successfully write the data as ${JSON.stringify(res)}`);

          }).catch(error=>{
            console.log(`An error occurred when check the level:  ${JSON.stringify(error)}`);
            Taro.showModal({title:"错误提示", content:"后台服务器错误，无法提交您的信息，请联系工作人员",showCancel:false});

          })
           
        }
        // Create a transaction only when a customer exists(created or updated)
        if(isWriteCustomer)
        {
         
        console.log(uuidv4());
        }
      }).catch((error)=>{
      console.log(`An error occurred when check the level:  ${JSON.stringify(error)}`);
      Taro.showModal({title:"错误提示", content:"后台服务器错误，无法获取您的信息，请联系工作人员",showCancel:false});
    });
    if(isWriteCustomer && isWriteTrans)
    {
    Taro.redirectTo({
      url: "../payment/payment?price=" + this.state.price
    });
  }
  }

  handleNameChange(value) {
    this.setState({
      name: value
    });
  }

  handlePhoneChange(value) {
    this.setState({
      phone: value
    });
  }

  componentWillMount() {
    this.setState({
      price: this.$router.params.price,
      light: this.$router.params.light,
      floor: this.$router.params.floor,
    });
  }

  componentDidMount() {
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: "确认信息"
  };

  render() {
    let disable_btnNext = true;
    if (this.state.name !== "" && this.state.phone !== "") {
      disable_btnNext = false;
    }
    return (
      <View className="info_main_container">
        <AtNavBar
          className="info_navigationBar"
          color="#000"
          title="确认信息"
          leftIconType="chevron-left"
          onClickLeftIcon={this.onReturnClick}
        />
        <View className="title_container">
          <View className="title_info1">您已经在</View>
          <View>【仙人洞】</View>
          <View className="title_info2">供奉1盏{`${ seatNameMapper.find((item)=>item.id===this.state.light).name}${this.state.years}`}</View>
          <View className="title_info2">供灯于{this.state.floor}层</View>

        </View>
        <AtDivider />
        <View className="at-row at-row__align--center at-row__justify--around">
          <View className="at-col">
            <View className="at-article__h1 icon_title">
              <IconFont name="lotus" size={64} />
              <View className="title">供灯信息</View>
            </View>
            <View className="at-article__info at-col--wrap">
              输入供灯相关信息，供灯会根据您提交的信息内容显示在灯屏中。
            </View>
          </View>
        </View>
        <AtInput
          className="important_input"
          name="name"
          title="姓名"
          type="text"
          value={this.state.name}
          onChange={this.handleNameChange.bind(this)}
        />
        <AtInput
          className="important_input"
          name="phone"
          title="手机号"
          type="phone"
          value={this.state.phone}
          placeholder="输入手机号码"
          onChange={this.handlePhoneChange.bind(this)}
        />
        <View className="at-row Picker">
          <View className="at-col-2">生日</View>
          <Picker mode="date" onChange={this.onDateChange} value="1990">
            <View className="picker_info at-col at-col__offset-6">
              {this.state.dateSelectorChecked}
            </View>
          </Picker>
        </View>
        <View className="at-row Picker">
          <View className="at-col-2">性别</View>
          <Picker
            mode="selector"
            range={this.state.genderSelector}
            onChange={this.onGenderChange}
          >
            <View className="at-col at-col__offset-12">
              {this.state.genderSelectorChecked}
            </View>
          </Picker>
        </View>
        <View className="textArea">
          <View className="textArea_title">祈福语</View>
          <AtTextarea
            className="textArea_box"
            count={false}
            value={this.state.textAreaValue}
            //   onChange={this.handleChange.bind(this)}
            maxLength={200}
            placeholder="请输入您要祈福文字内容，如：阖家平安"
          />
        </View>
        <View className="at-row at-row__align--center at-row__justify--around bottom_div_info">
          <View className="at-row at-row__align--center">
            <Text className="bottom_text at-col">支付法金</Text>
            <Text className="price_text at-col">¥ {this.state.price}</Text>
          </View>
          <View className="at-row at-row__align--center">
            <AtButton
              className="btnNext at-col"
              size="normal"
              circle
              disabled={disable_btnNext}
              onClick={this.btnOnClick.bind(this)}
            >
              立即供灯
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}
