import PurchaseHistoryScreen from "@/screens/history/history.screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function history() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PurchaseHistoryScreen />
    </SafeAreaView>
    
  )
}