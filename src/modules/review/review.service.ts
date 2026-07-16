import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const giveReviewOnTechnician = async (
  userId: string,
  bookingId: string,
  rating: number,
  comment?: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new Error("You are not the customer for this booking");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error(
      "cannot review a booking that is  Job must be completed first",
    );
  }

  if (booking.review) {
    throw new Error("You have already reviewed this booking");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const result = await prisma.$transaction(async (tex) => {
    //   create review
    const review = await tex.review.create({
      data: {
        bookingId: booking.id,
        customerId: userId,
        technicianId: booking.technicianId,
        rating,
        comment,
      },
    });

    const aggregate = await tex.review.aggregate({
      where: {
        technicianId: booking.technicianId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    await tex.technicianProfile.update({
      where: {
        id: booking.technicianId,
      },
      data: {
        rating: aggregate._avg.rating ?? 0,
        totalReviews: aggregate._count.rating,
      },
    });

    return review;
  });

  return result;
};

export const reviewService = {
  giveReviewOnTechnician,
};
