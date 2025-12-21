export interface IBookingPassenger {
    full_name: string;
    phone_number: string;
    pax_type_name: string;
}

export interface IBookingDetail {
    id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    total_amount: number;
    status: string;
    payment_status: string;
    currency: string;
    tour_title: string;
    tour_image: string;
    tour_location: string;
    start_date: string;
    session_start_time?: string;
    session_end_time?: string;
    duration_days: number;
    duration_hours: number;
    hold_expires_at?: string;
    items: {
        variant_id: number;
        pax_type_id: number;
        tour_session_id: number;
        quantity: number;
        unit_price: number;
        total_amount: number;
        pax_type_name: string;
    }[];
    passengers: IBookingPassenger[];
    booking_payment?: {
        id: number;
        payment_method_name: string;
    };
    payment_method?: string;
    payment_information?: {
        brand?: string;
        last4?: string;
        expiry_date?: string;
        account_holder?: string;
    };
}

export interface IConfirmBooking {
    booking_id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    payment_method: string;
}

export interface IPaymentMethod {
    id: number;
    payment_method_name: string;
    rule_min: number;
    rule_max: number;
    currency: string;
}
