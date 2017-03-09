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
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableHighlight,
  Text,
  Button
} from 'react-native'
import Config from 'react-native-config';

const StationListing = require("./StationListing");
const StationMap = require("./StationMap");

const PublicBikeServiceUrl = Config.BIKE_SERVICE_ENDPOINT;

/**


 */
class MainPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      stations:  [],
      isLoading: false,
      message:   ""
    };
  }


  //----
  _findLocations(latitude, longitude) {
    var query = {
      latitude:  latitude,
      longitude: longitude
    };

    var qs = Object.keys(query)
      .map( key => key + "=" + encodeURIComponent(query[key]) )
      .join("&");

    this.setState({ isLoading: true });
    fetch(PublicBikeServiceUrl + "?" + qs)
      .then( (response) => response.json() )
      .then( (json) => this._handleResponse(json) )
      .catch(error =>
        this.setState({
          isLoading: false,
          message: "Error loading stations: " + error
        })
      );
  }

  _handleResponse(response) {
    this.setState({
      isLoading: false,
      message: "",
      stations: response
    });

  }

  onGetStationsPressed() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this._findLocations(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      error => {
        console.error(error);
        this.setState({
          message: "There was a problem finding your location: " + error
        });
      }
    );
  }

  onGetStationsTestPressed() {
    this._findLocations(
        41.8802596,
        -87.6346818
    );
  }


  //----
  render() {

    var spinner = this.state.isLoading ? (<ActivityIndicator size="large"/>) : (<View/>);

    return(
      <View style={styles.container}>
        <StationMap style={styles.thirdHeight}
          stations={ this.state.stations } />


        <StationListing style={styles.thirdHeight}
          isLoading={ this.state.isLoading }
          stations={ this.state.stations } />


        <View style={[ styles.sixthHeight, styles.buttonGroup ]}>
          <Button
            onPress={this.onGetStationsPressed.bind(this)}
            title="Find Stations"
            accessibilityLabel="Find nearby public bike stations" />
          <Text>|</Text>
          <Button
            onPress={this.onGetStationsTestPressed.bind(this)}
            title="Find Stations (Test)"
            accessibilityLabel="Find nearby public bike stations" />
        </View>

        <View style={styles.sixthHeight}>
          <Text style={styles.message}>{this.state.message}</Text>
        </View>

      </View>
    );

  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 65
  },
  thirdHeight: {
    flex: 3
  },
  sixthHeight: {
    flex: 1
  },
  buttonGroup: {
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center'
  }
});


module.exports = MainPage

