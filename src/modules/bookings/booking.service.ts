import { prisma } from "../../lib/prisma";
import { IBooking } from "./bookings.interface";

const createBooking = async (customerId: string, payload: IBooking) => {
  const { serviceId, scheduledAt, address, notes } = payload;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  const result = await prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      address,
      notes,
      status: "REQUESTED",
    },
  });

  return result;
};

const getMyBookings = async (customerId: string) => {
  const result = prisma.booking.findMany({
    where: {
      customerId,
    },

    include: {
      service: {
        include: {
          category: true,
        },
      },
      technician: true,
      payment: true,
    },
  });

  return result;
};

const getBookingById = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      technician: {
        include: {
          user: true,
        },
      },
      service: true,
      payment: true,
      customer: true,
      review: true,
    },
  });
  return booking;
};

const cancelBooking = async (bookingId: string, customerId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new Error("Booking not found");
  if (booking.customerId !== customerId) throw new Error("Not your booking");

  // only allow cancel before IN_PROGRESS
  const nonCancellable = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (nonCancellable.includes(booking.status)) {
    throw new Error(
      `Cannot cancel a booking that is already ${booking.status}`,
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
