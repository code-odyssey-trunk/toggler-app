import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, AppState, ActivityIndicator, Platform, NativeModules, PermissionsAndroid} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import Geolocation from '@react-native-community/geolocation';

const showSecurityScreenFromAppState = appState =>
  ['background', 'inactive'].includes(appState)

export default class TogglerApp extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            toggleStatus: 0,
            IMEI: '',
            deviceName: '',
            MACAddress: '',
            location: '',
            publicIp: '',
            screenShotStatus: 'unlock',
            showSecurityScreen: showSecurityScreenFromAppState(AppState.currentState)
        }
    }

   async activateScreenShot(){
        this.setState({
            toggleStatus: 2
        })

        if(Platform.OS == 'android'){
            //ALLOW SCREENSHOT
            await NativeModules.PreventScreenshotModule.allow();
            let dataID = await AsyncStorage.getItem('dataID')
            if(dataID != null){
                //UPDATE DEVICE INFO API IF NOT FIRST TIME
                await this.updateDeviceInfo('unlock', dataID)
            }else{
                //INSERT DEVICE INFO API BECAUSE FIRST TIME
                await this.submitDeviceInfo('unlock')
            }
        }

        this.setState({
            toggleStatus: 1,
            screenShotStatus: 'unlock'
        })
    }

    async deactivateScreenShot(){
        this.setState({
            toggleStatus: 2
        })

        if(Platform.OS == 'android'){
            //DO NOT ALLOW SCREENSHOT
            await NativeModules.PreventScreenshotModule.forbid();
            let dataID = await AsyncStorage.getItem('dataID')
            //UPDATE DEVICE INFO API
            await this.updateDeviceInfo('lock', dataID)
        }

        this.setState({
            toggleStatus: 0,
            screenShotStatus: 'lock'
        })
    }

    async submitDeviceInfo(screenShotStatus){
        const {IMEI, deviceName, MACAddress, location, publicIp} = this.state
        try{
            await fetch('https://5f903120e0559c0016ad63b8.mockapi.io/api/v1/deviceinfo', {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    IMEI,
                    deviceName,
                    MACAddress,
                    location,
                    publicIp,
                    screenShotStatus
                }),
            }).then(response => response.json())
            .then(data => 
                AsyncStorage.setItem('dataID', data.id.toString())
            );
        }
        catch (error) {
            console.error('CATCH', error);
        }   
    }

    async updateDeviceInfo(screenShotStatus, dataID){
        const {IMEI, deviceName, MACAddress, location, publicIp} = this.state
        try{
            await fetch('https://5f903120e0559c0016ad63b8.mockapi.io/api/v1/deviceinfo/'+dataID, {
                method: 'PUT',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    IMEI,
                    deviceName,
                    MACAddress,
                    location,
                    publicIp,
                    screenShotStatus
                }),
            })
        }
        catch (error) {
            console.error('CATCH', error);
        }   
    }

    async requestLocationPermissions(){
        try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: "Toggler App Location Permission",
                message:
                  "Toggler App needs access to your Location ",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              Geolocation.getCurrentPosition(info => 
                this.setState({location: info.coords})
                );
            } else {
              console.log("Location permission denied");
            }
          } catch (err) {
            console.warn(err);
          }
    }

    async componentDidMount(){
        // AsyncStorage.removeItem('dataID')
        //GET EACH DEVICE INFO FROM NATIVE MODULES ONE BY ONE

        if(Platform.OS == 'android'){
            var DeviceInfo = await NativeModules.DeviceInfoGet;
            DeviceInfo.getDeviceID((err, deviceID) => {
                if (err) {
                    // error
                    console.log(err);
                } else {
                    this.setState({
                        IMEI: deviceID
                    })
                }
            })

            DeviceInfo.getDeviceName((err, deviceName) => {
                if (err) {
                    // error
                    console.log(err);
                } else {
                    this.setState({
                        deviceName
                    })
                }
            })

            DeviceInfo.getMac((err, MACAddress) => {
                if (err) {
                    // error
                    console.log(err);
                } else {
                    this.setState({
                        MACAddress
                    })
                }
            })

            DeviceInfo.getIP((err, publicIp) => {
                if (err) {
                    // error
                    console.log(err);
                } else {
                    this.setState({
                        publicIp
                    })
                }
            })

            this.requestLocationPermissions()
        }else{
            AppState.addEventListener('change', this.onChangeAppState)
        }
    }

    componentWillUnmount () {
        if(Platform.OS == 'ios'){
            AppState.removeEventListener('change', this.onChangeAppState)
        }
    }

      onChangeAppState = nextAppState => {
        const showSecurityScreen = showSecurityScreenFromAppState(nextAppState)
  
        this.setState({ showSecurityScreen })
      }  

    render(){
        const {toggleStatus} = this.state
        return(
            <View style={styles.container}>
                {(this.state.showSecurityScreen && Platform.OS == 'ios') ? (
                    <View/>
                ) : (
                <View>
                    <Image
                        source={require('./assets/images/logo.png')}
                        style={styles.logo}
                    />

                    {toggleStatus == 0 && (
                        <TouchableOpacity
                            onPress={this.activateScreenShot.bind(this)}
                            style={styles.buttonActivate}
                        >
                            <View style={{
                                width: 20,
                                height: 20,
                                borderRadius: 20/2,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Image
                                    source={require('./assets/images/up-arrow.png')}
                                    style={styles.buttonIcon}
                                />
                            </View>
                            <Text style={{ color: '#FFF' }} >Activate</Text>
                        </TouchableOpacity>
                    )}

                    {toggleStatus == 1 && (
                        <TouchableOpacity
                            onPress={this.deactivateScreenShot.bind(this)}
                            style={styles.buttonActivated}
                        >
                            <View style={{
                                width: 20,
                                height: 20,
                                borderRadius: 20/2,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Image
                                    source={require('./assets/images/tick.png')}
                                    style={styles.buttonIcon}
                                />
                            </View>
                            <Text style={{ color: '#FFF' }} >Activated</Text>
                        </TouchableOpacity>
                    )}

                    {toggleStatus == 2 && (
                        <TouchableOpacity
                            style={styles.buttonActivating}
                        >
                            <View style={{
                                width: 20,
                                height: 20,
                                borderRadius: 20/2,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <ActivityIndicator size="small" color="#FFF" />
                            </View>
                            <Text style={{ color: '#FFF' }} >Waiting</Text>
                        </TouchableOpacity>
                    )}
                </View>
                )}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 10
    },
    buttonActivate: {
        flexDirection: 'row',
        marginTop: 100,
        padding: 10,
        backgroundColor: '#f76363',
        borderRadius: 30,
        width: 110,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    buttonActivated: {
        flexDirection: 'row',
        marginTop: 100,
        padding: 10,
        backgroundColor: '#71de56',
        borderRadius: 30,
        width: 110,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    buttonActivating: {
        flexDirection: 'row',
        marginTop: 100,
        padding: 10,
        backgroundColor: '#f76363',
        borderRadius: 30,
        width: 110,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    buttonIcon: {
        width: 13,
        height: 13,
        borderRadius: 20/2,
    }
})