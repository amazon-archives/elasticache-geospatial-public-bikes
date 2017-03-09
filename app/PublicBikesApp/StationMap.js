/**

 Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
 except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS"
 BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 License for the specific language governing permissions and limitations under the License.

 */

'use strict';

import React, { Component } from 'react'
import {
  Dimensions,
  StyleSheet,
  View
} from 'react-native'
import MapView from 'react-native-maps';


/**


 */

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE  = 41.8802596;
const LONGITUDE = -87.6346818;
const LATITUDE_DELTA  = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


class StationMap extends Component {

  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    }
  }

  //----
  render() {

    return (
      <View style={styles.container}>
        <MapView style={styles.map}
          scrollEnabled={false}
          initialRegion={this.state.region}>

          {this.props.stations.map(station => (

            <MapView.Marker
              key={station.name}
              title={station.name.split('-')[0]}
              description={station.distance}
              coordinate={station.coordinates} />

          ))}

        </MapView>
      </View>
    );
  }

}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 250
  },
  map: {
    minHeight: 250,
    minWidth: 250
  }
});


module.exports = StationMap;

