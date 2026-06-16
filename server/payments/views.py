from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from bookings.models import Booking, Seat
from bookings.serializers import BookingSerializer
from .models import Payment
from bookings.utils import generate_ticket_pdf
import uuid

class ProcessPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        booking_id = request.data.get('booking_id')
        payment_method = request.data.get('payment_method', 'Card')
        
        if not booking_id:
            return Response({"error": "Booking ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Select for update to lock the booking row
        booking = get_object_or_404(Booking.objects.select_for_update(), booking_id=booking_id, user=request.user)
        
        if booking.status != 'PENDING':
            return Response({"error": f"Booking has status {booking.status}. Payment cannot be processed."}, status=status.HTTP_400_BAD_REQUEST)
            
        seats = Seat.objects.select_for_update().filter(booking=booking)
        
        # Verify seats are still locked by this user
        for seat in seats:
            if seat.status != 'LOCKED' or seat.locked_by != request.user:
                booking.status = 'CANCELLED'
                booking.save()
                return Response({"error": "Seat lock has expired or seats are no longer reserved. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
                
        # Update seat statuses to booked and release lock details
        for seat in seats:
            seat.status = 'BOOKED'
            seat.locked_by = None
            seat.locked_at = None
            seat.save()
            
        # Update booking status
        booking.status = 'CONFIRMED'
        booking.save()
        
        # Create Payment Record
        txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment = Payment.objects.create(
            booking=booking,
            payment_id=txn_id,
            amount=booking.total_amount,
            status='SUCCESS',
            payment_method=payment_method
        )
        
        # Generate the PDF ticket and scannable QR Code
        generate_ticket_pdf(booking)
        booking.save()
        
        serializer = BookingSerializer(booking)
        return Response({
            "message": "Payment processed successfully.",
            "payment": {
                "payment_id": payment.payment_id,
                "amount": float(payment.amount),
                "status": payment.status,
                "payment_method": payment.payment_method,
            },
            "booking": serializer.data
        }, status=status.HTTP_200_OK)
