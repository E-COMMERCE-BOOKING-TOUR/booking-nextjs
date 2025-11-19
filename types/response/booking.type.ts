import { ICurrency } from "./base.type";
import { ITourInventoryHold, ITourPaxType, ITourSession, ITourVariant } from "./tour.type";
import { IPaymentInformation, IUser } from "./user.type";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial';
export type BookingPaymentStatus = 'active' | 'inactive';


export interface IBookingPayment {
  id: number;
  payment_method_name: string;
  rule_min: number;
  rule_max: number;
  status: BookingPaymentStatus;
  bookings: IBooking[];
  currency: ICurrency;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IBookingItem {
  id: number;
  total_amount: number;
  unit_price: number;
  quantity: number;
  booking: IBooking;
  variant: ITourVariant;
  pax_type: ITourPaxType;
  tour_session: ITourSession;
  booking_passengers: IBookingPassenger[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IBookingPassenger {
  id: number;
  full_name: string;
  birthdate?: Date | null;
  phone_number?: string | null;
  booking_item: IBookingItem;
  pax_type: ITourPaxType;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IBooking {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;

  user: IUser;
  currency: ICurrency;
  payment_information: IPaymentInformation;
  tour_inventory_hold: ITourInventoryHold;

  booking_items: IBookingItem[];
  booking_payment: IBookingPayment;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}