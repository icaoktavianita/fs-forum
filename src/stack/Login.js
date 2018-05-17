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
stylesheet.textbox.normal.margin = 50;
stylesheet.textbox.normal.marginTop = 5;
stylesheet.textbox.normal.height = 45;
stylesheet.textbox.error.margin = 50;
stylesheet.textbox.error.marginTop = 5;
stylesheet.textbox.error.height = 45;

stylesheet.errorBlock.margin = 15;
stylesheet.errorBlock.marginTop = 0;

const login = t.struct({
    username: t.String,
    password: t.String
});

const options = {
    auto: 'none',
    fields: {
        username: {
            placeholder: 'NIK',
            error: 'Enter your username properly',
            stylesheet: stylesheet
        },
        password: {
            placeholder: 'Password',
            secureTextEntry: true,
            error: 'Enter your password properly',
            stylesheet: stylesheet
        }
    }
};

const Form = t.form.Form;

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false
        }
    }
    componentDidMount(){
        cekNet()
    }
    toTab() {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Initial' })]
        })
        this.props.navigation.dispatch(resetAction)
    }
    login() {
        const { navigate, state } = this.props.navigation;
        let value = this.refs.form.getValue();
        if (value) {
            this.setState({ loading: true })
            post(API.login, value).then(res => {
                this.setState({ loading: false })
                var data = JSON.stringify(res.data.DefaultPassword);
                var name = res.data.Name.toString();
                if (data == 400) {
                    this.props.navigation.navigate('ChangePassword', { url: name })
                } else {
                    onSignIn(JSON.stringify(res))
                    this.toTab()
                }
            }).catch(err => {
                this.setState({ loading: false })
                console.log(err)
                alert(err.response.data.Exception)
            })
        }
    }

    render() {
        const animating = this.state.loading
        if (this.state.loading) {
            return (
                <ActivityIndicator animating={animating}
                    size='small'
                />
            )
        }
        return (
            <BackgroundImage>
                <View style={Styles.marginTop100}>
                    <Text style={Styles.bigTitle}>FS GROUP FORUM</Text>
                    <KeyboardAwareScrollView>
                        <View style={Styles.loginView}>
                            <Form ref="form" type={login} options={options} />
                            <Button
                                title='Sign In'
                                onPress={() => this.login()}
                                buttonStyle={Styles.buttonLogin}
                                backgroundColor={Colors.primary}
                            />
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </BackgroundImage>
        )
    }
}

export default Login