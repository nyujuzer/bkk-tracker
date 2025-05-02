import {
  View,
  Text,
  ScrollView,
} from "react-native";
import LineInfo from "./LineInfo";
import { VehicleListProps } from "../types";

export default function VehicleList({ list, title, }: VehicleListProps) {
  return (
    <View style={{flexDirection:"column",flex:1}}>
      <Text>{title}</Text>
      <ScrollView>
        {list.map((line: string, index: number) => (
          <LineInfo
        
            key={index + title}
            line={line}
          />
        ))}
      </ScrollView>
    </View>
  );
}
