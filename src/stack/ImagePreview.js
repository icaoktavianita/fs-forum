import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ImageViewer from 'react-native-image-pan-zoom';
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const blackHeader = {
  backgroundColor: '#000000'
}

export default class ImagePreview extends React.Component {

  static navigationOptions = {
    title: 'Preview',
  }

  constructor(props) {
    super(props);
    this.state = {
      imgurl: '',
    }
  }

  componentDidMount() {
    this.setState({ imgurl: this.props.navigation.state.params.url });
  }

  render() {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ImageViewer
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height-100}
          imageWidth={Dimensions.get('window').width}
          imageHeight={Dimensions.get('window').height}
          pinchToZoom={true}
          resizeMethod='resize'
          style={{flex: 1}}
        >
          <Image
            onLoadStart={()=>console.log("jalan ni")}
            onProgress={()=>console.log("lagi on progress")}
            style={Styles.image}
            source={{ uri: this.state.imgurl.toString() }}
          />
        </ImageViewer>
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  image: {
    width: width,
    height: height-40,
    resizeMode:'contain'
  },
});
