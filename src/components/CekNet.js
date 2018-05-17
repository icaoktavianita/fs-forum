import { NetInfo } from 'react-native'

export const cekNet = () => {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
        console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
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
  };