import fetchC from "@/libs/fetchC";
import { ITour } from "@/types/response/tour.type";

type CreateTourDTO = {
  title: string;
  description: string;
  summary: string;
  map_url?: string | null;
  slug: string;
  address: string;
  score_rating?: number | null;
  tax: number;
  is_visible: boolean;
  published_at?: string | null;
  status: "draft" | "active" | "inactive";
  duration_hours?: number | null;
  duration_days?: number | null;
  min_pax: number;
  max_pax?: number | null;
  country_id: number;
  division_id: number;
  currency_id: number;
  supplier_id: number;
  tour_category_ids?: number[];
  images?: { image_url: string; sort_no?: number; is_cover?: boolean }[];
};

export const tourApi = {
  create: async (dto: CreateTourDTO) => {
    const url = "/tour/create";
    const res: ITour = await fetchC.post(url, dto, { cache: "no-store" });
    return res;
  },
};

export type { CreateTourDTO };