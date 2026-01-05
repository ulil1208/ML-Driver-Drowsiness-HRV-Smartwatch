import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, StatusBar, Dimensions, Image, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import { LinearColor } from '../components/Colors';
import * as Animatable from 'react-native-animatable';
import { GenService } from '../services/gen/GenServices';

const { width, height } = Dimensions.get('screen');




const Welcome = (props: any) => {
    const [Loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
           
            GenService.getStorage('token').then((res) => {
                setLoading(false)
                if (res != null) {
                    console.log(`res`, res);
                    props.navigation.replace('Dashboard')
                    
                }
            })
        }, 1500);
        
    }, [])
    return (
        <LinearGradient start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} colors={LinearColor.LightGradien()} style={{ flex: 1 }}>
            <StatusBar translucent backgroundColor='transparent' />
            <ImageBackground source={require('../assets/imgs/seamless_putih.png')} 
                resizeMode="repeat" style={{ flex:1 }}>
                <View style={styles.container1}>
                    <Animatable.Image animation='fadeInUp' source={require('../assets/imgs/smart.png')} style={styles.logo} />
                    <Animatable.Text animation='fadeInUp' delay={200} style={[styles.textLogo,{textAlign:'center',fontSize:17}]}>Penerapan Machine Learning pada Deteksi  Tingkat Kantuk Pengemudi Berbasis Jam Tangan Pintar Melalui Analisis Heart Rate Variability (HRV)</Animatable.Text>
                    <Animatable.Text animation='fadeInUp' delay={300} style={[styles.textLogo,{fontSize:14}]}>Smartwatch </Animatable.Text>
                </View>
                <View style={styles.container2}>
                    <TouchableOpacity onPress={() => props.navigation.replace('Login')} style={styles.btn}>
                        <View >
                            <Text style={styles.textBtn}>
                                {Loading? <ActivityIndicator size={30} color={'white'}/>:'MULAI'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </LinearGradient>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container1: {
        flex: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container2: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btn: {
        backgroundColor: 'black',
        height: 50,
        width: width / 2,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',

    },
    textBtn: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold'
    },
    textLogo: {
        color: 'black',
        fontSize: 25,
        fontWeight: 'bold'
    },
    logo: {
        resizeMode: 'contain',
        width: width / 2,
        height: width / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        marginBottom:20
    }
})
