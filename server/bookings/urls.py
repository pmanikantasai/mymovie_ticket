from django.urls import path
from .views import SeatLayoutView, LockSeatsView, BookingHistoryView, AdminBookingListView

urlpatterns = [
    path('shows/<int:show_id>/seats/', SeatLayoutView.as_view(), name='seat_layout'),
    path('lock/', LockSeatsView.as_view(), name='lock_seats'),
    path('my-bookings/', BookingHistoryView.as_view(), name='my_bookings'),
    path('admin/list/', AdminBookingListView.as_view(), name='admin_bookings'),
]
