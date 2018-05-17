import React, { Component } from 'react';
import {
    AppRegistry,
    Image,
    ImageBackground
} from 'react-native';

const bg = require('../assets/background.jpeg');

export default class BackgroundImage extends Component {
    render() {
        const resizeMode = 'center';

        return (
            <ImageBackground
                style={{
                    flex: 1,
                    width: null,
                    height: null,
                }}
                source={require('../assets/background.jpeg')}
            >{this.props.children}</ImageBackground>
        );
    }
}

AppRegistry.registerComponent('BackgroundImage', () => BackgroundImage);