import React, { Component, useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Linking,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon4 from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
// import CardComponent from '../component/app/CardComponent';
import { GenService } from '../services/gen/GenServices';
import { ApiServices } from '../services/api/ApiServices';
import { LinearColor } from '../components/Colors';
import { ActivityIndicator } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import Loader from '../components/Loader';
import { BlurView } from '@react-native-community/blur';
import { XMLParser } from 'fast-xml-parser';


const { width, height } = Dimensions.get('screen')
const data = [{ value: 1 }, { value: 5 }, { value: 7 }, { value: 5 }]

const Dashboard = (props: any) => {
  const [DataChart, setDataChart] = useState(data)
  const [UserDAta, setUserDAta] = useState({ name: 'User', email: 'user@gmail.com' })
  const [Loading, setLoading] = useState(false)
  interface PaymentMethod {
    type: string;
    detail: {
      id: number;
      payment_method_name: string;
      is_active: number;
      icon: string;
      payment_method_code: string;
      image: string;
    }[];
  }

  const [refreshing, setRefreshing] = React.useState(false);
  const refRBSheet4: any = useRef();
  const [DashboardData, setDashboardData] = useState({
    label: '-',
    prediction: 0,
    probabilities: [
      0,
      0,
      0
    ],
  });

  const [SensorData, setSensorData] = useState({
    heartrate: 0,
    steps: '',
    battery: '',
    temperature: '',
    gyrox: '',
    gyroy: '',
    distance: '',
    motion: ''
  });

  const [WatchData, setWatchData] = useState({
    online: '',
    time: '',
    lat: 0,
    lng: 0,
    speed: 0,
    altitude: 0,
    distance_unit_hour: '',
    device_data: {
      model_id: '',
      name: '',
      imei: '',
      traccar: {
        other: ''
      }
    },
    sensors: []
  });

  const iconMap: any = {
    fresh: '😄',
    tired: '😑',
    sleepy: '😴',
  };

  const labelMap: any = {
    fresh: 'Segar',
    tired: 'Lelah',
    sleepy: 'Ngantuk',
  };

  function FatigueIcon({ level = 'fresh', size = 53 }) {
    return (
      <View style={{ alignItems: 'center', marginTop: 0 }}>
        <Text style={{ fontSize: size, color: 'white' }}>
          {iconMap[level]}
        </Text>
        {/* <Text style={{ marginTop: 4,color:'white' }}>
        {labelMap[level]}
      </Text> */}
      </View>
    );
  }

  function parseOther(otherString) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
    });

    const parsed = parser.parse(otherString);

    return {
      heartrate: Number(parsed.info.heartrate),
      steps: Number(parsed.info.steps),
      battery: Number(parsed.info.battery),
      temperature: Number(parsed.info.temperature),
      gyrox: Number(parsed.info.gyrox),
      gyroy: Number(parsed.info.gyroy),
      gyroz: Number(parsed.info.gyroz),
      accx: Number(parsed.info.accx),
      accy: Number(parsed.info.accy),
      accz: Number(parsed.info.accz),
      light: Number(parsed.info.light),
      rotx: Number(parsed.info.rotx),
      roty: Number(parsed.info.roty),
      rotz: Number(parsed.info.rotz),
      sequence: Number(parsed.info.sequence),
      distance: Number(parsed.info.distance),
      totaldistance: Number(parsed.info.totaldistance),
      motion: parsed.info.motion === 'true',
      valid: parsed.info.valid === 'true',
      enginehours: Number(parsed.info.enginehours),
      accuracy: Number(parsed.info.accuracy),
    };
  }



  useEffect(() => {
    GenService.getStorage('userdata').then((user) => {
      setUserDAta(user)
      console.log(`user`, user);
    })
    predictStress()
  }, [])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    predictStress()
    setTimeout(() => {

    }, 2000);
  }, []);

const openMap = (lat:any, lng:any) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  Linking.openURL(url);
};


  function hilangkanNolRibuan(angka: any) {
    // Ubah angka menjadi string dengan pemisah ribuan
    let angkaString = angka.toLocaleString('en-US');
    // Hapus nol ribuan
    angkaString = angkaString.replace(/,000/g, '');
    // Konversi kembali ke integer
    let hasil = parseInt(angkaString.replace(/,/g, ''), 10);
    return hasil;
  }

  function currencyFormat(num: any) {
    return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  function randomizeBodyValues() {
    return {
      Heart_Rate: SensorData.heartrate,
      Steps_Taken: SensorData.steps,
      Temperature: SensorData.temperature,
    };
  }

  function randomFloat(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(6));
  }

  const intervalRef = useRef(null);

  useEffect(() => {
    startRealtime();

    return () => {
      stopRealtime();
    };
  }, []);

  const startRealtime = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      predictStress();
    }, 10000); // 5 detik (realistis untuk wearable)
  };

  const stopRealtime = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const predictStress = async () => {
    try {
      if (Loading) return;
      setLoading(true);

      const token = await GenService.getStorage('token');
      const resp = await ApiServices.GetData('/get_devices?user_api_hash=' + token);

      if (!resp?.length) return;

      const datas = resp[0].items[0];
      setWatchData(datas);

      const other = datas.device_data.traccar.other;
      const sensor: any = parseOther(other);
      setSensorData(sensor);

      const body = {
        Heart_Rate: sensor.heartrate,
        Steps_Taken: sensor.steps,
        Temperature: sensor.temperature,
      };

      const res = await ApiServices.postDataPredic(body, '/predict');
      setDashboardData(res);

    } catch (err) {
      console.error('predictStress error', err);
    } finally {
      setLoading(false);
    }
  };


  const getDataSmart = () => {
    setLoading(true);
    let body = randomizeBodyValues();
    ApiServices.postDataPredic(body, '/predict').then((res) => {
      if (res) {
        let data = res;
        setDashboardData(data)
        setTimeout(() => {
          setLoading(false);
        }, 400);
      }
    })
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="rgba(0,0,0,0)" />

        <ScrollView refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          {/* <Image source={require('../assets/imgs/banner.jpg')} style={stylesHome.banner} /> */}
          <LinearGradient colors={LinearColor.LightGradien()}>

            <ImageBackground source={require('../assets/imgs/seamless_putih.png')}
              resizeMode="repeat" style={{ marginBottom: 2 }}>
              <BlurView
                style={styles.absoluteBlur}
                blurType="light"
                blurAmount={20}
                reducedTransparencyFallbackColor="white"
              />
              <View style={{ padding: 10, marginTop: 20, flexDirection: 'row', backgroundColor: 'white', width: width / 1.1, alignSelf: 'center',borderRadius:10 }}>
                <View style={{ width: width / 2.8 }}>
                  {WatchData.online == 'online' ? <Image source={require('../assets/imgs/icons/smart_online.png')} style={{ height: 100, width: 100 }} /> :
                    <Image source={require('../assets/imgs/icons/smart_offline.png')} style={{ height: 100, width: 100 }} />}
                  <View style={{ position: 'absolute', top: 50, right: 15 }}>
                    <Text style={{ color: WatchData.online == 'online' ? 'green' : 'red', fontSize: 17, fontWeight: 'bold' }}>{WatchData.online}</Text>
                    <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>{WatchData.device_data.name}</Text>
                  </View>
                </View>
                <View style={{ width: width / 2 }}>
                  <Text style={[styles.textTitle, { fontSize: 13 }]}>Penerapan Machine Learning</Text>
                  <Text style={[styles.textTitle, { fontWeight: 'normal' }]}>Pada Deteksi Tingkat Kantuk Pengemudi Berbasis Jam Tangan Pintar Melalui Analisis Heart Rate Variability (HRV)</Text>
                </View>
              </View>

              <View style={styles.cardWrapper}>
                {/* Blur Layer */}
                {/* Isi Card */}
                <View style={styles.content}>
                  {WatchData.online == 'online' ? 
                  <View style={[styles.redBox, {
                        backgroundColor:
                          DashboardData.prediction == 0 ? 'green' : 'red'
                      }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      {/* <Image source={require('../assets/imgs/icons/icons8-beat.png')} style={{ resizeMode: 'contain', height: 60, width: 80 }} /> */}
                      <FatigueIcon level={DashboardData.prediction == 0 ? 'fresh' : 'sleepy'} size={55} />
                      {Loading ?
                        <View style={{ alignItems: 'center', }}>
                          <ActivityIndicator size={30} color={'white'} />
                          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Loading..</Text>
                        </View> :
                        <View style={{ width: width / 2.2, alignItems: 'left', justifyContent: 'center' }}>
                          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{randomizeBodyValues().Heart_Rate}<Text style={{ fontSize: 12 }}> Bpm</Text></Text>
                          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{DashboardData.label}</Text>
                        </View>}
                      <View>

                      </View>
                    </View>
                  </View>
                  :
                  <View style={[styles.redBox, {backgroundColor:'gray',marginBottom:-10}]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <Image source={require('../assets/imgs/icons/icons8-beat.png')} style={{ resizeMode: 'contain', height: 60, width: 80 }} />
                      {Loading ?
                        <View style={{ alignItems: 'center', }}>
                          <ActivityIndicator size={30} color={'white'} />
                          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Loading..</Text>
                        </View> :
                        <View style={{ alignItems: 'left', justifyContent: 'center' }}>
                          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{randomizeBodyValues().Heart_Rate}<Text style={{ fontSize: 12 }}> Bpm</Text></Text>
                          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Smartwatch Tidak Terhubung</Text>
                        </View>}
                      <View>

                      </View>
                    </View>
                  </View>
                  }

                </View>
              </View>
              
              {WatchData.online == 'online' &&
              <View style={styles.cardInfo}>
                <View style={styles.cardInfoRibon}>
                  <Icon4 color={'green'} size={20} name={'info'} />
                  <Text style={{ color: 'black', fontWeight: 'bold', marginLeft: 6 }}>Predict Rersult Info</Text>
                </View>
                {Loading ?
                  <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator size={30} color={'black'} />
                    {/* <Text style={{color:'black',fontSize:13}}>Loading result...</Text> */}
                  </View> :
                  <View style={styles.cardInfoContent}>
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>Probabilitas : </Text>

                    {DashboardData.probabilities.map((v, k: any) => (
                      <View style={styles.chip} key={k}>
                        <View style={{ marginLeft: 10 }}></View>
                        <Text style={{ color: 'white' }}> {'-->'} {v.toString()} {'<--'} </Text>
                      </View>
                    ))}
                  </View>
                }
              </View>}

              {/* <View style={styles.cardGroup}>
                <TouchableOpacity>
                  <LinearGradient colors={LinearColor.PurpleLinear()} style={[stylesHome.cardDash]}>
                    <Image source={require('../assets/imgs/icons/icons8-heart.png')} style={styles.cardIcon} />
                    <Text style={{ color: 'black', fontSize: 17 }}>Heart Rate</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity>
                  <LinearGradient colors={LinearColor.PurpleLinear()} style={[stylesHome.cardDash]}>
                    <Image source={require('../assets/imgs/icons/icons8-map.png')} style={styles.cardIcon} />
                    <Text style={{ color: 'black', fontSize: 17 }}>Location</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity>
                  <LinearGradient colors={LinearColor.PurpleLinear()} style={[stylesHome.cardDash]}>
                    <Image source={require('../assets/imgs/icons/icons8-bell.png')} style={styles.cardIcon} />
                    <Text style={{ color: 'black', fontSize: 17 }}>Notification</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity>
                  <LinearGradient colors={LinearColor.PurpleLinear()} style={[stylesHome.cardDash]}>
                    <Image source={require('../assets/imgs/icons/icons8-setting.png')} style={styles.cardIcon} />
                    <Text style={{ color: 'black', fontSize: 17 }}>Setting</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View> */}

              <LinearGradient colors={LinearColor.BlackGradient()} style={[styles.cardDetail]}>
                <View style={styles.cardDetailContent}>
                  <Image source={require('../assets/imgs/icons/detail/icons8-heart.png')} style={{ width: 30, height: 30 }} />
                  <View style={{ marginLeft: 5 }}>
                    <Text style={{ color: 'white', fontSize: 17 }}>Heart Rate</Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{SensorData.heartrate}<Text style={{ fontSize: 12 }}>Bpm</Text></Text>
                  </View>
                </View>

                <View style={styles.cardDetailContent}>
                  <Image source={require('../assets/imgs/icons/detail/icons8-temp.png')} style={{ width: 30, height: 30 }} />
                  <View style={{ marginLeft: 5 }}>
                    <Text style={{ color: 'white', fontSize: 17 }}>Temp</Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{SensorData.temperature}<Text style={{ fontSize: 18 }}>°C</Text></Text>
                  </View>
                </View>

                <View style={styles.cardDetailContent}>
                  <Image source={require('../assets/imgs/icons/detail/icons8-shoes.png')} style={{ width: 30, height: 30 }} />
                  <View style={{ marginLeft: 5 }}>
                    <Text style={{ color: 'white', fontSize: 17 }}>Step</Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{SensorData.steps}</Text>
                  </View>
                </View>

                <View style={styles.cardDetailContent}>
                  {/* <Image source={require('../assets/imgs/icons/detail/icons8-sleep.png')} style={{ width: 30, height: 30 }} /> */}
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}> {!SensorData.motion ? '🔴' : '🟢'}</Text>
                  <View style={{ marginLeft: 5 }}>
                    <Text style={{ color: 'white', fontSize: 17 }}>Motion</Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{SensorData.motion ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>

                <View style={[styles.cardDetailContent, { width: width / 1.3, alignSelf: 'center', justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={require('../assets/imgs/icons/icons8-map.png')} style={{ width: 30, height: 30 }} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ color: 'white', fontSize: 17 }}>Last Location</Text>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Lat : {WatchData.lat}</Text>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Long : {WatchData.lng}</Text>
                    </View>
                  </View>


                  <TouchableOpacity style={styles.btn} onPress={()=> openMap(WatchData.lat,WatchData.lng)}>
                    <Text style={{ color: 'white' }}>Lihat Map</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.cardDetailContent, { width: width / 1.3, alignSelf: 'center' }]}>
                  <Image source={require('../assets/imgs/icons/detail/icons8-speed.png')} style={{ width: 50, height: 50 }} />
                  <View style={{ marginLeft: 5 }}>
                    <Text style={{ color: 'white', fontSize: 17 }}>Speed </Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{WatchData.speed} {WatchData.distance_unit_hour} </Text>
                  </View>

                  <View style={{ marginLeft: 15 }}>
                    <Text style={{ color: 'white', fontSize: 13 }}>Accelerometer </Text>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>X : {SensorData.gyrox}</Text>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Y : {SensorData.gyroy}</Text>
                  </View>

                </View>
              </LinearGradient>

            </ImageBackground>

          </LinearGradient>

        </ScrollView>


        <LinearGradient colors={LinearColor.BlackGradient()} style={[stylesHome.barBottom]}>
          <ImageBackground source={require('../assets/imgs/seamless_hitam.png')}
            resizeMode="cover" style={{ flex: 1, marginBottom: 2 }}>
          </ImageBackground>
          {/* <BlurView
              style={styles.absolute}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="black"
            /> */}
        </LinearGradient>

        <TouchableOpacity style={stylesHome.fabHome} onPress={() => predictStress()}>
          <Image source={require('../assets/imgs/smart.png')} style={{ height: 50, width: 50 }} />
          {/* <Text style={{ color: 'black', fontWeight: 'bold' }}>Menu</Text> */}
        </TouchableOpacity>
      </View>

    </>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5
  },
  cardDetailContent: {
    flexDirection: 'row',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 10,
    elevation: 0.5,
    width: width / 2.7,
    marginTop: 10
  },
  cardDetail: {
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 10,
    width: width / 1.2,
    alignSelf: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  textTitle: {
    color: 'black',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 'bold'
  },
  chip: {
    paddingHorizontal: 5,
    backgroundColor: 'gray',
    borderRadius: 5,
    marginLeft: 10,
  },
  cardInfo: {
    // padding:1,
    backgroundColor: 'white',
    elevation: 3,
    width: width / 1.2,
    alignSelf: 'center',
    marginTop: -15
  },
  cardInfoRibon: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: 30,
    backgroundColor: 'lightgreen'
  },
  cardInfoContent: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  cardGroup: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: width / 1.2,
    alignSelf: 'center'
  },
  cardWrapper: {
    // width: 300,
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden', // WAJIB agar blur mengikuti bentuk card
    // backgroundColor: 'rgba(255,255,255,0.2)', // transparan
  },

  absoluteBlur: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    alignItems: 'center',
  },

  redBox: {
    width: '100%',
    padding: 15,
    // Merah semi transparan
    borderRadius: 12,
    // marginTop: 10,
    height: 100
  },
  cardIcon: {
    resizeMode: 'contain',
    height: 80,
    width: 80
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  absolute: {
    position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, borderRadius: 20
  },
  container: { backgroundColor: "#fff" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  paymentItem: { justifyContent: 'space-between', flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#fff", borderRadius: 10, marginBottom: 5, borderWidth: 1 },
  disabled: { opacity: 0.5 },
  icon: { width: 100, height: 40, marginRight: 10, resizeMode: 'contain' },
  paymentText: { flex: 1, fontSize: 16 },
  warningText: { color: "red", fontSize: 14 },
});


const stylesHome = StyleSheet.create({
  cardTitleHorizontal: {
    backgroundColor: 'black',
    padding: 5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
  },
  btn: {
    width: 80,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: 'red',
    borderRadius: 10
  },
  textCard: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black'
  },
  cardTagihan: {
    width: width / 1.2,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    alignSelf: 'center',
    padding: 5,
    alignItems: 'center',
    // borderRadius: 10,
    flexDirection: 'row',
    elevation: 5,
    // marginVertical: 5,
    marginBottom: 10,
    shadowColor: "#000",
    justifyContent: 'space-between'
  },
  selectSever: {
    height: 50,
    backgroundColor: 'lightgray',
    width: width / 1.4,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,


  },
  status: {
    height: width / 1.1,
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3

  },
  Card: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
    width: width / 2.3,
    marginHorizontal: 5,
    // marginBottom:20,
    alignItems: 'center'

  },
  cardContent: {
    padding: 10,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    elevation: 5,
    width: '88%',
    backgroundColor: 'white',
    alignSelf: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',

  },
  btnHome: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    width: 50,
    height: 50,
    borderRadius: 100,
    elevation: 5,
    margin: 10,
    zIndex: 20
  },
  textBtn: {
    color: 'black',
    fontSize: width / 23,
    fontWeight: 'bold'
  },
  textCat: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LinearColor.Secondary()

  },
  btnMore: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: LinearColor.Secondary(),
    borderRadius: 20
  },
  wrapercat: {
    marginLeft: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width / 1.1
  },
  badge: {
    height: 30,
    width: 30,
    backgroundColor: 'red',
    alignItems: 'center',
    borderRadius: 100,
    position: 'absolute',
    right: -5,
    top: -5,
    alignContent: 'center',
    justifyContent: 'center'
  },
  eventTitle: {
    position: 'absolute',
    zIndex: 10,
    padding: 7,
    backgroundColor: LinearColor.red(),
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  event: {
    flexDirection: 'row',
    paddingVertical: 10,
    // padding : 15
  },
  cardEvent: {
    height: width / 2.7,
    width: width / 1.1,
    backgroundColor: 'white',
    // elevation: 10,
    borderRadius: 10,
    marginHorizontal: 5

  },
  texGreeting: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
  },
  banner: {
    height: 150,
    width: '100%'
  },
  geretingText: {
    flexDirection: 'row',
    position: 'absolute',
    alignSelf: 'center',
    width: '100%',
    // justifyContent: 'space-evenly',
    // top: 33,
    marginTop: 30,
    alignItems: 'center'
  },
  wraper: {
    // height: width,
    marginTop: 30,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 10
  },
  balace: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10
  },
  hr: {
    height: 10,
    backgroundColor: 'black',
    marginTop: 0,
    elevation: 4
  },
  cardTitle: {
    backgroundColor: LinearColor.blue(),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    height: 30,
    alignSelf: 'center',
    top: -width / 2.2,
    // borderTopRightRadius:5,
    // borderTopLeftRadius:5,
    borderRadius: 6,
    width: width / 5


  },
  divider: {
    backgroundColor: 'transparent',
    height: 5,
    marginVertical: 10
  },
  fabHome: {
    backgroundColor: 'white',
    alignItems: 'center',
    height: 75,
    width: 75,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    alignSelf: 'center',
    bottom: 10,
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 4,
    elevation: 7
  },
  cardDash: {
    padding: 10,
    borderRadius: 15,
    elevation: 10,
    width: width / 2.9,
    height: width / 2.9,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center'
  },

  cardChart: {
    padding: 10,
    borderRadius: 15,
    elevation: 10,
    width: width / 1.1,
    alignSelf: 'center',
    marginTop: 20
  },
  barBottom: {
    width: width,
    height: 50
  }


})
