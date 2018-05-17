import Colors from './Colors'
import { Dimensions } from 'react-native'
const { width: viewPortWidth, height: viewPortHeight } = Dimensions.get('window')
export default {
    //UNIVERSAL
    font10: {
        fontSize: 10
    },
    font12: {
        fontSize: 12
    },
    marginTop20: {
        marginTop: 20,
    },
    marginLeft10: {
        marginLeft: 10
    },
    marginTop100: {
        marginTop: 100
    },
    flexColumn: {
        flex: 1, 
        flexDirection: 'column'
    },
    flexRow: {
        flex: 1,
        flexDirection: 'row'
    },
    flexRowTop10: {
        flexDirection: 'row', 
        marginTop: 10
    },
    margin1010: {
        marginLeft: 10, 
        marginTop: 10
    },
    bold14: {
        fontWeight: 'bold', 
        fontSize: 14
    },
    justify12: {
        textAlign: 'justify', 
        fontSize: 12
    },
    spaceBetween: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 10
    },
    line: {
        backgroundColor: Colors.line, 
        padding: 0.7, 
        marginTop: 5
    },
    buttonSend: {
        height: 35, 
        borderRadius: 3
    },
    activityIndicator: {
        flex: 1, 
        justifyContent: 'center'

    },
    horizontal: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 100
    },
    //APP
    indicatorStyle: {
        borderBottomColor: Colors.white,
        borderBottomWidth: 0,
        backgroundColor: Colors.white
    },
    tabStyle: {
        borderTopWidth: 0.3,
        backgroundColor: Colors.white
    },
    headerTitleStyle: {
        width: viewPortWidth - 80, 
        alignSelf: 'center'
    },
    primaryHeader: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
      },
    //LOGIN
    bigTitle: {
        fontSize: 20, 
        alignSelf: 'center', 
        color: Colors.white
    },
    loginView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 30
    },
    buttonLogin: {
        marginLeft: 35, 
        marginRight: 35, 
        borderRadius: 3
    },
    //HOME
    header: {
        color: Colors.white, 
        fontSize: 20, 
        alignSelf: 'center', 
        marginTop: 20
    },
    leftIcon: {
        marginLeft: 20,
        marginTop: 20
    },
    rightIcon: {
        marginRight: 10,
        marginTop: 20
    },
    navigationBarContainer: {
        height: 60, 
        backgroundColor: Colors.primary
    },
    navigationView: {
        margin: 10, 
        fontSize: 15, 
        textAlign: 'left',
        color: Colors.primary
    },
    categoryContainer: {
        marginLeft:-10,
        borderBottomWidth: 0
    },
    activityIndicator: {
        flexDirection:'column', 
        padding: 150
    },
    iconItem: {
        marginLeft: 15, 
        fontSize: 10
    },
    avatarItem: {
        width: 40, 
        height: 40, 
        borderRadius: 100, 
        alignSelf: 'flex-end'
    },
    containerSwipeout: {
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(0,0,0,0.15)',
    },
    swipeoutItem: {
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1
    },
    swipeoutText: {
        color: '#fff', 
        fontSize: 12
    },
    //PROFILE
    buttonLogout: {
        borderRadius:5, 
        marginLeft: 35, 
        marginRight: 35,
        marginTop: 50
    },
    nameProfile: {
        fontSize: 20, 
        color: Colors.black, 
        marginTop: 20
    },
    profileText: {
        fontSize: 10, 
        color: Colors.black
    },
    emptyBookmark: {
        fontSize: 18,
        padding: 20,
        color: Colors.line,
        alignSelf: 'center'
    },
    //COMMENT
    commentName: {
        flexDirection: 'column', 
        marginLeft: 10
    },
    commentBody: {
        textAlign: 'justify', 
        fontSize: 12
    },
    commentContainer: {
        padding: 5,
        margin:5, 
        borderWidth:0.5, 
        borderColor:'#b9bcb7', 
        backgroundColor:'white',
        borderRadius:3
    },
    commentNameRow: {
        flexDirection: 'row', 
        marginBottom: 5
    },
    transparentHeader: {
        position: 'absolute',
        backgroundColor: 'transparent',
        zIndex: 100,
        top: 0,
        left: 0,
        right: 0,
        borderBottomWidth:0,
        elevation:0,
      },
      customSlide: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      },
      customImage: {
        width: 100,
        height: 100,
      },
      textinput:{
        padding:5,
        marginTop:20,
        height:45,
        borderColor:'#d6d7da',
        borderWidth: 1,
        borderRadius: 3,
      }
}

//lanjutin yang detail