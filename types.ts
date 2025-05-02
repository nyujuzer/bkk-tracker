import { ReactNode } from "react";
export {VehicleListProps, DropdownItemProps, DropdownProps, LineInfoProps, Votes}
import { Timestamp } from "firebase/firestore";
import { Slice } from "react-native-pie-chart";
interface VehicleListProps {
  title: string;
  list: Array<string>;
  // votes?:Array<Votes>
  // onPress: (props:databaseProps) => void;
}
interface DropdownProps {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  title: string,
  chartData:Slice[],
  chartWidth:number,
  description:string
  }

  
  interface DropdownItemProps{
      TextDisplay: string,
      onClick: () => void
      isSelected: Boolean,
      icon?: string
  }

  interface LineInfoProps{

      line: string,

  }

  interface Votes{
    isDelayed:boolean,
    isInspected:boolean,
    occupancy:0|1|2|3|4|5|6|7|8|9|10
    line:string,
    timestamp:Timestamp,
  }
