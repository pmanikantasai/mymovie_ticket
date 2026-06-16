from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = UserSerializer
    pagination_class = None

class AdminAnalyticsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        from movies.models import Movie, Theater, Show
        from bookings.models import Booking, Seat
        from django.utils import timezone
        import datetime

        total_users = User.objects.count()
        total_movies = Movie.objects.count()
        total_theaters = Theater.objects.count()
        total_bookings = Booking.objects.filter(status='CONFIRMED').count()
        
        total_revenue = Booking.objects.filter(status='CONFIRMED').aggregate(total=Sum('total_amount'))['total'] or 0

        # Monthly revenue breakdown (last 6 months)
        monthly_data = []
        today = timezone.now().date()
        for i in range(5, -1, -1):
            date = today - datetime.timedelta(days=i*30)
            month_name = date.strftime("%b %Y")
            month_num = date.month
            year_num = date.year
            revenue = Booking.objects.filter(
                status='CONFIRMED',
                created_at__month=month_num,
                created_at__year=year_num
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            bookings_count = Booking.objects.filter(
                status='CONFIRMED',
                created_at__month=month_num,
                created_at__year=year_num
            ).count()
            monthly_data.append({
                'month': month_name,
                'revenue': float(revenue),
                'bookings': bookings_count
            })

        # Category breakdown
        vip_seats = Seat.objects.filter(status='BOOKED', category='VIP').count()
        premium_seats = Seat.objects.filter(status='BOOKED', category='PREMIUM').count()
        normal_seats = Seat.objects.filter(status='BOOKED', category='NORMAL').count()
        
        category_breakdown = [
            {'category': 'VIP', 'count': vip_seats, 'color': '#FFD700'},
            {'category': 'Premium', 'count': premium_seats, 'color': '#f84464'},
            {'category': 'Normal', 'count': normal_seats, 'color': '#3b82f6'},
        ]

        # Theater performance
        theater_performance = []
        for theater in Theater.objects.all()[:5]:
            revenue = Booking.objects.filter(
                status='CONFIRMED',
                show__theater=theater
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            theater_performance.append({
                'name': theater.name,
                'revenue': float(revenue)
            })

        return Response({
            'stats': {
                'total_users': total_users,
                'total_movies': total_movies,
                'total_theaters': total_theaters,
                'total_bookings': total_bookings,
                'total_revenue': float(total_revenue),
            },
            'monthly_analytics': monthly_data,
            'category_breakdown': category_breakdown,
            'theater_performance': theater_performance
        })
