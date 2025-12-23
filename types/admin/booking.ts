export interface IAdminBookingItemPassenger {
    full_name: string;
    birthdate?: string;
    phone_number?: string;
}

export interface IAdminBookingItem {
    id: number;
    tour_title: string;
    variant_name?: string;
    variant?: { name: string };
    pax_type_name: string;
    session_date?: string;
    start_time?: string;
    end_time?: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    booking_passengers: IAdminBookingItemPassenger[];
}

export interface IAdminBookingDetail {
    id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    status: string;
    created_at: string;
    total_amount: number;
    payment_status: string;
    booking_items: IAdminBookingItem[];
    booking_payment?: {
        payment_method_name: string;
    };
}
