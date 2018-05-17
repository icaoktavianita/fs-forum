import React, { Component } from 'react'
import {
    View,
    Text,
    ActivityIndicator,
    Picker,
    TextInput,
    Alert,
    AsyncStorage,
} from 'react-native'
import { Button } from 'react-native-elements'
import * as t from 'tcomb-form-native'
import * as _ from 'lodash'
import { NavigationActions } from 'react-navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { get, post, postENA, putENA } from '../service/rest'
import API from '../const/Api'
import CONFIG from '../const/Config'
import { onSignIn } from '../const/Auth'
import { cekNet } from '../components/CekNet'
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

const cat = t.struct({
    name: t.String
});

const options = {
    auto: 'none',
    fields: {
        name: {
            placeholder: 'Category Name',
            error: 'Field can not empty',
            stylesheet: stylesheet
        }
    }
}

const Form = t.form.Form;

class CreateDiscussion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            dataSource: [],
            language: null,
            body: '',
            data: '',
            categories: null,
            idParent: 1
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
                this.setState({ isLoading: false, authentication: auth })
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
        if (value){
            var http = require("http");
            var urlCode = (value.name).replace(/\s+/g, '-').toLowerCase();
            let auth = this.state.authentication
            var options = postENA(API.category + '?' + auth)
            var parentID = []
            var req = http.request(options, function (res) {
                var chunks = [];
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function () {
                    var body = Buffer.concat(chunks);
                    var json = JSON.parse(body.toString());
                    parentID.push(json.Category.CategoryID);
                    alert('Success')
                })
            })
            if (this.state.categories != '') {
                req.write(JSON.stringify({
                    Name: value.name,
                    UrlCode: urlCode,
                    ParentCategoryID: this.state.categories
                }))
            } else {
                req.write(JSON.stringify({
                    Name: value.name,
                    UrlCode: urlCode
                }))
            }
            req.end();
            this.props.navigation.navigate('Home')
        }
    }
    render() {
        var payments = [];
        var categories = this.state.dataSource
        for (category in categories) {
            if (categories[category].ParentCategoryID == -1) {
                payments.push(
                    <Picker.Item label={categories[category].Name} value={categories[category].CategoryID} />
                )
            }
        }
        const { navigate } = this.props.navigation;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator />
                </View>
            )
        }
        return (
            <View style={{ margin: 50, alignContent: 'center'}}>
                <KeyboardAwareScrollView>
                    <Picker
                        selectedValue={this.state.categories}
                        onValueChange={(itemValue, itemIndex) => this.setState({ categories: itemValue })}>
                        <Picker.Item label='Pilih Parent Kategori' value='' />
                        {payments}
                    </Picker>
                    <Form ref="form" type={cat} options={options} />
                    <Button title='Publish' fontSize={17} backgroundColor={Colors.primary} buttonStyle={{ borderRadius: 5, marginTop: 10}} onPress={() => this.submit()} />
                </KeyboardAwareScrollView>
            </View>
        )
    }
}

export default CreateDiscussion