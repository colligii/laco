import axios from "axios";
import { cookies } from "next/headers";

export default async function useMakeBackendRequest(path: string) {
    const cookieStore = cookies();

    const cookieHeader = (await cookieStore)
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const { data } = await axios.get(`${process.env.API_URL!}${path}`, {
        headers: {
            Cookie: cookieHeader
        }
    });

    return data;
}