import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    Alert,
    NetInfo,
    FlatList,
    ScrollView,
    AsyncStorage,
    ToastAndroid,
    TouchableOpacity,
    ActivityIndicator,
    DrawerLayoutAndroid,
} from 'react-native'
import Swipeout from 'react-native-swipeout'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from 'react-native-modalbox'
import { ListItem, Avatar, Button, CheckBox, List, Icon } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
import NavigationBar from 'react-native-navbar'
import FCM from 'react-native-fcm'
import Accordion from 'react-native-collapsible'
import CONFIG from '../const/Config'
import { get, del, postENA, putENA, post } from '../service/rest'
import API from '../const/Api'
import Colors from '../const/Colors'
import Styles from '../const/Styles'
import Panel from '../components/Panel'
import { cekNet } from '../components/CekNet'

FCM.on('FCMTokenRefreshed', (token) => {
    console.log(token)
});
class Home extends Component {
    constructor(props) {
        super(props);
        this.openDrawer = this.openDrawer.bind(this)
        this.state = {
            data: [],
            category: [],
            loading: true,
            isOpen: false,
            filter: false,
            authentication: '',
            role: '',
            refreshing: true
        }
    }

    openDrawer() {
        if (!this.state.isOpen) {
            this.drawer.openDrawer();
            this.setState({ isOpen: true })
        } else {
            this.drawer.closeDrawer();
            this.setState({ isOpen: false })
        }
    }
    componentDidMount() {
        this.loadInitialState()
        this.fcmPermission()
        cekNet()
    }
    loadInitialState() {
        AsyncStorage.getItem(CONFIG.AUTH).then(val => {
            if (val !== null) {
                value = JSON.parse(val)
                item = value.data
                auth = 'username=' + item.Name + '&timestamp=' + item.TimeStamp + '&token=' + item.Token
                this.setState({ loading: false, authentication: auth, role: item.Role })
                this.getData()
                this.getCategory().then(() => {
                    this.setState({ loading: false })
                }).catch(() => {
                    this.setState({ loading: false })
                })
            }
        })
    }
    fcmPermission() {
        FCM.requestPermissions()
            .then(() => console.log('granted'))
            .catch(() => console.log('notification permission rejected'));
        //Token For each device
        FCM.getFCMToken().then(token => {
        });

        this.notificationListener = FCM.on('FCMNotificationReceived', async (notif) => {
        });
        FCM.getInitialNotification().then(notif => {
            if (notif.targetScreen === 'Detail') {
                this.props.navigation.navigate('Detail', { url: notif.idDiscussion })
            }
        });
        if (this.state.filter) {
            this.getDataByCategory()
        }
    }
    getData() {
        let auth = this.state.authentication
        let url = API.discussions + '?' + auth
        this.setState({ loading: true })
        return new Promise((resolve, reject) => {
            get(url).then(res => {
                var a = res.Announcements
                var b = res.Discussions
                var newData = a.concat(b)
                this.setState({ data: newData, loading: false })
                resolve()
            }).catch(err => {
                reject()
            })
        })
    }
    getDataByCategory(id) {
        this.setState({ loading: true })
        let auth = this.state.authentication
        return new Promise((resolve, reject) => {
            get(API.category + "/" + id + '?' + auth).then(res => {
                var a = res.AnnounceData
                var b = res.Discussions
                var newData = a.concat(b)
                this.setState({ data: newData, loading: false })
                resolve()
            }).catch(err => {
                reject()
            })
        })
    }
    getCategory() {
        let auth = this.state.authentication
        return new Promise((resolve, reject) => {
            get(API.category + '?' + auth).then(res => {
                this.setState({ category: res.Categories })
                resolve()
            }).catch(err => {
                console.log(err)
                reject()
            })
        })
    }
    confirmDelete(item, index) {
        Alert.alert(
            'Want to delete this?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => this._delete(item, index) },
            ],
            { cancelable: false }
        )
    }
    deleteDiscussion(item, index) {
        let auth = this.state.authentication
        del(API.discussions + '/' + item.DiscussionID + '?' + auth)
            .then(res => {
                this.setState((prevState) => ({
                    data: prevState.data.filter((_, i) => i !== index)
                }));
                ToastAndroid.show('Discussion deleted', ToastAndroid.SHORT);
            })
            .catch(err => {
                console.log(err)
            })
    }
    confirmDelete(item, index) {
        Alert.alert(
            'Want to delete this?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => this.deleteDiscussion(item, index) },
            ],
            { cancelable: false }
        )
    }
    confirmClose(item, index) {
        Alert.alert(
            'Want to close this discussion?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => this.closeDiscussion(item, index) },
            ],
            { cancelable: false }
        )
    }
    closeDiscussion(item, index) {
        var http = require("http");
        let auth = this.state.authentication
        var options = postENA(API.discussions + "/" + item.DiscussionID + "/close?" + auth)

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                ToastAndroid.show('Discussion Closed', ToastAndroid.SHORT);
            })
        })

        req.write(JSON.stringify({
        }))
        req.end();
        this.getData()
    }
    confirmReopen(item, index) {
        Alert.alert(
            'Want to open this discussion?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => this.reOpenDiscussion(item, index) },
            ],
            { cancelable: false }
        )
    }
    reOpenDiscussion(item, index) {
        var http = require("http");
        let auth = this.state.authentication
        var options = postENA(API.discussions + "/" + item.DiscussionID + "/open?" + auth)

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                ToastAndroid.show('Discussion Reopened', ToastAndroid.SHORT);
            })
        })

        req.write(JSON.stringify({
        }))
        req.end();
        this.getData()
    }
    confirmBookmark(item, index) {
        Alert.alert(
            'Want to bookmark this discussion?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'YES', onPress: () => this.bookmarkDiscussion(item, index) },
            ],
            { cancelable: false }
        )
    }
    bookmarkDiscussion(item, index) {
        var http = require("http");
        let auth = this.state.authentication
        var options = postENA(API.discussions + "/" + item.DiscussionID + "/bookmark?" + auth)

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                
            })
        })

        req.write(JSON.stringify({
        }))
        req.end();
        this.getData()
        ToastAndroid.show('Discussion Bookmark', ToastAndroid.SHORT);
    }
    confirmUnBookmark(item, index) {
        Alert.alert(
            'Want to unbookmark this discussion?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'YES', onPress: () => this.unBookmarkDiscussion(item, index) },
            ],
            { cancelable: false }
        )
    }
    unBookmarkDiscussion(item, index) {
        var http = require("http");
        let auth = this.state.authentication
        var options = postENA(API.discussions + "/" + item.DiscussionID + "/unbookmark?" + auth)

        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                ToastAndroid.show('Discussion UnBookmark', ToastAndroid.SHORT);
            })
        })
        req.write(JSON.stringify({
        }))
        req.end();
        this.getData()
    }
    toTab(item) {
        var http = require("http");
        let auth = this.state.authentication
        var options = putENA(API.discussions + "/" + item.DiscussionID + '?' + auth)
        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
            })
        })

        req.write(JSON.stringify({
            Name: item.Name,
            Body: item.Body,
            CountViews: item.CountViews + 1,
            CountUnreadComments: 0,
        }))
        req.end();
        this.props.navigation.navigate('Detail', { url: item.DiscussionID })
    }
    logout = () => {
        Alert.alert(
            'Do you want to sign out?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => this.confirm() },
            ],
            { cancelable: false }
        )
    }
    confirm() {
        AsyncStorage.removeItem(CONFIG.AUTH).then(() => {
            this.setState({ loading: false })
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Login' })]
            })
            this.props.navigation.dispatch(resetAction)
        })
    }
    refreshData() {
        this.setState({ refreshing: true })
        this.getData().then(() => {
            this.setState({ refreshing: false })
        }).catch(() => {
            this.setState({ refreshing: false })
        })
    }
    renderItem({ item, index }) {
        let adminSwipe = [
            {
                backgroundColor: Colors.red,
                underlayColor: Colors.redActive,
                component: <View style={Styles.swipeoutItem}><Icon name='trash' color={Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>Delete</Text></View>,
                onPress: () => this.confirmDelete(item, index)
            },
            {
                backgroundColor: Colors.green,
                underlayColor: Colors.redActive,
                component: <View style={Styles.swipeoutItem}><Icon name={item.Closed == 1 ? 'unlock' : 'lock'} color={Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>{item.Closed == 1 ? 'Re-open' : 'Close'}</Text></View>,
                onPress: () => { item.Closed == 1 ? this.confirmReopen(item, index) : this.confirmClose(item, index) }
            },
            {
                underlayColor: Colors.redActive,
                component: <View style={Styles.swipeoutItem}><Icon name='bookmark' color={item.Bookmarked == 1 ? Colors.orange : Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>{item.Bookmarked == 1 ? 'Unbookmark' : 'Bookmark'}</Text></View>,
                onPress: () => { item.Bookmarked == 1 ? this.confirmUnBookmark(item, index) : this.confirmBookmark(item, index) }
            }
        ]
        let hrdSwipe = [
            {
                backgroundColor: Colors.green,
                underlayColor: Colors.redActive,
                component: <View style={Styles.swipeoutItem}><Icon name='lock' color={Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>Close</Text></View>,
                onPress: () => this.confirmClose(item, index)
            },
            {
                underlayColor: Colors.redActive,
                component: <View style={Styles.swipeoutItem}><Icon name='bookmark' color={item.Bookmarked == 1 ? Colors.orange : Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>{item.Bookmarked == 1 ? 'Unbookmark' : 'Bookmark'}</Text></View>,
                onPress: () => { item.Bookmarked == 1 ? this.confirmUnBookmark(item, index) : this.confirmBookmark(item, index) }
            }
        ]
        let memberSwipe = [{
            underlayColor: Colors.redActive,
            component: <View style={Styles.swipeoutItem}><Icon name='bookmark' color={item.Bookmarked == 1 ? Colors.orange : Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>{item.Bookmarked == 1 ? 'Unbookmark' : 'Bookmark'}</Text></View>,
            onPress: () => { item.Bookmarked == 1 ? this.confirmUnBookmark(item, index) : this.confirmBookmark(item, index) }
        }]
        let role = this.state.role
        let superuser = role.includes('SUPERUSER')
        let admin = role.includes('admin')
        return (
            <View style={Styles.containerSwipeout}>
                <Swipeout autoClose={true}
                    right={superuser == true ? adminSwipe : admin == true ? hrdSwipe : memberSwipe}>
                    <ListItem
                        roundAvatar
                        containerStyle={{ backgroundColor: Colors.white, borderBottomWidth: 0.5 }}
                        avatar={{ uri: item.FirstPhoto }}
                        label={
                            <View>
                                {
                                    item.CountUnreadComments == 0 ? null : <Icon name='circle' color={Colors.blue} size={15} type='font-awesome' />
                                }
                                <Text style={Styles.font10}>{item.Category}</Text>
                            </View>
                        }
                        title={item.Name}
                        titleStyle={Styles.bold14}
                        subtitle={
                            <View style={Styles.marginLeft10}>
                                <View style={Styles.flexRow} >
                                    <Text style={Styles.font10}>{item.FirstName} </Text>
                                    <Text style={Styles.font10}>{item.DateInserted}</Text>
                                </View>
                                <View style={Styles.flexRowTop10}>
                                    <Text style={Styles.font10}>{item.CountViews} <MaterialCommunityIcons name='eye-outline' size={12} /></Text>
                                    <Text style={Styles.iconItem}>{item.CountComments} <MaterialCommunityIcons name='comment-text-outline' size={10} /></Text>
                                    {item.Closed == 1 ? <Text style={Styles.iconItem}><MaterialCommunityIcons name='lock' size={12} /></Text> : null}
                                    {item.Bookmarked == 1 ? <Text style={Styles.iconItem}><MaterialCommunityIcons name='bookmark' size={12} color={Colors.orange} /></Text> : null}
                                </View>
                            </View>
                        }
                        subtitleStyle={{}}
                        key={index}
                        hideChevron={true}
                        //onPress={() => this.toTab(item)}
                        onPress={()=>this.props.navigation.navigate('ProfileUser', { url: item.userID })}
                    />
                </Swipeout>
            </View>
        )
    }
    render() {
        if (this.state.loading) {
            return (
                <View style={[Styles.activityIndicator, Styles.horizontal]}>
                    <ActivityIndicator color={Colors.spinner} />
                </View>
            )
        }
        var cat = []
        var categories = this.state.category
        for (category in categories) {
            var topic = (categories[category].Name).replace(/\s/g, "");
            FCM.subscribeToTopic(topic);
            var arrs = categories[category].ChildIDs
            if (arrs.length > 0) {
                var ini = []
                for (arr in arrs) {
                    var index = arrs[arr];
                    ini.push(
                        <Text style={Styles.navigationView} onPress={this.getDataByCategory.bind(this, index)}>{categories[index].Name}</Text>
                    )
                }
                cat.push(
                    //buat onpress ini, soalnya ada beberapa discussion dengan categori ini
                    <Panel title={categories[category].Name} onPress={this.getDataByCategory.bind(this)}>
                        <View style={Styles.flexColumn}>
                            {ini}
                        </View>
                    </Panel>
                )
            } else if (categories[category].ParentCategoryID == -1) {
                cat.push(
                    <ListItem
                        containerStyle={Styles.categoryContainer}
                        title={categories[category].Name}
                        titleStyle={{ color: Colors.primary }}
                        hideChevron={true}
                        onPress={this.getDataByCategory.bind(this, categories[category].CategoryID)}
                    />
                )
            }
        }
        let role = this.state.role
        let superuser = role.includes('SUPERUSER')
        let admin = role.includes('admin')
        var navigationView = (
            <View>
                <TouchableOpacity>
                    {
                        admin == true &&
                        <View>
                            <Text style={Styles.navigationView} onPress={() => { this.props.navigation.navigate('Discussion') }} >Create Discussion</Text>
                            <Text style={Styles.navigationView} onPress={() => { this.props.navigation.navigate('Category') }} >Create Category</Text>
                        </View>
                        || superuser == true &&
                        <View>
                            <Text style={Styles.navigationView} onPress={() => { this.props.navigation.navigate('Discussion') }} >Create Discussion</Text>
                            <Text style={Styles.navigationView} onPress={() => { this.props.navigation.navigate('Category') }} >Create Category</Text>
                        </View>
                    }

                    <Text style={Styles.navigationView} onPress={() => this.getData()}>All Category</Text>
                    <ScrollView>
                        {cat}
                    </ScrollView>
                    <Text style={Styles.navigationView} onPress={() => { this.props.navigation.navigate('ChangePassword', { url: item.Name })}}>Change Password</Text>
                    <Text style={Styles.navigationView} onPress={() => this.logout()}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        );
        
        return (
            <View style={{ flex: 1, backgroundColor: Colors.white }}>
                <NavigationBar
                    title={{ title: 'WALL OF HOLDING', style: Styles.header }}
                    containerStyle={Styles.navigationBarContainer}
                    leftButton={
                        <Icon name='view-headline' size={35} color="#fff" type='material-community' iconStyle={Styles.leftIcon} onPress={()=>this.openDrawer()} underlayColor='transparent'/>
                    }
                />
                <DrawerLayoutAndroid
                    drawerWidth={250}
                    ref={(_drawer) => this.drawer = _drawer}
                    drawerPosition={DrawerLayoutAndroid.positions.Left}
                    renderNavigationView={() => navigationView}>
                    <View >
                        <FlatList
                            extraData={this.state}
                            data={this.state.data}
                            keyExtractor={(key, i) => i}
                            renderItem={(item, index) => this.renderItem(item, index)}
                            refreshing={false}
                            onRefresh={() => this.refreshData()}
                            ListEmptyComponent={<Text style={Styles.emptyBookmark}>Discussion in this category is empty</Text>}
                        />

                    </View>
                </DrawerLayoutAndroid>

            </View>
        )
    }

    componentWillUnmount() {
        this.notificationListener.remove();
    }
}
export default Home