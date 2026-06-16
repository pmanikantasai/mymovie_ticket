from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Seat, Booking
from .serializers import SeatSerializer, BookingSerializer
from movies.models import Show
from .utils import generate_ticket_pdf

class SeatLayoutView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, show_id):
        show = get_object_or_404(Show, id=show_id)
        
        # Check and release expired locks first
        expired_seats = Seat.objects.filter(show=show, status='LOCKED')
        for seat in expired_seats:
            seat.check_and_release_lock()

        seats = Seat.objects.filter(show=show).order_by('seat_number')
        if not seats.exists():
            # Create a standard 10x10 seat layout dynamically
            # VIP: Row A-B, Premium: Row C-G, Normal: Row H-J
            rows = {
                'A': ('VIP', 300.00), 'B': ('VIP', 300.00),
                'C': ('Premium', 200.00), 'D': ('Premium', 200.00), 'E': ('Premium', 200.00), 'F': ('Premium', 200.00), 'G': ('Premium', 200.00),
                'H': ('Normal', 120.00), 'I': ('Normal', 120.00), 'J': ('Normal', 120.00)
            }
            created_seats = []
            for r, (cat, price) in rows.items():
                for num in range(1, 11):
                    created_seats.append(Seat(
                        show=show,
                        seat_number=f"{r}{num}",
                        category=cat.upper(),
                        price=price
                    ))
            Seat.objects.bulk_create(created_seats)
            seats = Seat.objects.filter(show=show).order_by('seat_number')

        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)

class LockSeatsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        seat_ids = request.data.get('seat_ids', [])
        show_id = request.data.get('show_id')
        
        if not seat_ids or not show_id:
            return Response({"error": "Seat IDs and Show ID are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        show = get_object_or_404(Show, id=show_id)
        
        # Lock rows in DB to prevent race conditions
        seats = Seat.objects.select_for_update().filter(id__in=seat_ids, show=show)
        
        if len(seats) != len(seat_ids):
            return Response({"error": "One or more seat IDs are invalid for this show."}, status=status.HTTP_404_NOT_FOUND)

        # Validate that all selected seats are available (or have expired locks)
        for seat in seats:
            seat.check_and_release_lock()
            if seat.status != 'AVAILABLE':
                return Response({"error": f"Seat {seat.seat_number} is no longer available."}, status=status.HTTP_400_BAD_REQUEST)

        # Lock seats for the user
        now = timezone.now()
        for seat in seats:
            seat.status = 'LOCKED'
            seat.locked_by = request.user
            seat.locked_at = now
            seat.save()

        # Calculate totals
        from decimal import Decimal
        base_amount = sum(seat.price for seat in seats)
        convenience_fee = Decimal('30.00')
        tax = base_amount * Decimal('0.18') # 18% GST
        total_amount = base_amount + convenience_fee + tax

        # Create pending booking
        booking = Booking.objects.create(
            user=request.user,
            show=show,
            total_amount=total_amount,
            convenience_fee=convenience_fee,
            tax=tax,
            status='PENDING'
        )
        
        # Associate seats with the booking
        for seat in seats:
            seat.booking = booking
            seat.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BookingHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

class AdminBookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAdminUser,)
    pagination_class = None
