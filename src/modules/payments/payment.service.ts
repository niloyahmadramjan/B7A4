import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config/index.js";
import { handelCheckoutCompleted } from "../../utils/paymentHandler";

const createPaymentSession = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
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

          unit_amount: Math.round(booking.service.price * 100),
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
      transactionId: session.id,
      amount: booking.service.price,
      method: PaymentMethod.STRIPE,
      provider: "STRIPE",
      status: PaymentStatus.PENDING,
    },
  });

  return {
    checkoutUrl: session.url,
  };
};

const confirmPayment = async (payload: Buffer, signature: string) => {
  const endPointSecret = config.stripe_webhook_secret as string;
  console.log(endPointSecret);
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endPointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      console.log("checkout completed");

      await handelCheckoutCompleted(event.data.object);
      break;

    default:
      console.log(`no event match, unhandled event type ${event.type}`);
      break;
  }
};

const getMyPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: {
      booking: {
        customerId,
      },
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

const getPaymentById = async (paymentId: string) => {
  const payment = await prisma.payment.findFirstOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        include: {
          service: true,
          technician: true,
        },
      },
    },
  });

  return payment;
};

export const PaymentService = {
  createPaymentSession,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
