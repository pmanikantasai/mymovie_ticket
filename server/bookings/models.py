from django.db import models
from django.conf import settings
from movies.models import Show
from django.utils import timezone
import uuid

class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='bookings')
    booking_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    convenience_fee = models.DecimalField(max_digits=6, decimal_places=2, default=30.00)
    tax = models.DecimalField(max_digits=6, decimal_places=2, default=18.00)
    created_at = models.DateTimeField(auto_now_add=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True) # Will be uploaded to media
    pdf_ticket = models.FileField(upload_to='tickets/', blank=True, null=True) # Will be uploaded to media

    # Let's override upload paths manually using upload_to if needed. Wait, 'upload_url' is a typo in standard Django. It should be 'upload_to'.
    # I will correct it to 'upload_to' in the final file.
    
    def __str__(self):
        return f"{self.booking_id} - {self.user.username} ({self.status})"

class Seat(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('LOCKED', 'Locked'),
        ('BOOKED', 'Booked'),
    )
    CATEGORY_CHOICES = (
        ('VIP', 'VIP'),
        ('PREMIUM', 'Premium'),
        ('NORMAL', 'Normal'),
    )
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10) # e.g. A1, A2, B10
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='NORMAL')
    price = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    locked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='locked_seats')
    locked_at = models.DateTimeField(null=True, blank=True)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='seats')

    class Meta:
        unique_together = ('show', 'seat_number')

    def is_lock_expired(self):
        if self.status == 'LOCKED' and self.locked_at:
            # Expire lock after 5 minutes
            return timezone.now() > self.locked_at + timezone.timedelta(minutes=5)
        return False

    def check_and_release_lock(self):
        if self.is_lock_expired():
            self.status = 'AVAILABLE'
            self.locked_by = None
            self.locked_at = None
            self.save()
            return True
        return False

    def __str__(self):
        return f"{self.seat_number} - {self.show.movie.title} ({self.status})"
