import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    ActivityIndicator,
} from 'react-native'
import { Button } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as t from 'tcomb-form-native'
import * as _ from 'lodash'
import { post } from '../service/rest'
import API from '../const/Api'
import { onSignIn } from '../const/Auth'
import CONFIG from '../const/Config'
import Colors from '../const/Colors'
import BackgroundImage from '../const/Background'
import Styles from '../const/Styles'
import { cekNet } from '../components/CekNet'

const stylesheet = _.cloneDeep(t.form.Form.stylesheet);
stylesheet.formGroup.normal.marginLeft = 50
stylesheet.formGroup.error.marginLeft = 50
stylesheet.formGroup.normal.marginRight = 50
stylesheet.formGroup.error.marginRight = 50

stylesheet.textbox.normal.marginTop = 5;
stylesheet.textbox.normal.height = 45;

stylesheet.textbox.error.marginTop = 5;
stylesheet.textbox.error.height = 45;

stylesheet.errorBlock.margin = 15;
stylesheet.errorBlock.marginTop = 0;


const change = t.struct({
    current: t.String,
    new: t.String,
    repeat: t.String,
});

const options = {
    auto: 'none',
    fields: {
        current: {
            placeholder: 'Current Password',
            secureTextEntry: true,
            stylesheet: stylesheet,
            required: ''
        },
        new: {
            placeholder: 'New Password',
            secureTextEntry: true,
            stylesheet: stylesheet,
            required: ''
        },
        repeat: {
            placeholder: 'Repeat Password',
            secureTextEntry: true,
            stylesheet: stylesheet,
            required: ''
        }
    }
}

const Form = t.form.Form;

class ChangePassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            userName: "",
            oldPassword: "",
            newPassword: "",
            retypePassword: "",
            value: null
        }
    }
    componentDidMount() {
        cekNet()
    }
    toLogin() {
        AsyncStorage.removeItem(CONFIG.AUTH).then(() => {
            this.setState({ loading: false })
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Login' })]
            })
            this.props.navigation.dispatch(resetAction)
        })
    }

    changePassword() {
        let value = this.refs.form.getValue();
        let name = this.props.navigation.state.params.url
        if (value) {
            if (value.new !== value.repeat) {
                this.setState({value: null})
                alert('Password doesn\'t match')
            } else {
                var data = JSON.stringify({ username: name, oldPassword: value.current, newPassword: value.new })
                post(API.changePassword, data).then(res => {
                    this.setState({ loading: false })
                    alert('Success')
                    this.toLogin()
                }).catch(err => {
                    this.setState({ loading: false })
                    alert('Failed!')
                    console.log(err)
                })
            }
        }
    }

    render() {
        const animating = this.state.loading
        
        if (this.state.loading) {
            return (
                <ActivityIndicator animating={animating} color='#3498db'
                    size='small'
                />
            )
        }
        return (
            <BackgroundImage>
                <View style={Styles.marginTop100}>
                    <Text style={Styles.bigTitle}>Changes Password</Text>
                    <KeyboardAwareScrollView>
                        <View style={[Styles.loginView]}>
                            <Form 
                                ref="form" 
                                type={change} 
                                options={options} 
                                value={this.state.value}
                            />
                            <Button
                                title='Change Password'
                                onPress={() => this.changePassword()}
                                buttonStyle={[Styles.buttonLogin, { marginTop: 20 }]}
                                backgroundColor={Colors.primary}
                            />
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </BackgroundImage>
        )
    }
}

export default ChangePassword