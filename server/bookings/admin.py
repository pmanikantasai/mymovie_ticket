from django.contrib import admin
from .models import Booking, Seat

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'user', 'show', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('booking_id', 'user__username', 'show__movie__title')

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'show', 'category', 'price', 'status', 'locked_by')
    list_filter = ('status', 'category', 'show__theater')
    search_fields = ('seat_number', 'show__movie__title', 'locked_by__username')
