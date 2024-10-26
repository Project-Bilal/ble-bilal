import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C9E4E7",
  },
  safeAreaView: {
    flex: 1,
  },
  blueBackground: {
    backgroundColor: "#C9E4E7",
  },
  whiteBackground: {
    flex: 1,
    backgroundColor: "white",
    marginBottom: 30,
    paddingTop: 20,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  descriptionText: {
    paddingHorizontal: 30,
    paddingTop: 20,
    textAlign: "center",
  },
  bodyText: {
    paddingHorizontal: 20,
    textAlign: "center",
    fontSize: 18,
  },
  bodyTextBold: {
    paddingHorizontal: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  linkText: {
    color: "blue",
    textAlign: "center",
    paddingVertical: 10,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
  buttonContainer: {
    flexDirection: 'row',          // Arrange buttons in a row
    justifyContent: 'space-between', // Space them between the left and right
    paddingHorizontal: 20,          // Adjust as needed for padding
    marginBottom: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#636363',       // Light gray for the back button (customize as needed)
    padding: 10,
    marginRight: 10,               // Space between back and connect button
    alignItems: 'center',          // Center text horizontally
    borderRadius: 5,
  },
  connectButton: {
    flex: 1,
    backgroundColor: '#007AFF',    // Blue color for the connect button (customize as needed)
    padding: 10,
    marginLeft: 10,                // Space between connect and back button
    alignItems: 'center',          // Center text horizontally
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',                // Text color for both buttons
    fontSize: 16,
    fontWeight: 'bold',
  },
  wifiItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  wifiText: {
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#28799c',       // Light gray for the back button (customize as needed)
    padding: 10,              // Space between back and connect button
    alignItems: 'center',          // Center text horizontally
    borderRadius: 5,
  },
});
