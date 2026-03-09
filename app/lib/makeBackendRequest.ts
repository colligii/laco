import axios from "axios";
import { cookies } from "next/headers";

export default async function useMakeBackendRequest(path: string, method: string = 'GET') {
    const cookieStore = cookies();

    const cookieHeader = (await cookieStore)
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const { data } = await axios.request(
        {
            url: `${process.env.API_URL!}${path}`,
            method,
            headers: {
                Cookie: cookieHeader
            }
    });

    return data;
}