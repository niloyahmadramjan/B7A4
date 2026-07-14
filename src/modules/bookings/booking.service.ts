// Create Booking

import { prisma } from "../../lib/prisma";
import { ICreateBooking } from "./bookings.interface";

const createBooking = async (customerId: string, payload: ICreateBooking) => {
  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },

    include: {
      technician: true,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (!service.isActive) {
    throw new Error("Service is not available");
  }

  // technicianProfile.userId
  const technicianId = service.technician.userId;

  const booking = await prisma.booking.create({
    data: {
      customerId,

      technicianId,

      serviceId: service.id,

      bookingDate: payload.bookingDate,

      startTime: payload.startTime,

      endTime: payload.endTime,

      address: payload.address,

      notes: payload.notes,

      totalAmount: service.price,
    },

    include: {
      service: true,

      technician: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  return booking;
};

// Get Customer Bookings

const getMyBookings = async (customerId: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      customerId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      service: {
        include: {
          category: true,
        },
      },

      technician: {
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
        },
      },

      payment: true,

      review: true,
    },
  });

  return bookings;
};

// Get Single Booking

const getBookingById = async (id: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id,

      OR: [
        {
          customerId: userId,
        },

        {
          technicianId: userId,
        },
      ],
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },

      technician: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },

      payment: true,

      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
};
