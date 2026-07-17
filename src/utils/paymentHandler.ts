import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../generated/prisma/enums";

export const handelCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
        console.log("Missing bookingId in session metadata:", session.id);
        return;
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId: session.id },
    });

    if (!payment) {
        console.log("Payment record not found for session:", session.id);
        return;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
        return;
    }

    await prisma.$transaction(async (tex) => {

       await tex.payment.update({
            where: {
                id: payment.id
            },
            data: {
                status: PaymentStatus.COMPLETED,
                paidAt: new Date()
            }
        })
       await tex.booking.update({
            where: {
                id:bookingId
            },
            data: {
                status:BookingStatus.PAID
            }
        })

    })

    
};