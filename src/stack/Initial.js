import React from 'react'
import {NetInfo} from 'react-native'
import {isSignedIn} from '../const/Auth'
import { NavigationActions } from 'react-navigation'

import { Platform } from 'react-native'
class Initial extends React.Component{
    static navigationOptions = ({ navigation }) => ({
     header:null
    });
    constructor(props){
        super(props)
    }

    componentDidMount(){  
        this.cekNet()
    }
    cekNet(){
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
            if(connectionInfo !== 'none'){
                isSignedIn().then(res=>{
                    this.navigate(res ? 'Tab' : 'Login')
                })
            }
          });
          function handleFirstConnectivityChange(connectionInfo) {
            console.log('First change, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
            NetInfo.removeEventListener(
              'connectionChange',
              handleFirstConnectivityChange
            );
            if(connectionInfo.type == 'none'){
                alert('Connection Lost')
            }
          }
          NetInfo.addEventListener(
            'connectionChange',
            handleFirstConnectivityChange
          );
    }
    navigate(routeName){
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName})]
        })
        this.props.navigation.dispatch(resetAction)
    }
    render(){
     return null
    }
}
export default Initial