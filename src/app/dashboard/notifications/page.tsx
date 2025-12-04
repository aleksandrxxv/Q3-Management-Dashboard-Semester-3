export const dynamic = 'force-dynamic';

import { fetchNotifications } from "@/lib/supabase/notification";
import Header from "../header";
import NotificationTabs from "./tabs";
import { unstable_cache } from "next/cache";

export default async function Page() {
    const getNotificationsCached = unstable_cache(
    async () => fetchNotifications(),
    ["notifications"],
    { revalidate: 10 }
  );
    const notifications = await getNotificationsCached();

    return (

        <>
            <Header 
                title="Notifications"
                description="Overview of all notifications"
                />

                <NotificationTabs notifications={notifications} />

            
        </>
    );
}