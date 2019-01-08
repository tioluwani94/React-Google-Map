import React from "react";
import { isEqual, isEmpty } from "lodash";
import "./DrawingMap.css";

class DrawingMap extends React.Component {
  state = {
    all_overlays: [],
    selectedShape: null,
    map: null,
    location: {}
  };
  componentDidMount() {
    if (!window.google) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBCotrK1_s21QiLYaoOcQQ4us6PYPt3vTQ&v=3.exp&libraries=geometry,drawing,places`;
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
      // Below is important.
      //We cannot access google.maps until it's finished loading
      s.addEventListener("load", e => {
        this.onScriptLoad();
      });
    } else {
      this.onScriptLoad();
    }
  }
  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.location, this.props.location)) {
      this.addMarker();
    }
  }
  onScriptLoad = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center:
        this.props.coordinate[0] ||
        new window.google.maps.LatLng(22.344, 114.048),
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true
    });
    this.setState({
      map
    });
    // this.props.onMapLoad(map);
    var polyOptions = {
      strokeWeight: 0,
      fillOpacity: 0.45,
      editable: true
    };
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      markerOptions: {
        draggable: true
      },
      polylineOptions: {
        editable: true
      },
      rectangleOptions: polyOptions,
      circleOptions: polyOptions,
      polygonOptions: polyOptions,
      map: map
    });
    window.google.maps.event.addListener(
      drawingManager,
      "overlaycomplete",
      e => {
        const { all_overlays } = this.state;
        all_overlays.push(e);
        if (e.type !== window.google.maps.drawing.OverlayType.MARKER) {
          drawingManager.setDrawingMode(null);
          var newShape = e.overlay;
          newShape.type = e.type;
          window.google.maps.event.addListener(newShape, "click", () => {
            this.setSelection(newShape);
          });
          this.setSelection(newShape);
        }
      }
    );
    window.google.maps.event.addListener(
      drawingManager,
      "drawingmode_changed",
      this.clearSelection
    );
    window.google.maps.event.addListener(map, "click", this.clearSelection);
    if (this.props.coordinate) {
      drawingManager.setDrawingMode(null);
      let polygon = new window.google.maps.Polygon({
        paths: this.props.coordinate,
        editable: true,
        clickable: true
      });
      polygon.setMap(map);
      let { all_overlays } = this.state;
      all_overlays.push({ overlay: polygon });
      polygon.type = "polygon";
      this.setSelection(polygon);

      // window.google.maps.event.addListener(polygon, "click", e => {
      //   let { all_overlays } = this.state;
      //   all_overlays.push({ overlay: polygon });
      //   polygon.type = "polygon";
      //   this.setSelection(polygon);
      // });
    }
  };

  addMarker = () => {
    const { map } = this.state;
    const { location } = this.props;
    if (!isEmpty(location)) {
      let marker = new window.google.maps.Marker({
        position: location
      });
      let center = new window.google.maps.LatLng(location.lat, location.lng);
      map.panTo(center);
      map.setZoom(20);
      marker.setMap(map);
    }
  };
  clearSelection = () => {
    let { selectedShape } = this.state;
    if (selectedShape) {
      selectedShape.setEditable(false);
      this.setState({
        selectedShape: null
      });
    }
    this.props.getGeofenceBounds(null);
  };

  setSelection = shape => {
    this.clearSelection();
    this.setState({
      selectedShape: shape
    });
    shape.setEditable(true);
    this.props.getGeofenceBounds(shape);
  };

  deleteSelectedShape = () => {
    const { selectedShape } = this.state;
    if (selectedShape) {
      selectedShape.setMap(null);
    }
  };

  deleteAllShape = () => {
    const { all_overlays } = this.state;
    for (var i = 0; i < all_overlays.length; i++) {
      all_overlays[i].overlay.setMap(null);
    }
    this.setState({
      all_overlays: []
    });
    this.props.getGeofenceBounds(null);
  };
  render() {
    return (
      <React.Fragment>
        <div id="panel">
          <div>
            <button id="delete-button" onClick={this.deleteSelectedShape}>
              Delete Selected Shape
            </button>
            <button id="delete-all-button" onClick={this.deleteAllShape}>
              Delete All Shapes
            </button>
          </div>
        </div>
        <div id="map" />
      </React.Fragment>
    );
  }
}

DrawingMap.defaultProps = {
  onMapLoad: map => console.log(map)
};

export default DrawingMap;
