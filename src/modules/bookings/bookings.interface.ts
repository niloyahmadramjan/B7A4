export interface ICreateBooking {

    serviceId: string;

    bookingDate: Date;

    startTime: string;

    endTime: string;

    address: string;

    notes?: string;

}