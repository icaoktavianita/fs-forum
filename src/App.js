import React from 'react'
import { TabNavigator, StackNavigator, DrawerNavigator } from 'react-navigation'
import { Dimensions, View, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import IOSIcon from "react-native-vector-icons/Ionicons";
import Styles from './const/Styles'
import Colors from './const/Colors'
//TAB
import Home from './tab/Home'
import Profile from './tab/Profile'
//STACK
import Detail from './stack/Detail'
import Login from './stack/Login'
import Initial from './stack/Initial'
import CreateDiscussion from './stack/CreateDiscussion'
import CreateCategory from './stack/CreateCategory'
import ChangePassword from './stack/ChangePassword'
import ImagePreview from './stack/ImagePreview'
import ProfileUser from './stack/ProfileUser'
import styles from 'react-native-simple-markdown/styles';
require('node-libs-react-native/globals');

const { width: viewPortWidth, height: viewPortHeight } = Dimensions.get('window')


const TabScreenNavigator = TabNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      header: null,
      tabBarIcon: ({ tintColor }) => (
        <Icon name='home' size={22} color={tintColor} type='font-awesome'/>
    )
    }
  },
  Profile: { 
    screen: Profile,
    navigationOptions: {
      tabBarIcon:({tintColor}) =>(
        <Icon name='user' size={22} color={tintColor} type='font-awesome'/>
      ),
      header: null
    }
  },
},
  {
    initialRouteName: 'Home',
    swipeEnabled: false,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    tabBarOptions: {
      activeTintColor: Colors.primary,
      inactiveTintColor: Colors.inactive,
      tabStyle: {
        height: 50,
        padding: 5
      },
      indicatorStyle: Styles.indicatorStyle,
      style: Styles.tabStyle,
      showLabel: false,
      showIcon: true
    }
  });

const App = StackNavigator({

  Tab: { screen: TabScreenNavigator },
  Initial: { screen: Initial },
  Login: {
    screen: Login,
    navigationOptions: {
      header: null
    }
  },
  Detail: { 
    screen: Detail,
    navigationOptions: ({ navigation }) => ({
      title: "Detail Discussion",
      headerLeft: CustomNavButton(navigation)
    })
  },
  Discussion: {
    screen: CreateDiscussion,
    navigationOptions: ({ navigation }) => ({
      title: "Create Discussion",
    })
  },
  Category: {
    screen: CreateCategory,
    navigationOptions: ({ navigation }) => ({
      title: "Create Category",
    })
  },
  ChangePassword: {
    screen: ChangePassword, 
    navigationOptions: {
      header: null
    }
  },
  ChangePasswordStack: {
    screen: ChangePassword,
    navigationOptions: {
      headerStyle: Styles.transparentHeader
    }
  },
  ImagePreview: {
    screen: ImagePreview
  },
  ProfileUser: {
    screen: ProfileUser,
    navigationOptions: ({ navigation }) => ({
      title: "Profile",
    })
  }
},
  {
    animationEnabled: false,
    initialRouteName: 'Initial'
  });


const homeStack = App.router.getStateForAction;
App.router.getStateForAction = (action, state) => {
  if (state && action.type === 'ReplaceCurrentScreen') {
    const routes = state.routes.slice(0, state.route.length - 1);
    routes.push(action);
    return {
      ...state,
      routes,
      index: routes.length - 1,
    }
  }
  return homeStack(action, state);
}

App.navigationOptions = {
  headerStyle: { backgroundColor: Colors.white },
  headerTitleStyle: Styles.headerTitleStyle,
  headerTintColor: Colors.primary,
}

TabScreenNavigator.navigationOptions = {
  headerStyle: Styles.primaryHeader,
  headerTintColor: Colors.white,
  title: 'PROFILE',
  headerTitleStyle: Styles.marginLeft100
};
export const CustomNavButton = (navigation) => {
  const { constainerStyle } = styles
  return (
    <View >
      <TouchableOpacity onPress={() => navigation.navigate('Home',{url:true})}>
        <IOSIcon name='ios-arrow-back-outline' size={35} style={{padding: 15, color: Colors.primary}} />
      </TouchableOpacity>
    </View>
  )
}
export default App;
