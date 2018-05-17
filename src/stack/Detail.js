import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    Alert,
    FlatList,
    ScrollView,
    ToastAndroid,
    Dimensions,
    AsyncStorage,
    ActivityIndicator,
    TouchableOpacity,
    TouchableHighlight,
    StyleSheet,
    Linking,
    BackHandler
} from 'react-native';
import NavigationBar from 'react-native-navbar'
import IOSIcon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Avatar, Button, ListItem, Icon } from 'react-native-elements'
import Markdown from 'react-native-simple-markdown'
import Swipeout from 'react-native-swipeout'
import { NavigationActions } from 'react-navigation'
import * as t from 'tcomb-form-native'
import * as _ from 'lodash'
import API from '../const/Api'
import { get, del, postENA, sendPushNotif } from '../service/rest'
import CONFIG from '../const/Config'
import ImageSlider from 'react-native-image-slider';
import { cekNet } from '../components/CekNet'
import Colors from '../const/Colors'
import Styles from '../const/Styles'
require('node-libs-react-native/globals')

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const stylesheet = _.cloneDeep(t.form.Form.stylesheet);
stylesheet.fieldset = {
    flexDirection: 'row'
};
if (width < 350) {
    stylesheet.textbox.normal.width = 225;
    stylesheet.textbox.error.width = 225;
} else if(width>411) {
    stylesheet.textbox.normal.width = 300;
    stylesheet.textbox.error.width = 300;
}else{
    stylesheet.textbox.normal.width = 270;
    stylesheet.textbox.error.width = 270;
}

stylesheet.textbox.error.marginLeft = 0;
const comment = t.struct({
    Body: t.String
});

const options = {
    auto: 'none',
    fields: {
        Body: {
            placeholder: 'Comment here',
            error: 'Comment cannot empty',
            stylesheet: stylesheet
        }
    }
};

const Form = t.form.Form;
var obj = {}
var cl = false
var customer_name;
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            dataSource: {},
            dataComments: [],
            authentication: '',
            role: '',
            dataUser: {},
            bh: false,
            hah: null
        }
    }
    componentDidMount() {
        console.warn(width, height)
        AsyncStorage.setItem("posisi", JSON.stringify(this.props.navigation.state.routeName));
        this.loadInitialState()
        cekNet()
        AsyncStorage.getItem('newID').then(val => {
            if (val !== null) {
                value2 = JSON.parse(val)
                var index = value2.indexOf(parseInt(this.props.navigation.state.params.url));
                if (index > -1) {
                    value2.splice(index, 1);
                    AsyncStorage.setItem("newID", JSON.stringify(value2));
                }
            }
        })
        BackHandler.addEventListener('hardwareBackPress', () => this.props.navigation.navigate('Home', { url: true }));
    }

    loadInitialState() {
        var values = {};
        AsyncStorage.getItem(CONFIG.AUTH).then(val => {
            if (val !== null) {
                value = JSON.parse(val)
                item = value.data
                auth = 'username=' + item.Name + '&timestamp=' + item.TimeStamp + '&token=' + item.Token
                this.setState({ loading: true, authentication: auth, role: item.Role, hah: item })
                this.getData().then(() => {
                    this.setState({ loading: false })
                }).catch(() => {
                    this.setState({ loading: false })
                })
            }
        })
    }
    getData() {
        let auth = this.state.authentication
        let url = API.discussions + '/' + this.props.navigation.state.params.url + '?' + auth
        return new Promise((resolve, reject) => {
            get(url).then(res => {
                this.setState({
                    loading: false,
                    dataSource: res.Discussion,
                    dataComments: res.Comments
                })
                this.getRealName(res.Comments)
                resolve()
            }).catch(err => {
                console.log(err)
                this.setState({ loading: false })
                reject()
            })
        })
    }
    getRealName(dataComments) {
        if (dataComments) {
            var count = Object.keys(dataComments).length;
            var UserName = {}
            for (let i = 0; i < count; i++) {
                let item = dataComments[i]
                fetch('http://182.23.96.84:8182/forum/api/gettitle.php', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "userID": item.InsertUserID
                    })
                }).then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Server response wasn\'t OK');
                    }
                }).then((json) => {
                    if (json.NickName) {
                        customer_name = json.NickName;
                    } else {
                        customer_name = json.RealName;
                    }
                    if (Object.keys(obj).length > 0) {
                        obj[item.InsertUserID] = customer_name
                        var bla = Object.assign(obj, obj)
                        this.setState({ dataUser: bla })
                    } else {
                        obj[item.InsertUserID] = customer_name
                        var bli = Object.assign(obj, obj)
                        this.setState({ dataUser: bli })
                    }
                });
            }
        }
    }
    toTab() {
        this.setState({ loading: true })
        this.getData()
            .then(() => {
                this.setState({ loading: false })
                this.getData()
                ToastAndroid.show('Success', ToastAndroid.SHORT);
            }).catch(() => {
                ToastAndroid.show('Failed to send a comment', ToastAndroid.SHORT);
                this.setState({ loading: false })
            })
    }
    submitComment() {
        let http = require("http");
        let value = this.refs.form.getValue();
        let auth = this.state.authentication
        let options = postENA(API.discussions + '/' + this.props.navigation.state.params.url + "/comments?" + auth)
        let req = http.request(options)
        req.write(JSON.stringify(value));
        req.end();
        var cat = this.state.dataSource.Category;
        var topic = (cat).replace(/\s/g, "");
        var pop = this.state.hah
        var us
        if (pop.NickName) {
            us = pop.NickName
        } else {
            us = pop.RealName
        }
        var data = JSON.stringify({
            "to": "/topics/" + topic,
            "notification": {
                "body": "on " + this.state.dataSource.Name,
                "content_available": true,
                "priority": "high",
                "title": "New Comment From " + us,
                "sound": "default",
            },
            "data": {
                "body": "on " + this.state.dataSource.Name,
                "content_available": true,
                "priority": "high",
                "title": "New Comment From " + us,
                "targetScreen": "Detail",
                "idDiscussion": this.props.navigation.state.params.url,
                "sound": "default",
            }
        })
        sendPushNotif(data);
        this.toTab()

    }
    confirmDelete(item, index) {
        Alert.alert(
            'Do you want to delete this?',
            'Are you sure?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => this.delete(item, index) },
            ],
            { cancelable: false }
        )
    }
    delete(item, index) {
        let auth = this.state.authentication
        del(API.discussions + '/comments/' + item.CommentID + '?' + auth)
            .then(res => {
                this.setState((prevState) => ({
                    dataComments: prevState.dataComments.filter((_, i) => i !== index)
                }));
                ToastAndroid.show('Comment deleted', ToastAndroid.SHORT);
            })
            .catch(err => {
                console.log(err)
            })
    }
    render() {
        if (this.state.loading) {
            return (
                <View style={[Styles.activityIndicator, Styles.horizontal]}>
                    <ActivityIndicator color={Colors.spinner} />
                </View>
            )
        }
        var count = Object.keys(this.state.dataComments).length;
        var comments = [];
        var ji = this.state.dataUser
        for (let i = 0; i < count; i++) {
            let item = this.state.dataComments[i]
            let buttonSwipe = [
                {
                    backgroundColor: Colors.red,
                    underlayColor: Colors.redActive,
                    component: <View style={Styles.swipeoutItem}><Icon name='trash' color={Colors.white} size={20} type='font-awesome' /><Text style={Styles.swipeoutText}>Delete</Text></View>,
                    onPress: () => this.confirmDelete(item, i)
                }
            ]
            let role = this.state.role
            let superuser = role.includes('SUPERUSER')
            comments.push(
                <Swipeout close={true}
                    right={superuser == true ? buttonSwipe : null} style={{ backgroundColor: Colors.white }}>
                    <ListItem
                        roundAvatar
                        avatar={
                            this.state.dataComments[i].InsertPhoto.charAt(0) == '/' ? { uri: 'https://www.addteq.com/blog/_/7F00010101626DB2AD4B07A922A83ACF/1524663775608/assets/images/default-user.png' } :
                                { uri: this.state.dataComments[i].InsertPhoto }
                        }

                        subtitle={
                            <View style={Styles.commentName}>
                                <Text style={[Styles.font10, { color: Colors.black }]}>{(item.InsertUserID in obj) == true ? obj[item.InsertUserID].split(" ", 1) : null} </Text>
                                <Text style={Styles.font10}>{this.state.dataComments[i].DateInserted}</Text>
                                <Text style={Styles.commentBody}>{this.state.dataComments[i].Body}</Text>
                            </View>
                        }
                        key={i}
                        hideChevron={true}
                        onPress={() => this.props.navigation.navigate('ProfileUser', { url: this.state.dataComments[i].InsertUserID })}
                    />
                </Swipeout>
            )
        }
        var textOnly = [];
        var imageUrl = []
        var filesUrl = []
        var imagecomp = [];
        var filescomp = [];
        var text = this.state.dataSource.Body;
        var matches = text.match(/(https?:\/\/[^\s]+)/g);
        if (matches) {
            for (match in matches) {
                var typeFile = ["jpeg", "jpg", "png"]
                if (typeFile.includes(matches[match].split('.').pop().toLowerCase())) {
                    imageUrl.push(matches[match]);
                    var param = '![](' + matches[match] + ' "")';
                    var newText = text.replace(param, "");
                } else {
                    filesUrl.push(matches[match]);
                    var param = '![file](' + matches[match] + ' "")';
                    var newText = text.replace(param, "");
                }
                text = newText;
                var image = imageUrl.toString()
            }
            textOnly.push(
                <Text>{text}</Text>
            )
            imagecomp.push(
                <ImageSlider
                    images={imageUrl}
                    customSlide={({ index, item }) => (
                        <View key={index} style={{ width: width - 20, height: width / 2 }}>
                            <TouchableHighlight onPress={() => this.props.navigation.navigate('ImagePreview', { url: item })} underlayColor='transparent'>
                                <Image style={{ width: '100%', height: '100%' }} resizeMode="cover" source={{ uri: item }} />
                            </TouchableHighlight>
                        </View>
                    )}
                />
            )
            filescomp.push(
                <FlatList
                    data={filesUrl}
                    renderItem={({ item, index }) =>
                        <View>
                            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => Linking.openURL(item)}>
                                <Icon name='download' size={20} type='font-awesome' />
                                <Text> Attachment {index + 1}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )
        } else {
            textOnly.push(
                <Text>{text}</Text>
            )
        }
        return (
            <View style={Styles.flexColumn}>
                <ScrollView >
                    <View style={Styles.commentContainer}>
                        <View style={Styles.commentNameRow}>
                            <Avatar medium rounded containerStyle={{ backgroundColor: Colors.white }}
                                source={
                                    this.state.dataSource.InsertPhoto.charAt(0) == '/' ? { uri: 'https://www.addteq.com/blog/_/7F00010101626DB2AD4B07A922A83ACF/1524663775608/assets/images/default-user.png' } :
                                        { uri: this.state.dataSource.InsertPhoto }
                                }
                                onPress={() => this.props.navigation.navigate('ProfileUser', { url: this.state.dataSource.InsertUserID })}
                            />
                            <View style={Styles.margin1010}>
                                <Text style={Styles.bold14}>{this.state.dataSource.Name}</Text>
                                <Text style={Styles.font10}>{this.state.dataSource.DateInserted}</Text>
                            </View>
                        </View>
                        {textOnly}
                        {imagecomp}
                        <View style={{ marginTop: 20 }}>
                            {filescomp}
                        </View>
                        <View style={Styles.spaceBetween}>
                            <Text style={Styles.font12}>{this.state.dataSource.CountViews} <MaterialCommunityIcons name='eye-outline' size={13} /></Text>
                            <Text style={Styles.font12}>{this.state.dataSource.CountComments} <MaterialCommunityIcons name='comment-text-outline' size={11} /></Text>
                            <Text style={Styles.font12}>{this.state.dataSource.Category}</Text>
                        </View>
                        <View style={Styles.line} />
                        {comments}
                        {this.state.dataSource.Closed == 1 ? null :
                            <View style={[Styles.flexRowTop10, { justifyContent: 'space-between' }]}>
                                <Form ref="form" type={comment} options={options} />
                                <Button onPress={() => this.submitComment()} title="Send" backgroundColor={Colors.primary} buttonStyle={Styles.buttonSend} />
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
});

export default Home
