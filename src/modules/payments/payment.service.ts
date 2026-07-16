import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createPaymentSession = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: userId,
    },

    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "ACCEPTED") {
    throw new Error("Payment only allowed after technician acceptance");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      bookingId,
    },
  });

  if (existingPayment && existingPayment.status === "COMPLETED") {
    throw new Error("Payment already completed");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "bdt",

          product_data: {
            name: booking.service.title,
          },

          unit_amount: Math.round(booking.totalAmount * 100),
        },

        quantity: 1,
      },
    ],

    metadata: {
      bookingId,

      userId,
    },

    success_url: `${process.env.FRONTEND_URL}/payment-success`,

    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
  });

  await prisma.payment.create({
    data: {
      bookingId,

      userId,

      amount: booking.totalAmount,

      provider: "STRIPE",

      transactionId: session.id,

      paymentIntentId: (session.payment_intent as string) || null,

      currency: "BDT",

      status: "PENDING",
    },
  });

  return {
    checkoutUrl: session.url,
  };
};

const confirmPayment = async (body: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    body,

    signature,

    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      throw new Error("Booking ID missing");
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: {
          transactionId: session.id,
        },

        data: {
          status: "COMPLETED",

          paidAt: new Date(),

          paymentIntentId: session.payment_intent as string,

          method: "CARD",
        },
      });

      await tx.booking.update({
        where: {
          id: bookingId,
        },

        data: {
          status: "PAID",
        },
      });
    });
  }

  return {
    received: true,
  };
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });
};

const getPaymentById = async (id: string, userId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      userId,
    },

    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

export const PaymentService = {
  createPaymentSession,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
