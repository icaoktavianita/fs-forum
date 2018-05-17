import React from 'react'
import {
    Text,
    View,
    AsyncStorage
} from 'react-native'
import { Tile, Avatar, Icon, Divider } from 'react-native-elements';
import CONFIG from '../const/Config'
import API from '../const/Api'
import Colors from '../const/Colors'
import { get } from '../service/rest'
import Styles from '../const/Styles'
import { cekNet } from '../components/CekNet'
class ProfileUser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {}
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
                this.setState({ loading: true })
                this.getData(item).then(() => {
                    this.setState({ loading: false })
                }).catch(() => {
                    this.setState({ loading: false })
                })
            }
        })
    }
    getData(item) {
        let url = API.profile + '?id=' + this.props.navigation.state.params.url
        return new Promise((resolve, reject) => {
            get(url).then(res => {
                this.setState({ data: res })
                resolve()
            }).catch(err => {
                console.log(err)
                reject()
                console.log(err)
            })
        })
    }
    render() {
        const user = this.state.data
        return (
            <View>
                <Tile
                    imageSrc={{ uri: API.photoUrl+user.Photo}}
                    icon={{ name: user.Photo !== null ? null : 'user' ,size:50, type: 'font-awesome', color: 'white'}}
                    featured
                    height={150}
                    onPress={()=> user.Photo !== null && this.props.navigation.navigate('ImagePreview', { url: API.photoUrl+user.Photo })}
                />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.user} name='user' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>{user.Name}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, height: 20 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.gender} name={user.Gender == 'm' ? 'mars' : 'venus'} size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Gender: {user.Gender == 'm' ? 'Male' : 'Female'}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse color={Colors.dateOfBirth} name='calendar' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Date Of Birth: {user.DateOfBirth}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.division} name='sitemap' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Division: {user.Division}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.position} name='star' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Position: {user.Position}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse color={Colors.joinDate} name='calendar' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Join Date: {user.JoinDate}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Icon reverse={true} color={Colors.location} name='map-marker' size={15} type='font-awesome' style={{ marginLeft: 10, }} />
                    <Text style={{ fontSize: 15, padding: 10 }}>Location: {user.Location}</Text>
                </View>
                <Divider style={{ backgroundColor: Colors.line, marginLeft: 50 }} />
            </View>
        )
    }
}

export default ProfileUser