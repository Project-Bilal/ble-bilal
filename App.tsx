import { StatusBar } from "expo-status-bar";
import { styles } from "./styles"; // Adjust the path if necessary
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Linking,
  FlatList,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { useState, useEffect, useRef } from "react";
import { Buffer } from "buffer";
import React from "react";
import { SERVICE_UUID, CHARACTERISTIC_UUID } from "./config"; // Adjust the path as necessary

// Create a new instance of the BleManager
const bleManager = new BleManager();

export default function App() {
  // connectionStatus can be "searching", "connecting", "connected", "done", "error", "waiting"
  const [connectionStatus, setConnectionStatus] = useState("searching");
  // ssid and password are the values of the input fields
  const [ssidList, setSSIDList] = useState<[string, number][]>([]);
  const [ssid, setSSID] = useState("");
  const [password, setPassword] = useState("");
  const [securityType, setSecurityType] = useState(0);
  // deviceID is the ID of the device we are connecting to
  const [deviceID, setDeviceID] = useState<null | string>(null);
  // deviceRef is a reference to the device we are connecting to
  const deviceRef = useRef<Device | null>(null);

  // This effect will run once when the app loads
  useEffect(() => {
    searchAndConnectToDevice(); // Start searching for the device
  }, []);

  // When the app loads this will search for the device and connect to it
  const searchAndConnectToDevice = async () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setConnectionStatus("error");
        console.error(error);
        return;
      }
      // specifically looking for the device with the name "Bilal-Cast"
      if (device && device.localName === "Bilal-Cast") {
        // specifically looking for the device with the a particular service UUID
        if (device.serviceUUIDs && device.serviceUUIDs.includes(SERVICE_UUID)) {
          bleManager.stopDeviceScan();
          // this will cause the UI to update
          setConnectionStatus("connected");
          connectToDevice(device);
        }
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      const connectedDevice = await device.connect();
      setDeviceID(connectedDevice.id);
      deviceRef.current = connectedDevice;
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Setup notification listener
      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("Notification error:", error);
            cleanupConnection();
            setConnectionStatus("Reconnecting");
            // wait 3 seconds and retry connecting to the device
            setTimeout(() => {
              searchAndConnectToDevice();
            }, 3000);
          }
          if (characteristic?.value) {
            handleNotification(characteristic.value);
          }
        }
      );
      sendMessage("wifiList"); // Ask the phone to send us the list
    } catch (error) {
      console.log("Failed to connect or discover services:", error);
      cleanupConnection();
      setConnectionStatus("Reconnecting");
      // wait 3 seconds and retry connecting to the device
      setTimeout(() => {
        searchAndConnectToDevice();
      }, 3000);
    }
  };

  const handleNotification = (value: string) => {
    const message = Buffer.from(value, "base64").toString("ascii");
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage["HEADER"] === "wifiList") {
        if (parsedMessage["MESSAGE"] === "start") {
          setSSIDList([]);
        }
        if (parsedMessage["MESSAGE"] === "ssid") {
          setSSIDList((prev) => [
            ...prev,
            [parsedMessage["SSID"], parsedMessage["SECURITY"]],
          ]);
        }
        if (parsedMessage["MESSAGE"] === "end") {
          // 2 second delay for cleaner UI
          setTimeout(() => {
            setConnectionStatus("wifiList");
          }, 2000);
        }
        if (parsedMessage["HEADER"] === "network_written") {
          console.log("Network info written to ESP32");
        }
      } else if (parsedMessage["HEADER"] === "wifiError") {
        setConnectionStatus("error");
        cleanupConnection();
      } else {
        console.log("Failed to parse notification:", message);
      }
    } catch (e) {
      console.error("Failed to parse notification:", e);
    }
  };

  const cleanupConnection = () => {
    // TODO: add subscription removal?
    if (deviceRef.current) {
      deviceRef.current.cancelConnection();
      deviceRef.current = null;
    }
  };

  const handleWiFiSelection = (selectedSSID: string, security: number) => {
    setSSID(selectedSSID);
    setSecurityType(security);
    setConnectionStatus("submitSSID");
  };

  const goBack = () => {
    setPassword(""); // Clear the password field
    sendMessage("wifiList");
  };

  const connectButton = () => {
    setPassword(""); // Clear the password field
    sendMessage("shareWifi");
  };

  // sending messages back to the device
  const sendMessage = async (header: string) => {
    if (deviceRef.current) {
      let message = {}; // Declare message once
      if (header === "wifiList") {
        setConnectionStatus("connected");
        message = "";
      }
      if (header === "idle") {
        message = "";
      }
      if (header === "shareWifi") {
        setConnectionStatus("waiting");
        message = { SSID: ssid, PASSWORD: password, SECURITY: securityType };
      }
      const messageObj = {
        HEADER: header,
        MESSAGE: message,
      };
      console.log("sending message:", messageObj);
      const messageString = JSON.stringify(messageObj); // Convert the object to a JSON string

      try {
        await deviceRef.current.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          Buffer.from(messageString).toString("base64")
        );
      } catch (error) {
        console.error("Failed to send message", error);
        setConnectionStatus("error");
      }
    } else {
      console.log("Device is not connected");
      setConnectionStatus("error");
      console.log(connectionStatus);
    }
  };

  // This is the UI for the app, needs a lot of work
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.blueBackground}>
          <Text style={styles.headerText}>Bilal Cast Onboarding App v2</Text>
          <Text style={styles.descriptionText}>
            This is the companion app for Bilal Cast. Use it to onboard the
            device to your local WiFi network where your smart speakers are
            located.
          </Text>
          <Text
            style={styles.linkText}
            onPress={() => Linking.openURL("http://projectbilal.com")}
          >
            Project Bilal Website
          </Text>
        </View>
        <View style={styles.whiteBackground}>
          {connectionStatus === "searching" && (
            <>
              <Text style={styles.bodyText}>
                Make sure the Bilal Cast Devie is plugged and near by.{"\n"}
              </Text>
              <Text style={styles.bodyTextBold}>Searching...{"\n"}</Text>
              <Text style={styles.bodyText}>
                If your device is already online you won't see it here.
              </Text>
            </>
          )}
          {connectionStatus === "connected" && (
            <>
              <Text style={styles.bodyTextBold}>
                Bilal Cast device found ✅{"\n"}{" "}
              </Text>
              <Text style={styles.bodyText}>
                Loading available networks 🛜{"\n"}
              </Text>
            </>
          )}
          {connectionStatus === "submitSSID" && (
            <>
              <Text style={styles.bodyTextBold}>{ssid}</Text>

              {/* Conditionally render the password input only if securityType is not "0" */}
              {securityType !== 0 && (
                <TextInput
                  style={styles.input}
                  onChangeText={setPassword}
                  value={password}
                  placeholder="Enter Password"
                  secureTextEntry
                />
              )}

              {/* Container for buttons with flexDirection: 'row' */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    password.length < 8 && { backgroundColor: "#ccc" }, // Disable style if password is too short
                  ]}
                  onPress={connectButton}
                  disabled={password.length < 8} // Disable button if password is less than 8 characters
                >
                  <Text style={styles.buttonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {connectionStatus === "done" && (
            <>
              <Text style={styles.bodyTextBold}>
                The device is now connected to your WiFi network.{"\n"}
              </Text>
              <Text
                style={{
                  paddingHorizontal: 20,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                It will connect automatically to the WiFi network when it is
                plugged in. You can close this app.
              </Text>
            </>
          )}
          {connectionStatus === "error" && (
            <>
              <Text style={styles.bodyText}>
                Oops something went wrong. {"\n"} {"\n"}Please disconnect Bilal
                Cast and plug it back in then restart this app.
              </Text>
            </>
          )}
          {connectionStatus === "waiting" && (
            <>
              <Text style={styles.bodyText}>
                Please wait... attempting to onboard Bilal Cast to your WiFi.
                {"\n"}
              </Text>
              <Text style={{}}>
                If this takes more than a minute, please unplug Bilal Cast and
                replug it in. Then restart this app.
              </Text>
            </>
          )}
          {connectionStatus === "wifiList" && (
            <>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={() => sendMessage("wifiList")}
                >
                  <Text style={styles.buttonText}>Refresh Network List</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.bodyTextBold}>
                Available Wi-Fi Networks 🛜
              </Text>
              <FlatList
                data={ssidList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      handleWiFiSelection(item[0], item[1]); // Call the custom function here
                    }}
                  >
                    <View style={styles.wifiItem}>
                      <Text style={styles.wifiText}>{item[0]}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {connectionStatus === "Reconnecting" && (
            <>
              <Text style={styles.bodyText}>Reconnecting...</Text>
            </>
          )}
          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
    </View>
  );
}
