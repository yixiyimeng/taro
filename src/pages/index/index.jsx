import Taro, { Component, requirePlugin, hideToast } from "@tarojs/taro";
import {
  View,
  Swiper,
  SwiperItem,
  Image,
  Picker,
  Text,
  Video
} from "@tarojs/components";
import "./index.scss";
import { AtNavBar, AtButton, AtCurtain, AtDivider,AtTabs,AtTabsPane } from "taro-ui";
import IconFont from "../../components/iconfont/index";
import axios from "axios";
import {ZONE_SELECT_TEXT,SEAT_SELECT_TEXT,FLOOR_SELECT_TEXT,YEAR_SELECT_TEXT} from "./constants";



export default class Index extends Taro.Component {
  
  token;
  baseUrl;
  constructor() {
    super(...arguments);
    this.token = process.env.TOKEN;
    this.baseUrl = process.env.BASE_URL;
    this.state = {
      isOpened: false,
      selector1: [],
      selector1Checked: ZONE_SELECT_TEXT,
      selector1Index:0,
      selector2: [],
      selector2Checked: SEAT_SELECT_TEXT,
      selector2Index:0,
      selector4: [],
      selector4Checked: FLOOR_SELECT_TEXT,
      selector4Index:0,
      selector6: ["一年"],
      selector6Checked: YEAR_SELECT_TEXT,
      price: 0,
      seatAlias:"",
      currentTab: 0,
    };
  }

  handleTabClick (value) {
    this.setState({
      currentTab: value
    })
  }
  
  handleChange() {
    this.setState({
      isOpened: true
    });
  }
  onClose() {
    this.setState({
      isOpened: false
    });
  }
  btnOnClick() {
    const year = this.state.selector6Checked;
    Taro.redirectTo({
      url: "../info/info?price=" + this.state.price +"&light="+this.state.seatAlias+"&floor="+this.state.selector4Checked

    });
  }

  onSelector1Change = e => {

    const selectedZoneId = this.state.selector1[e.detail.value].id;
    const api = `${this.baseUrl}seat-names?ZoneID.id=${selectedZoneId}`;
    axios
      .get(api, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      .then(res => {
        this.setState({
          selector1Checked: this.state.selector1[e.detail.value].name,
          selector1Index:e.detail.value,
          selector2: res.data.map((item)=>({id:item.id,name:item.name,seatNO:item.SeatNumber,seatAlias:item.SeatAlias})),
          selector2Checked: SEAT_SELECT_TEXT,
          selector2Index:0,
          selector4: [],
          selector4Checked: FLOOR_SELECT_TEXT,
          selector4Index:0,
          selector6: ["一年"],
          selector6Checked: YEAR_SELECT_TEXT,
          price: 0
        });
      })
      .catch(error => {
        console.log(`An error occurred when check the seat:  ${JSON.stringify(error)}`);
        Taro.showModal({title:"错误提示", content:"后台服务器错误，请联系工作人员",showCancel:false});
      });
  };

  onSelector2Change = (e) => {

    const zone = this.state.selector1[this.state.selector1Index];
    const seat = this.state.selector2[e.detail.value];
    const getPillarApi = `${this.baseUrl}pillar-infos?seat_id.id=${seat.id}`;
    axios.get(getPillarApi, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).then(
      res=>{
        let floorData = [];
        if(res.data && res.data instanceof Array && res.data.length>0 )
        {
              
              const floorNumber = res.data[0].FloorNumber;

              for(let i=1;i<=floorNumber;i++)
              {
                floorData.push(i);
              }
        }
        else
        {
          throw Error("No pillar data found for this seat and zone");
        }
        this.setState({
          selector2Checked: this.state.selector2[e.detail.value].name,
          seatAlias:this.state.selector2[e.detail.value].seatAlias,
          selector2Index:e.detail.value,
          selector4: floorData,
          selector4Checked: FLOOR_SELECT_TEXT,
          selector4Index:0,
          selector6: ["一年"],
          selector6Checked: YEAR_SELECT_TEXT,
          price: 0
        });
        
      }
    ).catch(error => {
          console.log(`An error occurred when check the level:  ${JSON.stringify(error)}`);
          Taro.showModal({title:"错误提示", content:"后台服务器错误，请联系工作人员",showCancel:false});
        });
  };

  onSelector4Change = e => {
    const zone = this.state.selector1[this.state.selector1Index];
    const seat = this.state.selector2[this.state.selector2Index];
    const pillar = 1
    const selectedFloor= this.state.selector4[e.detail.value];
    const getPriceApi = `${this.baseUrl}Lists?Zone=${zone.zoneNO}&Seat=${seat.seatNO}&Pillar=${pillar}&Floor=${selectedFloor}&IsFired=false`;
   
    axios
      .get(getPriceApi, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      .then(res => {
        let price=0
        if(res.data && res.data instanceof Array && res.data.length>0 )
        {
              
              price = res.data[0].Price;
              this.setState({
                selector4Checked: this.state.selector4[e.detail.value],
                selector4Index:e.detail.value,
                selector6: ["一年"],
                selector6Checked: YEAR_SELECT_TEXT,
                price: price
              });

        }
        else
        {
          Taro.showModal({title:"灯位提示", content:"您所选的层数目前已被全部预定，请选择其他的层数",showCancel:false});
        }

      })
      .catch(error => {
        console.log(`An error occurred when check the level:  ${JSON.stringify(error)}`);
        Taro.showModal({title:"错误提示", content:"后台服务器错误，请联系工作人员",showCancel:false});

      });
  };

  // onSelector6Change = e => {
  //   const position = this.state.selector5Checked.split(/(\d+)/)[1];
  //   const api = `http://localhost:1337/lights/getPrice/${position}`;
  //   axios
  //     .get(api, {
  //       headers: {
  //         Authorization: `Bearer ${this.token}`
  //       }
  //     })
  //     .then(res => {
  //       const totalPrice = (e.detail.value + 1) * parseInt(res.data);
  //       this.setState({
  //         selector6Checked: this.state.selector6[e.detail.value],
  //         price: totalPrice
  //       });
  //     })
  //     .catch(error => {
  //       console.log("An error occurred when check the position: " + error);
  //     });
  // };

  componentWillMount() {}

  componentDidMount() {
    axios
      .get(`${this.baseUrl}zone-names`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      .then(res => {
      
        const selector1Data = res.data.map((item)=>({id:item.id,name:item.name,zoneNO:item.ZoneNumber})); 
        this.setState({ selector1: selector1Data });
      })
      .catch(error => {
        console.log(`An error occurred when check the zone: ${JSON.stringify(error)}`);
        Taro.showModal({title:"错误提示", content:"后台服务器错误，请联系工作人员",showCancel:false});
      });
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: "首页"
  };

  render() {
    let disable_btnNext,
      disable_pickerSeat,
      disable_pickerFloor

    disable_btnNext = true;
    disable_pickerSeat = true;
    disable_pickerFloor = true;

    if (
      this.state.selector1Checked !== ZONE_SELECT_TEXT &&
      this.state.selector2Checked !== SEAT_SELECT_TEXT&&
      this.state.selector4Checked !== FLOOR_SELECT_TEXT 
    ) {
      disable_btnNext = false;
    }
    if (this.state.selector1Checked !== ZONE_SELECT_TEXT) {
      disable_pickerSeat = false;
    }
    if (this.state.selector2Checked !== SEAT_SELECT_TEXT) {
      disable_pickerFloor = false;
    }
    
    const tabList = [{ title: '老君殿' }, { title: '纯阳殿' } ]

    return (
      <View className="index">
        <AtNavBar
          className="NavigationBar"
          onClickRgIconSt={this.handleClick}
          onClickRgIconNd={this.handleClick}
          onClickLeftIcon={this.handleClick}
          color="#000"
          title="庐山仙人洞"
          // rightFirstIconType="bullet-list"
        />

        <Swiper
          className="HomeSwiper"
          indicatorColor="rgba(0, 0, 0, 0.6)"
          indicatorActiveColor="#333"
          circular
          indicatorDots
          // autoplay
        >
          <SwiperItem>
            {/* <Image
              style="width: 100%;height: 100%;background: #fff;"
              src={require("../../assets/home_image_slide_1.jpg")}
            /> */}
            <Video
              initialTime="0"
              id="video"
              loop={false}
              muted={false}
              poster="http://misc.aotu.io/booxood/mobile-video/cover_900x500.jpg"
              autoplay={false}
              controls={true}
              src="http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400"
            />
          </SwiperItem>
          <SwiperItem>
            <Image
              style="width: 100%;height: 100%;background: #fff;"
              src={require("../../assets/home_image_slide_2.jpg")}
            />
          </SwiperItem>
          <SwiperItem>
            <Image
              style="width: 100%;height: 100%;background: #fff;"
              src={require("../../assets/home_image_slide_3.jpg")}
            />
          </SwiperItem>
        </Swiper>

        <View className="at-row at-row__align--center at-row__justify--around">
          <View className="at-col">
            <View className="at-article__h1 icon_title">
              <IconFont name="lotus" size={64} />
              <View className="title">选灯信息</View>
            </View>
            <View className="at-article__info">
              请选择当前位置，供灯会根据选的位置点亮
            </View>
          </View>
          <View className="at-col">
            <AtCurtain
              isOpened={this.state.isOpened}
              onClose={this.onClose.bind(this)}
              closeBtnPosition="top-right"
            >
      
        <AtTabs current={this.state.currentTab} tabList={tabList} onClick={this.handleTabClick.bind(this)}>
        <AtTabsPane current={this.state.currentTab} index={0} >
          <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;' >
                 
          <View className="table">
                <View className="at-row">
                  <View className="at-col table_title at-article__h2">
                    关圣与文昌灯法金
                  </View>
                </View>
                <View className="at-row">
                  <View className="at-col at-article__info table_info">
                    *层数按光明灯从上向下排列，同层不同位置法金不变
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col--auto">
                    <Text className="table_content">顶层(33层)</Text>
                    <Text className="table_content table_red_text">
                      （高功法师亲自加持）
                    </Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥9900</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">32层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥8800</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">31层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥6600</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">28-30层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥4800</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">25-27层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥3600</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">21-24层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥1800</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">11-20层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥1200</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">1-10层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥360</Text>
                  </View>
                </View>
              </View>
          
          </View>
        </AtTabsPane>
        <AtTabsPane current={this.state.currentTab} index={1}>
          <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;'>
 
          <View className="table">
                <View className="at-row">
                  <View className="at-col table_title at-article__h2">
                  光明灯法金 
                  </View>
                </View>
                <View className="at-row">
                  <View className="at-col at-article__info table_info">
                    *层数按光明灯从上向下排列，同层不同位置法金不变
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col--auto">
                    <Text className="table_content">顶层（20层）</Text>
                    <Text className="table_content table_red_text">
                      （高功法师亲自加持）
                    </Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥9900</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">19层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥8800</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">18层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥6600</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">15-17层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥4800</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">11-14层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥1880</Text>
                  </View>
                </View>
                <View className="at-row at-row__justify--around at-row__align--center">
                  <View className="at-col at-col-2">
                    <Text className="table_content">6-10层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥1200</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">1-5层</Text>
                  </View>
                  <View className="at-col at-col-2">
                    <Text className="table_content">¥360</Text>
                  </View>
                </View>
              </View>
          </View>
        </AtTabsPane>
      </AtTabs>
            </AtCurtain>
            <AtButton
              className="btnCurtain"
              onClick={this.handleChange.bind(this)}
              size="small"
              circle
            >
              法金表
            </AtButton>
          </View>
        </View>

        <View className="Picker_container">
          <View className="picker">
            <Picker
              mode="selector"
              range={this.state.selector1}
              rangeKey="name"
              onChange={this.onSelector1Change}
              value={this.state.selector1Index}
            >
              <View>
                <View className="at-row at-row__justify--between">
                  <View className="at-col at-col-5">
                    <Text className="starSymbol">*</Text>
                    <Text className="pickerName">大殿</Text>
                  </View>
                  <View className="at-col at-col-5 pickerSelector">
                    {this.state.selector1Checked}
                  </View>
                </View>
              </View>
            </Picker>
          </View>
          <View className="picker">
            <Picker
              mode="selector"
              range={this.state.selector2}
              rangeKey="name"
              onChange={this.onSelector2Change}
              disabled={disable_pickerSeat}
            >
              <View>
                <View className="at-row at-row__justify--between">
                  <View className="at-col at-col-5">
                    <Text className="starSymbol">*</Text>
                    <Text className="pickerName">灯座</Text>
                  </View>
                  <View className="at-col at-col-5 pickerSelector">
                    {this.state.selector2Checked}
                  </View>
                </View>
              </View>
            </Picker>
          </View>
          {/* <View className="picker">
            <Picker
              mode="selector"
              range={this.state.selector3}
              onChange={this.onSelector3Change}
              disabled={disable_pickerPillar}
            >
              <View>
                <View className="at-row at-row__justify--between">
                  <View className="at-col at-col-5">
                    <Text className="starSymbol">*</Text>
                    <Text className="pickerName">柱</Text>
                  </View>
                  <View className="at-col at-col-5 pickerSelector">
                    {this.state.selector3Checked}
                  </View>
                </View>
              </View>
            </Picker>
          </View> */}
          <View className="picker">
            <Picker
              mode="selector"
              range={this.state.selector4}
              onChange={this.onSelector4Change}
              disabled={disable_pickerFloor}
            >
              <View className="at-row at-row__justify--between">
                <View className="at-col at-col-5">
                  <Text className="starSymbol">*</Text>
                  <Text className="pickerName">层数</Text>
                </View>
                <View className="at-col at-col-5 pickerSelector">
                  {this.state.selector4Checked}
                </View>
              </View>
            </Picker>
          </View>
          {/* <View className="picker">
            <Picker
              mode="selector"
              range={this.state.selector5}
              onChange={this.onSelector5Change}
              disabled={disable_pickerPosition}
            >
              <View>
                <View className="at-row at-row__justify--between">
                  <View className="at-col at-col-5">
                    <Text className="starSymbol">*</Text>
                    <Text className="pickerName">位</Text>
                  </View>
                  <View className="at-col at-col-5 pickerSelector">
                    {this.state.selector5Checked}
                  </View>
                </View>
              </View>
            </Picker>
          </View> */}
          <View>
            <Picker
              mode="selector"
              range={this.state.selector6}
              onChange={this.onSelector6Change}
            >
              <View className="at-row at-row__justify--between">
                <View className="at-col at-col-5">
                  <Text className="starSymbol">*</Text>
                  <Text className="pickerName">供奉时长</Text>
                </View>
                <View className="at-col at-col-5 pickerSelector">
                  {this.state.selector6Checked}
                </View>
              </View>
            </Picker>
          </View>
        </View>

        <View className="at-article__p">
          <p className="content_para">
            这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本落。这是文本段落。1234567890123456789012345678901234567890
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </p>
        </View>
        <AtDivider className="divider" />
        <View className="at-row at-row__align--center at-row__justify--around bottom_div">
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
              下一步
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

