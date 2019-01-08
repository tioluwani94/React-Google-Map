import React from "react";
import ReactDOM from "react-dom";
import Geosuggest from "react-geosuggest";
import DrawingMap from "./DrawingMap";
import "./styles.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      geofence: {},
      geofenceType: {
        polygon: this.onPolygonComplete
      },
      coordinate: []
    };
  }
  onSuggestSelect = suggest => {
    if (suggest) {
      const { location } = suggest;
      this.setState({
        location
      });
    }
  };
  getGeofenceBounds = geofence => {
    if (geofence) {
      let func = this.state.geofenceType[geofence.type];
      func(geofence);
    } else {
      this.setState({
        coordinate: []
      });
    }
  };
  onPolygonComplete = poly => {
    const polyArray = poly.getPath().getArray();
    let paths = [];
    polyArray.forEach(function(path) {
      paths.push({ Latitude: path.lat(), Longitude: path.lng() });
    });
    this.setState({
      coordinate: paths
    });
    console.log(paths);
  };
  render() {
    return (
      <React.Fragment>
        <Geosuggest
          placeholder="Start typing!"
          onSuggestSelect={this.onSuggestSelect}
          location={new window.google.maps.LatLng(53.558572, 9.9278215)}
          radius="20"
        />
        <DrawingMap
          location={this.state.location}
          getGeofenceBounds={this.getGeofenceBounds}
          coordinate={[
            {
              lat: 22.554690292466308,
              lng: 113.90311779785156
            },
            {
              lat: 22.7802541761456,
              lng: 114.26429333496094
            },
            {
              lat: 22.563567779499643,
              lng: 114.34119763183594
            },
            {
              lat: 22.364321424431203,
              lng: 114.09949841308594
            }
          ]}
        />
      </React.Fragment>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
