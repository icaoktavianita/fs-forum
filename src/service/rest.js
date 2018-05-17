import { AsyncStorage } from 'react-native';
import CONFIG from '../const/Config';
import axios from 'axios';
import RNFetchBlob from 'react-native-fetch-blob';
function setHeaderToken(){
 return new Promise((resolve,reject)=>{
  AsyncStorage.getItem(CONFIG.AUTH).then(val=>{
   if(val){
    val = JSON.parse(val)
    axios.defaults.headers.get['Accept'] = 'application/json';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.headers.post['Accept'] = 'application/json';
    axios.defaults.headers.delete['Content-Type'] = 'application/json';
    axios.defaults.headers.delete['Accept'] = 'application/json';
    axios.defaults.headers.put['Content-Type'] = 'application/json';
    axios.defaults.headers.put['Accept'] = 'application/json';
    resolve(val.token)
   }else{
     resolve()
   }
  }).catch(err=>{
   reject()
  })

 })
}
export const post = (url,Body) => {
  return new Promise((resolve,reject)=>{
    setHeaderToken().then(()=>{
      return axios.post(url,Body)
    })
    .then(res=>{
      resolve(res)
    })
    .catch(err=>{
      reject(err)
    })
  })
};

export const postENA = (url) => {
  return (
    {"method": "POST",
    "path": url,
    "headers": {
        "accept": "application/json",
        "content-type": "application/json"
    }}
  )
}


export const get = (url) => {
  return new Promise((resolve, reject)=>{
    setHeaderToken().then(()=>{
      return axios.get(url)
    })
    .then(res=>{
      resolve(res.data)
    })
    .catch(err=>{
      reject(err)
    })
  })
};
export const put = (url,data) => {
  return new Promise((resolve,reject)=>{
    setHeaderToken().then(()=>{
      return axios.put(url,data)
    })
    .then(res=>{
      resolve(res.data)
    })
    .catch(err=>{
      reject(err)
    })
  })
};

export const putENA = (url) => {
  return (
    {
      "method": "PUT",
      "path": url,
      "headers": {
          "accept": "application/json",
          "content-type": "application/json"
      }
    }
  )
}

export const del = (url) => {
  return new Promise((resolve,reject)=>{
    setHeaderToken().then(()=>{
      return axios.delete(url)
    })
    .then(res=>{
      resolve(res.data)
    })
    .catch(err=>{
      reject(err)
    })
  })
};
export const upload =(url,param) => {
  return new Promise((resolve,reject)=>{
      setHeaderToken()
      .then(token=>{
        return RNFetchBlob.fetch('POST', url, {Authorization :token,'Content-Type' : 'multipart/form-data'},param)
      })
      .then((res) => {
        console.log(res.json())
        resolve(res.json())
      })
      .catch((err) => {
        reject(err)
        // error handling ..
      })
    })
}
export const sendPushNotif = (data) => {
  fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
          'Authorization': CONFIG.FIREBASE_KEY,
          'Content-Type': 'application/json',
      },
      body: data
  });
}