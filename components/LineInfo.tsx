import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import baseStyles from "../styles";
import { useEffect, useState } from "react";
// import { DownOutlined } from "@ant-design/icons";
// import AntDesign from "@expo/vector-icons/AntDesign";
import PieChart from "react-native-pie-chart";
import { LineInfoProps, Votes } from "../types";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  setDoc,
  setIndexConfiguration,
  Timestamp,
  where,
  setLogLevel,
  initializeFirestore,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import moment from "moment";
import Slider from "@react-native-community/slider";
import AntDesign from "@expo/vector-icons/AntDesign";
import DropDown from "./Dropdown";

const styles = StyleSheet.create({
  ScrollViewItem: {
    width: "100%",
    padding: 10,
    marginVertical: 8,
    alignItems: "flex-start",
    borderRadius: 10,
  },
  dataContainer: {
    margin: 3,
    // maxWidth: "33%",
    // backgroundColor: "red",
    alignContent: "center",
    // borderColor:baseStyles.colors.russianViolet,
    // borderWidth: 1,

    padding: 1,
    // justifyContent:"center"
  },
});

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

export default function LineInfo({ line /* other props */ }: LineInfoProps) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<Votes[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected_inspection, setInspectionSelected] = useState<boolean>(false);
  const [inspectionPassed, setInspectionPassed] = useState<boolean>(false);
  const [select_delay, setDelaySelected] = useState<boolean>(false);
  const [delayPassed, setDelayPassed] = useState<boolean>(false);
  const [isVoting, setVoting] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [occupancy, setOccupancy] = useState<Number>(-1);

  const [delay_open, setDelayOpen] = useState<boolean>(false);
  const [inspection_open, setInspectionOpen] = useState<boolean>(false);
  const [occupancy_open, setOccupancyOpen] = useState<boolean>(false);

  // Move Firebase initialization outside component (see note below)
  const app = initializeApp(firebaseConfig);
  const firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
  console.log("firebaseConfig", firestore.app.options);
  const getData = async (line: string) => {
    try {
      setLoading(true);
      const twoHourAgo = moment().subtract(2, "hour").toDate();
      const q = query(
        collection(firestore, "votes"),
        where("line", "==", line),
        where("timestamp", ">=", twoHourAgo),
        limit(100)
      );
      console.log();

      const snapshot = await getDocs(q);
      const votes = snapshot.docs.map((doc) => doc.data() as Votes);
      setData(votes);
    } catch (error) {
      console.error("Fetch error:", typeof error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOccupancy = () => {
    if (data.length === 0) return 0;
    return data.reduce((sum, v) => sum + v.occupancy, 0) / data.length;
  };
  const calculateDelay = () => {
    const yaydata = data.filter((vote) => vote.isDelayed).length 
    return {
      yaysayers: yaydata,
      naysayers: data.length-yaydata,
    };
  };
  const calculateInspections = () => {
    const yayVotes = { value: 0, color: baseStyles.colors.lapisLazuli };
    const nayVotes = { value: 0, color: baseStyles.colors.silver };
    data.forEach((vote) => {
      // console.log(vote.isInspected, line)
      if (vote.isInspected) {
        yayVotes.value += 1;
      } else if (!vote.isInspected) {
        nayVotes.value += 1;
      }
    });
    const isValid = yayVotes.value === 0 && nayVotes.value === 0;
    return {
      isValid: isValid,
      text: "Sajnos jelenleg nem áll elég adat a rendelkezésünkre",
      series: [nayVotes, yayVotes],
      votecount: {
        yayvotes: yayVotes.value,
        allvotes: yayVotes.value + nayVotes.value,
      },
    };
  };
  const handlePress = async () => {
    if (!visible) {
      await getData(line);
    }
    setVisible(!visible);
  };
  const inspection_data = calculateInspections();
  const delay_data = calculateDelay();
  const renderData = () => {
    return inspection_data.isValid ? (
      <Text>{inspection_data.text}</Text>
    ) : (
      <View>
        <View style={styles.dataContainer}>
          <DropDown
            isOpen={delay_open}
            setIsOpen={(open: boolean) => {
              setDelayOpen(open);
            }}
            title="Késés"
            chartData={[
              { value: delay_data.naysayers, color: baseStyles.colors.silver },
              {
                value: delay_data.yaysayers,
                color: baseStyles.colors.lapisLazuli,
              },
            ]}
            chartWidth={100}
            description={`legutóbbi 2 órában \nIgennel: ${delay_data.yaysayers} | Nemmel: ${delay_data.naysayers}`}
          />
        </View>
        <View style={styles.dataContainer}>
          <DropDown
            isOpen={inspection_open}
            setIsOpen={(open: boolean) => {
              setInspectionOpen(open);
            }}
            title="Ellenőrzés"
            chartData={inspection_data.series}
            chartWidth={100}
            description={`legutóbbi 2 órában \n${inspection_data.votecount.yayvotes} / ${inspection_data.votecount.allvotes}`}
          />
        </View>
        <View style={styles.dataContainer}>
          <DropDown
            isOpen={occupancy_open}
            setIsOpen={(open: boolean) => {
              setOccupancyOpen(open);
            }}
            title="Foglalt helyek"
            chartData={[
              {
                value: calculateOccupancy(),
                color: baseStyles.colors.russianViolet,
              },
              {
                value: 10 - calculateOccupancy(),
                color: baseStyles.colors.silver,
              },
            ]}
            chartWidth={100}
            description={`legutóbbi 2 órában \n${calculateOccupancy()}`}
          />
        </View>
      </View>
    );
  };

  const renderVoteInterface = () => {
    return (
      <View>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={[
                baseStyles.baseStyles.darkSlateGrayH3,
                {
                  textAlign: "center",
                  // borderColor: "red",
                  // borderWidth: 1,
                  flex: 1, // Takes available space
                },
              ]}
            >
              Volt ellenőr?
            </Text>
            <TouchableOpacity
              style={{
                // borderColor: "red",
                // borderWidth: 1,
                marginLeft: "auto", // Pushes to right
              }}
              onPress={() => {
                setVoting(!isVoting);
                setDisabled(!disabled);
                console.log(disabled);
              }}
            >
              <AntDesign
                name="closecircle"
                size={24}
                color={baseStyles.colors.russianViolet}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              flex: 2,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setInspectionSelected(true);
                setInspectionPassed(true);
              }}
            >
              <View
                style={[
                  { margin: 5, borderRadius: 10, padding: 10 },
                  selected_inspection
                    ? baseStyles.baseStyles.russianVioletBackground
                    : baseStyles.baseStyles.silver2Background,
                ]}
              >
                <Text style={baseStyles.baseStyles.silverText}>Igen</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setInspectionSelected(false);
                setInspectionPassed(true);
              }}
            >
              <View
                style={[
                  { margin: 5, borderRadius: 10, padding: 10 },
                  !selected_inspection
                    ? baseStyles.baseStyles.russianVioletBackground
                    : baseStyles.baseStyles.silver2Background,
                ]}
              >
                <Text style={baseStyles.baseStyles.silverText}>Nem</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <Text
              style={[
                baseStyles.baseStyles.darkSlateGrayH3,
                { textAlign: "center" },
              ]}
            >
              Késett a {line}?
            </Text>
            <View
              style={{
                flexDirection: "row",
                flex: 2,
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setDelaySelected(true);
                  setDelayPassed(true);
                }}
              >
                <View
                  style={[
                    { margin: 5, borderRadius: 10, padding: 10 },
                    select_delay
                      ? baseStyles.baseStyles.russianVioletBackground
                      : baseStyles.baseStyles.silver2Background,
                  ]}
                >
                  <Text style={baseStyles.baseStyles.silverText}>Igen</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDelaySelected(false);
                  setDelayPassed(true);
                }}
              >
                <View
                  style={[
                    { margin: 5, borderRadius: 10, padding: 10 },
                    !select_delay
                      ? baseStyles.baseStyles.russianVioletBackground
                      : baseStyles.baseStyles.silver2Background,
                  ]}
                >
                  <Text style={baseStyles.baseStyles.silverText}>Nem</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text>mennyire van tele?</Text>
            <View>
              <Slider
                minimumValue={0}
                maximumValue={10}
                step={1}
                maximumTrackTintColor={baseStyles.colors.silver2}
                minimumTrackTintColor={baseStyles.colors.russianViolet}
                thumbTintColor={baseStyles.colors.russianViolet}
                renderStepNumber={true}
                style={{ marginBottom: 20 }}
                onValueChange={(val) => {
                  setOccupancy(val);
                }}
              ></Slider>
            </View>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              setVoting(!isVoting);
              submitVote();
            }}
          >
            <View
              style={[
                baseStyles.baseStyles.russianVioletBackground,
                { padding: 4, borderRadius: 10, margin: 4 },
              ]}
            >
              <Text
                style={[
                  baseStyles.baseStyles.silverH3,
                  { textAlign: "center" },
                ]}
              >
                Tipp Leadása
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const submitVote = async () => {
    if (delayPassed && inspectionPassed && occupancy != -1) {
      const votesCollection = collection(firestore, "votes");
      await setDoc(doc(votesCollection), {
        line: line,
        isDelayed: select_delay,
        isInspected: selected_inspection,
        occupancy: occupancy,
        timestamp: Timestamp.fromDate(new Date(Date.now())),
      });
      getData(line);
      setDisabled(!disabled);
    } else {
      Alert.alert("Na, mit kezdjek egy üres tippel!?", "Töltsd ki rendesen!", [
        { text: "Értettem!" },
      ]);
    }
  };
  return (
    <TouchableOpacity disabled={disabled} onPress={handlePress}>
      <View
        style={[
          styles.ScrollViewItem,
          baseStyles.baseStyles.russianVioletBackground,
        ]}
      >
        <Text style={baseStyles.baseStyles.silverText}>{line}</Text>

        {/* {loading && <Text>Loading...</Text>} */}
        {loading && (
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: baseStyles.colors.silver, // Use your color system
              padding: 20,
              borderRadius: 10,
              marginVertical: 10,
            }}
          >
            <ActivityIndicator
              size="large"
              color={baseStyles.colors.russianViolet}
              style={{ marginBottom: 10 }}
            />
            <Text
              style={[
                baseStyles.baseStyles.darkSlateGrayH3,
                {
                  textAlign: "center",
                  fontStyle: "italic",
                  opacity: 0.8,
                },
              ]}
            >
              Adatok betöltése...
            </Text>
          </View>
        )}
        {visible && !loading && (
          <View
            style={[
              baseStyles.baseStyles.silverBackground,
              {
                alignSelf: "center",
                borderRadius: 10,
                width: "100%",
                padding: 3,
                margin: 6,
              },
            ]}
          >
            {renderData()}
            {isVoting ? renderVoteInterface() : null}
            {!isVoting ? (
              <TouchableOpacity
                onPress={() => {
                  setVoting(!isVoting);
                  setDisabled(!disabled);
                }}
              >
                <View
                  style={[
                    baseStyles.baseStyles.russianVioletBackground,
                    { padding: 4, borderRadius: 10, margin: 4 },
                  ]}
                >
                  <Text
                    style={[
                      baseStyles.baseStyles.silverH3,
                      { textAlign: "center" },
                    ]}
                  >
                    Adj Le egy Tippet!
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
