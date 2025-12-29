import fetchC from "@/libs/fetchC";
import { SiteSettings } from "./admin/settings";
import { cache } from 'react';

export const settingsApi = {
    get: cache(async (): Promise<SiteSettings> => {
        return fetchC.get("/settings", { next: { revalidate: 3600 } }); // 1h
    }),
};
