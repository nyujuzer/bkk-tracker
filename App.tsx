import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import VehicleList from "./components/VehicleList";
import basestyles from "./styles";

const { height, width } = Dimensions.get("screen");

export default function App() {
  const lines = require("./assets/lines.json");
  const linelist = Object.keys(lines.types);
  const [data, setdata] = useState<Array<any>>([]);
  const [visible, setVisible] = useState<Array<string>>([...linelist]);
  const getActiveColor = (line: string) => {
    switch (line) {
      case "metró":
        if (visible.includes("metró")) {

          return "#005CA5";
        } else {
          return "##a9a9a9";
        }
      case "busz":
        if (visible.includes("busz")) {

          return "#009FE3";
        } else {
          return "##a9a9a9";
        }
      case "villamos":
        if (visible.includes("villamos")) {

          return "#FFD900";
        } else {
          return "##a9a9a9";
        }
      case "troli":
        if (visible.includes("troli")) {

          return "#E41F18";
        } else {
          return "##a9a9a9";
        }
      case "éjszakai":
        if (visible.includes("éjszakai")) {

          return "#000";
        } else {
          return "##a9a9a9";
        }
      case "HÉV":
        if (visible.includes("HÉV")) {

          return "#800080";
        } else {
          return "##a9a9a9";
        }
      default:
        return "#ff0000";
    }
  };
  const handleDropdownItemClick = (line: string) => {
    console.log(visible, line);

    if (visible.includes(line)) {
      setVisible(visible.filter((item) => item !== line));
    } else {
      setVisible([...visible, line]);
    }
  };
  const handleDropdownItemSelected = (line: string) => {
    if (visible.includes(line)) {
      return true;
    }
    return false;
  };
  
  return (
    <View style={[styles.container, basestyles.baseStyles.silverBackground]}>
      <Text style={basestyles.baseStyles.darkSlateGrayH1}>
        Válassz járatot!
      </Text>

      <ScrollView contentContainerStyle={{ width: width, padding: 10 }}>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              // justifyContent: "space-evenly",
            }}
          >
            {linelist.map((line, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDropdownItemClick(line)}
                >
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: getActiveColor(line),
                      padding: 5,
                      borderRadius: 10,
                      margin: 5,
                      backgroundColor: handleDropdownItemSelected(line)?getActiveColor(line):basestyles.colors.darkSlateGray,
                    }}
                  >
                    <Text style={basestyles.baseStyles.silverText}>{line}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {visible.includes("metró")?
          <VehicleList
            // votes={filterVotesByType("metró")}
            title={"Metró"}
            list={lines.types.metró}
          />:null}
          {visible.includes("busz")?
          <VehicleList
            // votes={filterVotesByType("busz")}
            title={"Busz"}
            list={lines.types.busz}
          />:null}
          {visible.includes("villamos")?
          <VehicleList
            // votes={filterVotesByType("villamos")}
            title={"Villamos"}
            list={lines.types.villamos}
          />:null}
          {visible.includes("troli")?
          <VehicleList
            // votes={filterVotesByType("troli")}
            title={"Troli"}
            list={lines.types.troli}
          />:null}
          {visible.includes("HÉV")?
          <VehicleList
            // votes={filterVotesByType("HÉV")}
            title={"HÉV"}
            list={lines.types.HÉV}
          />:null}
          {visible.includes("éjszakai")?
          <VehicleList
            // votes={filterVotesByType("éjszakai")}
            title={"Éjszakai"}
            list={lines.types.éjszakai}
          />:null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
