import ScheduleScreen from "./client";
import useMakeBackendRequest from "../lib/makeBackendRequest";

export default async function MainPage() {

    const { events } = await useMakeBackendRequest('/api/event');

    return (
        <>
            <ScheduleScreen 
                events={events}
            >
                
            </ScheduleScreen>
        </>
    )
}