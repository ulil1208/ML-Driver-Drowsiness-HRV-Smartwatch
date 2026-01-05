import React from 'react'
import { View, Text } from 'react-native'
import LottieView from 'lottie-react-native'

const Loader = (props: any) => {
    return (
        <View style={{ alignSelf: 'center' }}>
            <LottieView
                source={require('../assets/2-loading.json')}
                style={{ width: 70, height: 70,marginTop:50,marginBottom:50,alignSelf:'center'}}
                autoPlay
                loop
            />
            <Text style={{ fontSize: 20, alignSelf: 'center', fontWeight: 'bold', color: 'white' }}>{props.text}</Text>
        </View>
    )
}

export default Loader
