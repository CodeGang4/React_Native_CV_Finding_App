import React, { useEffect } from "react";
import JobDetailScreen from "../../../../shared/screens/JobDetailScreen";
import {
  getCallbacks,
  unregisterCallbacks,
} from "../../../../shared/utils/callbackRegistry";

export default function JobDetailPage({ route, navigation }) {
  const job = route?.params?.job || null;
  const cbKey = route?.params?.cbKey;
  const { onEdit, onDelete } = getCallbacks(cbKey);

  useEffect(() => {
    // Cleanup callbacks when unmounting this screen
    return () => unregisterCallbacks(cbKey);
  }, [cbKey]);

  const onBack = () => {
    if (navigation && navigation.canGoBack()) navigation.goBack();
  };

  return (
    <JobDetailScreen
      job={job}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={(id) => {
        onDelete && onDelete(id);
        onBack();
      }}
    />
  );
}
