import React, { Component } from 'react'
import {
    View,
    Text,
    Alert,
    Picker,
    TextInput,
    ToastAndroid,
    FlatList,
    AsyncStorage,
    ActivityIndicator,
    TouchableOpacity,
    Image
} from 'react-native'
import { Button, Avatar, Icon, ListItem } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { get, postENA, sendPushNotif } from '../service/rest'
import API from '../const/Api'
import CONFIG from '../const/Config'
import { onSignIn } from '../const/Auth'
import Styles from '../const/Styles'
import FilePickerManager from 'react-native-file-picker'
import { cekNet } from '../components/CekNet'
import * as t from 'tcomb-form-native'
import * as _ from 'lodash'
import Colors from '../const/Colors';

const stylesheet = _.cloneDeep(t.form.Form.stylesheet);

stylesheet.textbox.normal.marginTop = 5;
stylesheet.textbox.normal.height = 45;

stylesheet.textbox.error.marginTop = 5;
stylesheet.textbox.error.height = 45;

stylesheet.errorBlock.margin = 15;
stylesheet.errorBlock.marginTop = 0;

stylesheet.textbox.normal.borderWidth = 0;
stylesheet.textbox.error.borderWidth = 0;

stylesheet.textboxView.normal.borderBottomWidth = 1;
stylesheet.textboxView.error.borderBottomWidth = 1;

const discuss = t.struct({
    title: t.String,
    body: t.String
});

const options = {
    auto: 'none',
    fields: {
        title: {
            placeholder: 'Discussion Title',
            error: 'Field can not empty',
            stylesheet: stylesheet,
        },
        body: {
            placeholder: 'Type Here',
            error: 'Field can not empty',
            stylesheet: stylesheet,
            multiline: true
        }
    }
}

const Form = t.form.Form;
var wl
class CreateDiscussion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            dataSource: [],
            categories: 'pengumuman1',
            authentication: '',
            value: null,
            body: '',
            cat: '',
            file: undefined,
            isAttch: false,
            attch: [],
            urlAttch: []
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
                wl = item
                auth = 'username=' + item.Name + '&timestamp=' + item.TimeStamp + '&token=' + item.Token
                this.setState({ loading: true, authentication: auth, item: value.data })
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
        let url = API.category + '?' + auth
        return new Promise((resolve, reject) => {
            get(url).then(res => {
                this.setState({
                    loading: false,
                    dataSource: res.Categories,
                })
                resolve()
            }).catch(err => {
                console.log(err)
                this.setState({ loading: false })
                reject()
            })
        })
    }

    submit() {
        var value = this.refs.form.getValue()
        if (value) {
            var http = require("http");
            var str = this.state.categories;
            var arr = str.split("-");
            var url = API.discussions + '?' + auth
            var options = postENA(url)

            var req = http.request(options, function (res) {
                var chunks = [];
                res.on("data", function (chunk) {
                    chunks.push(chunk)
                })
                res.on("end", function () {
                    var body = Buffer.concat(chunks);
                    var json = JSON.parse(body);
                    if (json.Code) {
                        ToastAndroid.show('Failed to create discussion', ToastAndroid.SHORT);
                    } else if (json.Discussion.DiscussionID) {
                        var pop = wl;
                        var us
                        if (pop.NickName) {
                            us = pop.NickName
                        } else {
                            us = pop.RealName
                        }
                        // var topic = (arr[1]).replace(/\s/g, "");
                        var topic = 'Pengumuman'
                        var data = JSON.stringify({
                            "to": "/topics/" + topic,
                            "notification": {
                                "body": json.Discussion.Name,
                                "content_available": true,
                                "priority": "high",
                                "title": us + " add new discussion",
                                "sound": "default"
                            },
                            "data": {
                                "body": json.Discussion.Name,
                                "content_available": true,
                                "priority": "high",
                                "title": us + "add new discussion",
                                "targetScreen": "Detail",
                                "idDiscussion": json.Discussion.DiscussionID,
                                "sound": "default"
                            }
                        })
                        sendPushNotif(data);
                        alert('Success')
                    }
                });
            });
            var urlsAttchment = this.state.urlAttch;
            if (urlsAttchment.length > 0) {
                var tmp = value.body;
                var typeFile = ["jpeg", "jpg", "png"]
                for (urlAttchment in urlsAttchment) {
                    if (typeFile.includes(urlsAttchment[urlAttchment].split('.').pop().toLowerCase())) {
                        var urlformat = '![](' + urlsAttchment[urlAttchment] + ' "")';
                    } else {
                        var urlformat = '![file](' + urlsAttchment[urlAttchment] + ' "")';
                    }
                    var body = tmp.concat(urlformat);
                    tmp = body;
                    console.log(tmp)
                }
            } else {
                var tmp = value.body;
            }
            req.write(JSON.stringify({
                Name: value.title,
                Body: tmp,
                CategoryID: arr[0],
                CategoryID: 1,
                Announce: 1
            }));
            req.end();
            this.props.navigation.navigate('Home')
        }
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
                var value = this.refs.form.getValue()
                if (value) {
                    this.setState({
                        value: value
                    });
                }
                this.setState({
                    file: response,
                    loading: true
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
        formdata.append('userName', '')
        formdata.append('path', 'attachment')

        fetch('http://182.23.96.84:8182/forum/api/fileupload.php', {
            method: 'POST',
            body: formdata,
            headers: {
                'Accept': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.oke) {
                var arr = []
                var urls = []
                if (this.state.attch == 0) {
                    this.setState({
                        attch: [this.state.file],
                        urlAttch: [json.oke],
                        isAttch: true
                    });
                } else {
                    arr.push(this.state.file)
                    urls.push(json.oke)
                    this.setState({
                        attch: this.state.attch.concat(arr),
                        urlAttch: this.state.urlAttch.concat(urls),
                        isAttch: true
                    });
                }
                this.setState({
                    photo: json.oke
                })
                ToastAndroid.show('File uploaded!', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show(json.error, ToastAndroid.SHORT);
            }
            this.setState({
                loading: false
            });
        }).catch(err => {
            this.setState({
                loading: false
            });
        })
    }
    deleteFileInList(index){
        var urlFile = this.state.urlAttch[index]
        var filename = urlFile.substring(urlFile.lastIndexOf('/')+1);
        fetch('http://182.23.96.84:8182/forum/api/unlink.php', {
            method: 'POST',
            body: JSON.stringify({
                "filename":filename,
                "patch":"attch"
                }),
            headers: {
                'Accept': 'application/json'
            }
        })
        this.setState((prevState) => ({
            attch: prevState.attch.filter((_, i) => i !== index),
            urlAttch: prevState.urlAttch.filter((_, i) => i !== index)
        }));
    }
    renderItem({ item, index }) {
        return (
            <View>
                <ListItem
                    title={item.fileName.length > 20 ? item.fileName.substring(0, 20) + "..." : item.fileName}
                    avatar={item.type.split("/",1) == 'image' ? { uri: item.uri } : <Icon name='file' size={35} type='font-awesome' />}
                    label={<Icon name='times' size={15} type='font-awesome' />}
                    onPress={() =>this.deleteFileInList(index)}
                    hideChevron={true}
                    containerStyle={{marginLeft: -10,marginRight: -10, marginBottom: -10,borderBottomWidth: 0}}
                />
            </View>
        )
    }
    addAttachment() {
        if (this.state.isAttch) {
            return (

                <View>
                    {this.state.loading == false ?
                        <FlatList
                            data={this.state.attch}
                            renderItem={(item, index) => this.renderItem(item, index)}

                        /> : <ActivityIndicator />}
                </View>
            )
        }
    }
    render() {
        var payments = [];
        var categories = this.state.dataSource
        for (category in categories) {
            payments.push(
                <Picker.Item label={categories[category].Name} value={categories[category].CategoryID + "-" + categories[category].Name} />
            )
        }

        return (
            <View style={{ margin: 50 }}>
                <KeyboardAwareScrollView>
                    {/* <Picker
                        selectedValue={this.state.categories}
                        onValueChange={(itemValue, itemIndex) => this.setState({ categories: itemValue })}>
                        <Picker.Item label='Pilih Kategori' value='' />
                        {payments}
                    </Picker> */}
                    <Form ref="form" type={discuss} options={options} value={this.state.value} />
                </KeyboardAwareScrollView>

                <TouchableOpacity onPress={this.selectFileTapped.bind(this)} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Icon name='ios-attach' size={25} type='ionicon' style={{ alignSelf: 'flex-end' }} />
                </TouchableOpacity>
                {this.addAttachment()}
                <Button title='Publish' fontSize={17} backgroundColor={Colors.primary} buttonStyle={[Styles.buttonLogin, { marginTop: 10 }]} onPress={() => this.submit()} />
            </View>
        )
    }
}

export default CreateDiscussion