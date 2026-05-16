import { useNotifications } from "../../_lib/use-notifications";

export default function NotificationsBrokenPage() {
  useNotifications("broken");
  return null;
}
