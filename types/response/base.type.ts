import { IBooking, IBookingPayment } from "./booking.type";
import { ITour, ITourVariant } from "./tour.type";
import { IUser } from "./user.type";

export interface ICountry {
    id: number;
    name: string;
    iso3: string;
    local_name: string | null;
    phone_code: string | null;
    divisions: IDivision[];
    users: IUser[];    
    tours: ITour[];     
}

export interface IDivision {
    id: number;
    name: string;
    level: number | string;
    name_local: string;
    code: string | null;
    country: ICountry;
    tours: ITour[];
    parent_id?: number | null;
    parent?: IDivision | null;
    children: IDivision[];
}

export interface ICurrency {
    id: number;
    name: string;
    symbol: string;
    tours: ITour[];
    tour_variants: ITourVariant[];
    bookings: IBooking[];
    booking_payments: IBookingPayment[];
}