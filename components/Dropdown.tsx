import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import PieChart from "react-native-pie-chart"; // adjust as needed
import Basestyles from "../styles"; // adjust as needed
import { DropdownProps } from "../types";
const DropdownCard = ({
  isOpen,
  setIsOpen,
  title,
  chartData,
  chartWidth,
  description
}:DropdownProps) => {
  return (
    <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
      <View
        style={[
          Basestyles.baseStyles.russianVioletBackground,
          { padding: 5, borderRadius: 10, margin: 4 },
        ]}
      >
        <View
          style={{
            width: "100%",
            padding: 4,
            borderRadius: 10,
            margin: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={[
              Basestyles.baseStyles.silverH5,
              { textAlign: "center" },
            ]}
          >
            {title}
          </Text>
          <AntDesign
            name="caretdown"
            size={15}
            color={Basestyles.colors.silver}
            style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
          />
        </View>

        {isOpen && (
          <>
            {chartData && (
              <PieChart
                style={{ alignSelf: "center" }}
                widthAndHeight={chartWidth}
                series={chartData}
                cover={0.5}
              />
            )}
            {description !== "" && (
              <Text
                style={[
                Basestyles.baseStyles.silverH5,
                  { textAlign: "center" },
                ]}
              >
                {description}
              </Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default DropdownCard;
