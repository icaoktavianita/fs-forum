import React, { Component } from 'react'
import {
    View,
    Alert,
    Image,
    FlatList,
    ScrollView,
    AsyncStorage,
    RefreshControl,
    ToastAndroid,
    ActivityIndicator,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native'
import { Button, Avatar, Tile, ListItem, Icon, Divider, Text, Header } from 'react-native-elements'
import Swipeout from 'react-native-swipeout'
import CONFIG from '../const/Config'
import API from '../const/Api'
import Colors from '../const/Colors'
import { get, postENA } from '../service/rest'
import Styles from '../const/Styles'
import { cekNet } from '../components/CekNet'
import { NavigationActions } from 'react-navigation'
import FilePickerManager from 'react-native-file-picker'

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            data: {},
            authentication: '',
            dataDiscussion: [],
            refreshing: false,
            file: undefined,
            photo:undefined
        }
    }
    componentDidMount() {
        this.loadInitialState()
        cekNet()
    }
    loadInitialState() {
        AsyncStorage.getItem(CONFIG.AUTH).then(val => {
            if (val !== null) {
                value = JSON.parse(val)
                item = value.data
                auth = 'username=' + item.Name + '&timestamp=' + item.TimeStamp + '&token=' + item.Token
                this.setState({ loading: true, authentication: auth})
                this.getData()
                this.getListData().then(() => {
                    this.setState({ loading: false })
                }).catch(() => {
                    this.setState({ loading: false })
                })
            }
        })
    }
    getData() {
        let url = API.profile + '?id=' + item.UserID
        return new Promise((resolve, reject) => {
            get(url).then(res => {
                this.setState({ data: res, photo:"http://182.23.96.84:8182/forum/uploads/"+res.Photo})
                resolve()
            }).catch(err => {
                console.log(err)
                reject()
            })
        })
    }
    getListData() {
        let auth = this.state.authentication
        let url = API.discussions + '/bookmarks?' + auth
        return new Promise((resolve, reject) => {
            get(url).then(res => {
                this.setState({ dataDiscussion: res.Discussions })
                resolve()
            }).catch(err => {
                console.log(err)
                reject()
            })
        })
    }
    selectFileTapped() {
        const options = {
            title: 'File Picker',
            chooseFileButtonTitle: 'Choose File...'
        };

        FilePickerManager.showFilePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePickerManager Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                this.setState({
                    file: response,
                    loading:true
                });
                this.save()
            }
        });
    }
    save() {
        //Custom Function to upload a file. 
        var dataImage = this.state.file
        let formdata = new FormData();

        formdata.append('image', {
            uri: dataImage.uri,
            name: dataImage.fileName,
            type: dataImage.type
        })
        formdata.append('userName', this.state.data.NIK)
        formdata.append('path', 'pic')

        fetch('http://182.23.96.84:8182/forum/api/fileupload.php', {
            method: 'POST',
            body: formdata,
            headers: {
                'Accept': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if(json.oke){
                this.setState({
                    photo:json.oke
                })
                ToastAndroid.show('Profile picture changed!', ToastAndroid.SHORT);
            }else{
                ToastAndroid.show(json.error, ToastAndroid.SHORT);
            }
            this.setState({
                loading:false
            });
        }).catch(err => {
            this.setState({
                loading:false
            });
        })
    }
    confirmUnbookmark(item, index) {
        Alert.alert(
            'Want to unbookmark this discussion?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => this.unBookmarkDiscussion(item, index) },
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

            })
        })
        req.write(JSON.stringify({
        }))
        req.end();
        this.setState((prevState) => ({
            dataDiscussion: prevState.dataDiscussion.filter((_, i) => i !== index)
        }));
        ToastAndroid.show('Discussion UnBookmark', ToastAndroid.SHORT);
        this.getData()
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
    renderHeader() {
        const user = this.state.data
        const date = user.DateFirstVisit
        return (
            <View>
                <Text h4 style={{ margin: 15 }}>Profile</Text>
                <Divider style={{ backgroundColor: Colors.line, height: 20 }} />
                <View style={{ margin: 10, flexDirection: 'row' }}>
                    {this.state.loading==false ?
                        user.Photo == null ? <Icon reverse color={Colors.line} name='user' type='font-awesome' onPress={()=>this.selectFileTapped()}/> : 
                        <Avatar rounded medium source={{ uri: this.state.photo}} onPress={()=>this.selectFileTapped()}/>
                        : <ActivityIndicator color={Colors.spinner} />
                    }
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 18 }}>{user.Name}</Text>
                        <Text style={{ fontSize: 18 }}>{user.NIK}</Text>
                    </View>
                </View>
                <Divider style={{ backgroundColor: Colors.line, height: 20 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.division} name='sitemap' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Division : {user.Division}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.position} name='star' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Position: {user.Position}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.location} name='map-marker' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Location: {user.Location}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.dateOfBirth} name='calendar' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Date of Birth: {user.DateOfBirth}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.joinDate} name='calendar' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Join Date: {user.JoinDate !== null ? user.JoinDate : '-'}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, height: 20 }} />
            </View>
        )
    }
    renderItem({ item, index }) {
        let swipe = 
            [
                {
                    underlayColor: Colors.redActive,
                    component: <View style={Styles.swipeoutItem}><Icon name='bookmark' color={item.Bookmarked == 1 ? Colors.orange : Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>{item.Bookmarked == 1 ? 'Unbookmark' : 'Bookmark'}</Text></View>,
                    onPress: () => { this.confirmUnbookmark(item, index) }
                }
            ]
        return (
            <View>
                <Swipeout autoClose={true} right={swipe}>
                <ListItem
                    title={item.Name}
                    onPress={() => this.props.navigation.navigate('Detail', { url: item.DiscussionID })}
                />
                </Swipeout>
            </View>
        )
    }
    renderFooter() {
        const user = this.state.data
        return (
            <View>
                <Divider style={{ backgroundColor: Colors.line, height: 20 }} />
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('ChangePasswordStack', { url: user.NIK }) }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon reverse={true} color={Colors.changePass} name='key' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                        <Text style={{ fontSize: 15, padding: 10 }}>Change Password</Text>
                    </View>
                </TouchableOpacity>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <TouchableOpacity onPress={() => this.logout()}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon reverse={true} color={Colors.logout} name='info' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                        <Text style={{ fontSize: 15, padding: 10 }}>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    refreshData() {
        this.setState({ refreshing: true })
        this.getListData().then(() => {
            this.setState({ refreshing: false })
        }).catch(() => {
            this.setState({ refreshing: false })
        })
    }

    render() {
        return (
            <View>
                <FlatList
                    ListHeaderComponent={this.renderHeader()}
                    ListFooterComponent={(item) => this.renderFooter(item)}
                    data={this.state.dataDiscussion}
                    renderItem={(item, index) => this.renderItem(item, index)}
                    ListEmptyComponent={<Text style={Styles.emptyBookmark}>You do not have any bookmark</Text>}
                    refreshing={false}
                    onRefresh={() => this.refreshData()}
                />
            </View>
        )
    }
}
export default Profile