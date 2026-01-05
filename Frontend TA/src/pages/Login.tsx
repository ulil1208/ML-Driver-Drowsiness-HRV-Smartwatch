import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, Text, SafeAreaView, Dimensions, StatusBar, TextInput,
    ImageBackground,
    ScrollView,
    KeyboardAvoidingView, TouchableOpacity, ActivityIndicator,
    Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LinearColor } from '../components/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { GenService } from '../services/gen/GenServices';
import * as Animatable from 'react-native-animatable'
import { ApiServices } from '../services/api/ApiServices';


const { width, height } = Dimensions.get('window')

export default function App(props: any) {
    const [Username, setUsername] = useState('');
    const [password, setpassword] = useState('');
    const [Loading, setLoading] = useState(false)
    const [LoadingSelect, setLoadingSelect] = useState(false)
    const [hidePass, sethidePass] = useState(true)
    const [ShowServer, setShowServer] = useState(false)
    const [ListServer, setListServer] = useState([])
    const [Eye, setEye] = useState('eye')
    const [SelectServer, setSelectServer] = useState('')
    const [UserData, setUserData] = useState('')
    const [Role, setRole] = useState('')

    useEffect(() => {
        //   getServer()
    }, [])


    const doLogin = () => {
        if (Username === '') return GenService.alertErr('Kolom Email tidak boleh kosong')
        if (password === '') return GenService.alertErr('Password tidak boleh kosong')
        let body = { email: Username, password: password }
        setLoading(true)
        console.log(body);
        ApiServices.postLogin(body, '/login').then((resp) => {
            console.log('response :', resp);
            if (resp) setLoading(false);
            if (resp.status == 1) {
                let data = resp;
                GenService.saveStorage('token', JSON.stringify(data.user_api_hash))
                props.navigation.replace('Dashboard')

            } else {
                GenService.alertErr(resp.message)
            }

        })

    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView>
                <SafeAreaView style={styleSheet.MainContainer} >
                    <StatusBar translucent barStyle='light-content' backgroundColor={'transparent'} />

                    <View style={styleSheet.subContainer}>
                        <LinearGradient start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }}
                            colors={LinearColor.LightGradien()} style={styleSheet.childView}>
                            <ImageBackground source={require('../assets/imgs/seamless_putih.png')}
                                resizeMode="repeat" style={{ flex: 1 }}>

                                <View style={{ marginHorizontal: 40 }}>
                                    <Animatable.Image animation='fadeInUp' source={require('../assets/imgs/smart.png')}
                                        style={{
                                            width: width / 3,
                                            height: width / 3,
                                            resizeMode: 'contain',
                                            alignSelf: 'center',
                                            shadowColor: "#fff",
                                            shadowOffset: { height: 5, width: 3 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 0.5,
                                            marginTop: 100
                                        }} />
                                    <Animatable.Text animation={'fadeInUp'} style={{ color: 'black', fontWeight: 'bold', fontSize: width / 17, alignSelf: 'center' }}>
                                        Login Smartwatch
                                    </Animatable.Text>

                                    <>
                                        <Animatable.View animation='fadeInUp' delay={200} style={styleSheet.input1}>
                                            <Icon name='mail-outline' size={24} style={styleSheet.icon} />
                                            <TextInput placeholderTextColor={'gray'} onChangeText={(v) => setUsername(v)} style={styleSheet.inputText} placeholder='E-mail' />
                                        </Animatable.View>
                                        <Animatable.View animation='fadeInUp' delay={400} style={styleSheet.input2}>
                                            <Icon name='lock-closed-outline' size={24} style={styleSheet.icon2} />
                                            <TextInput placeholderTextColor={'gray'} secureTextEntry={hidePass} onChangeText={(v) => setpassword(v)} style={styleSheet.inputText2} placeholder='Password' />
                                            <TouchableOpacity onPress={() => {
                                                !hidePass ? sethidePass(true) : sethidePass(false)
                                                Eye == 'eye-off' ? setEye('eye') : setEye('eye-off')
                                            }}>
                                                <Icon name={Eye} size={20} />
                                            </TouchableOpacity>
                                        </Animatable.View>
                                    </>



                                </View>
                            </ImageBackground>
                        </LinearGradient>

                    </View>
                    {!ShowServer &&
                        <>

                            <TouchableOpacity style={styleSheet.btnLogin} onPress={() => doLogin()}>
                                {!Loading && <Text style={styleSheet.textLogin}>LOGIN</Text>}
                                {Loading && <ActivityIndicator size='large' color='white' />}
                            </TouchableOpacity>

                            {/* <TouchableOpacity onPress={() => props.navigation.push('ForgotPass')}>
                        <Text style={{ fontWeight: 'bold', color: 'orange' }}>Forgot Password ?</Text>
                    </TouchableOpacity> */}

                            <View style={{ alignItems: 'center', marginTop: 30, width: width / 1.3 }}>
                                <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 15, textAlign: 'center' }}>Penerapan Machine Learning </Text>
                                <Text style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>Pada Deteksi  Tingkat Kantuk Pengemudi Berbasis Jam Tangan Pintar Melalui Analisis Heart Rate Variability (HRV)</Text>
                            </View>
                        </>

                    }
                    {ShowServer &&
                        <>

                            <TouchableOpacity style={styleSheet.btnLogin} onPress={() => {
                                if (SelectServer == '0') return GenService.alertErr('Pilih Router tenant terlebih dahulu')
                                setLoadingSelect(true)
                                ApiServices.GetData('/routers/' + SelectServer + '/set-default-router').then((res) => {
                                    if (res) {
                                        setLoadingSelect(false);
                                        if (Role == 'Agent') {
                                            GenService.saveStorage('userdata', UserData)
                                            GenService.saveStorage('role', Role)
                                            props.navigation.replace('DashboardAgen')
                                        } else {
                                            GenService.saveStorage('userdata', UserData)
                                            GenService.saveStorage('role', Role)
                                            props.navigation.replace('DashboardSubAgen')
                                        }

                                    }
                                })
                            }}>
                                {!Loading && <Text style={[styleSheet.textLogin, { fontWeight: 'bold' }]}>{LoadingSelect ? 'Loading...' : 'Lanjutkan'}</Text>}
                                {Loading && <ActivityIndicator size='large' color='white' />}
                            </TouchableOpacity>
                        </>

                    }

                </SafeAreaView>
            </ScrollView>
        </View>

    );
}

const styleSheet = StyleSheet.create({
    textServer: {
        fontSize: 16, color: 'white', fontWeight: 'bold',
        marginTop: width / 5,
        backgroundColor: LinearColor.Primary(),
        width: width / 1.6,
        alignSelf: 'center',
        textAlign: 'center',

    },
    selectSever: {
        height: 50,
        backgroundColor: 'white',
        width: width / 1.4,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: width / 5,

    },
    register: {
        marginBottom: 20,
        marginTop: -20,
        height: 45,
        width: width / 1.5,
        backgroundColor: LinearColor.blue(),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        elevation: 5
    },
    btnLogin: {
        height: 50,
        top: -30,
        width: width / 1.5,
        backgroundColor: 'black',
        elevation: 4,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textLogin: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    icon: {
        marginHorizontal: 10,
        color: 'gray'
    },
    icon2: {
        marginHorizontal: 10,
        color: 'gray'
    },
    input1: {
        top: 30,
        height: 50,
        backgroundColor: '#F7F8F8',
        borderRadius: 15,
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input2: {
        top: 40,
        height: 50,
        // width : '100%',
        backgroundColor: '#F7F8F8',
        borderRadius: 15,
        flexDirection: 'row',
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputText: {
        color: 'gray',
        width: '100%',
    },
    inputText2: {
        color: 'gray',
        width: '95%',
    },
    MainContainer: {
        flex: 1,
        alignItems: 'center',
    },

    subContainer: {
        height: 530,
        width: '100%',
        transform: [{ scaleX: 2 }],
        borderBottomStartRadius: 200,
        borderBottomEndRadius: 200,
        overflow: 'hidden',

    },

    childView: {
        flex: 1,
        transform: [{ scaleX: 0.5 }],
        backgroundColor: LinearColor.Primary(),
        justifyContent: 'center',
        alignItems: 'center',
        // paddingHorizontal: 40
    },

    text: {
        fontSize: 28,
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },

});