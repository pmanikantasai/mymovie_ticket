from rest_framework import serializers
from .models import Seat, Booking
from movies.serializers import ShowSerializer

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ('id', 'seat_number', 'category', 'price', 'status', 'locked_by', 'locked_at')

    def to_representation(self, instance):
        # Dynamically check and release expired locks
        instance.check_and_release_lock()
        return super().to_representation(instance)

class BookingPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        from payments.models import Payment
        model = Payment
        fields = ('payment_id', 'amount', 'status', 'payment_method', 'created_at')

class BookingSerializer(serializers.ModelSerializer):
    show_details = ShowSerializer(source='show', read_only=True)
    seats_details = SeatSerializer(source='seats', many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    payment_details = BookingPaymentSerializer(source='payments', many=True, read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'booking_id', 'user', 'username', 'show', 'show_details', 'status', 'total_amount', 'convenience_fee', 'tax', 'created_at', 'qr_code', 'pdf_ticket', 'seats_details', 'payment_details')
        read_only_fields = ('booking_id', 'status', 'total_amount', 'qr_code', 'pdf_ticket', 'created_at')
