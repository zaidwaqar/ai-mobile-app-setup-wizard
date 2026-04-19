import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
  },
  NotificationFeedbackType: {
    Success: "success",
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
