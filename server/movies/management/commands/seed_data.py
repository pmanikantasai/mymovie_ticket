import os
import random
import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from movies.models import Movie, Theater, Show
from bookings.models import Booking, Seat
from payments.models import Payment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with sample movies, theaters, shows, and bookings for analytics'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with BookMyShow data...')
        
        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            email='admin@bookmyshow.com',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        admin_user.set_password('admin123')
        admin_user.save()
        
        customer_user, _ = User.objects.get_or_create(
            username='john_doe',
            email='john@gmail.com',
            role='customer'
        )
        customer_user.set_password('user123')
        customer_user.save()
        
        self.stdout.write('- Created users: admin (pwd: admin123), john_doe (pwd: user123)')

        # 2. Create Movies
        movies_data = [
            {
                'title': 'Dune: Part Two',
                'description': 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
                'duration_minutes': 166,
                'rating': 'UA',
                'user_rating': 8.9,
                'poster_url': 'https://image.tmdb.org/t/p/original/8Gxv8gS081mgr7syGDuZJ2Yj5Zt.jpg',
                'trailer_url': 'https://www.youtube.com/embed/Way9Dexny3w',
                'cast': [
                    {'name': 'Timothée Chalamet', 'role': 'Paul Atreides', 'image': 'https://image.tmdb.org/t/p/original/BE4n65q5gZg75G5qiL627pPXGf.jpg'},
                    {'name': 'Zendaya', 'role': 'Chani', 'image': 'https://image.tmdb.org/t/p/original/xq341v48o5j4SlyZ4Xv341v48o5.jpg'},
                    {'name': 'Rebecca Ferguson', 'role': 'Lady Jessica', 'image': 'https://image.tmdb.org/t/p/original/228-rebecca.jpg'}
                ],
                'release_date': datetime.date(2024, 3, 1),
                'category': 'Sci-Fi, Action, Adventure',
                'language': 'English',
                'is_trending': True,
                'is_upcoming': False
            },
            {
                'title': 'Avengers: Endgame',
                'description': 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.',
                'duration_minutes': 181,
                'rating': 'UA',
                'user_rating': 9.2,
                'poster_url': 'https://image.tmdb.org/t/p/original/or06XTm7mG6TVsOFlh35vIclvWQ.jpg',
                'trailer_url': 'https://www.youtube.com/embed/TcMBFSGVi1c',
                'cast': [
                    {'name': 'Robert Downey Jr.', 'role': 'Iron Man', 'image': 'https://image.tmdb.org/t/p/original/5qao8db.jpg'},
                    {'name': 'Chris Evans', 'role': 'Captain America', 'image': 'https://image.tmdb.org/t/p/original/ChrisEvans.jpg'},
                    {'name': 'Scarlett Johansson', 'role': 'Black Widow', 'image': 'https://image.tmdb.org/t/p/original/Scarlett.jpg'}
                ],
                'release_date': datetime.date(2019, 4, 26),
                'category': 'Action, Sci-Fi, Fantasy',
                'language': 'English',
                'is_trending': True,
                'is_upcoming': False
            },
            {
                'title': 'Inception',
                'description': 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
                'duration_minutes': 148,
                'rating': 'UA',
                'user_rating': 8.8,
                'poster_url': 'https://image.tmdb.org/t/p/original/o0ld14wcn3e25cCrJ1vHYjQ6eST.jpg',
                'trailer_url': 'https://www.youtube.com/embed/YoHD9XEInc0',
                'cast': [
                    {'name': 'Leonardo DiCaprio', 'role': 'Cobb', 'image': 'https://image.tmdb.org/t/p/original/Leo.jpg'},
                    {'name': 'Joseph Gordon-Levitt', 'role': 'Arthur', 'image': 'https://image.tmdb.org/t/p/original/Joseph.jpg'}
                ],
                'release_date': datetime.date(2010, 7, 16),
                'category': 'Sci-Fi, Thriller, Action',
                'language': 'English',
                'is_trending': False,
                'is_upcoming': False
            },
            {
                'title': 'Spider-Man: Beyond the Spider-Verse',
                'description': 'The spectacular conclusion to Miles Morales\' multidimensional animated adventure.',
                'duration_minutes': 140,
                'rating': 'U',
                'user_rating': 0.0,
                'poster_url': 'https://image.tmdb.org/t/p/original/61f2f2f2.jpg',
                'trailer_url': 'https://www.youtube.com/embed/t-622f2f2',
                'cast': [
                    {'name': 'Shameik Moore', 'role': 'Miles Morales', 'image': ''},
                    {'name': 'Hailee Steinfeld', 'role': 'Gwen Stacy', 'image': ''}
                ],
                'release_date': datetime.date(2027, 6, 1),
                'category': 'Animation, Action, Adventure',
                'language': 'English',
                'is_trending': False,
                'is_upcoming': True
            },
            {
                'title': 'Avatar: Fire and Ash',
                'description': 'The third installment in James Cameron\'s groundbreaking sci-fi franchise exploring the volcanic regions of Pandora.',
                'duration_minutes': 160,
                'rating': 'UA',
                'user_rating': 0.0,
                'poster_url': 'https://image.tmdb.org/t/p/original/63e1212.jpg',
                'trailer_url': 'https://www.youtube.com/embed/a-121212',
                'cast': [
                    {'name': 'Sam Worthington', 'role': 'Jake Sully', 'image': ''},
                    {'name': 'Zoe Saldana', 'role': 'Neytiri', 'image': ''}
                ],
                'release_date': datetime.date(2026, 12, 18),
                'category': 'Sci-Fi, Adventure, Action',
                'language': 'English',
                'is_trending': False,
                'is_upcoming': True
            }
        ]

        movies = []
        for m_data in movies_data:
            movie, _ = Movie.objects.get_or_create(title=m_data['title'], defaults=m_data)
            movies.append(movie)
        
        self.stdout.write(f"- Seeded {len(movies)} movies.")

        # 3. Create Theaters
        theaters_data = [
            {'name': 'PVR IMAX: Forum Mall', 'location': 'Bengaluru', 'address': 'Koramangala, Bengaluru, Karnataka 560095', 'screen_count': 4},
            {'name': 'Cinepolis: Orion Mall', 'location': 'Bengaluru', 'address': 'Rajajinagar, Bengaluru, Karnataka 560055', 'screen_count': 5},
            {'name': 'Cinepolis: DLF Avenue', 'location': 'New Delhi', 'address': 'DLF Avenue, Saket, New Delhi 110017', 'screen_count': 6},
            {'name': 'PVR: Vegas Mall', 'location': 'New Delhi', 'address': 'Sector 14, Dwarka, New Delhi 110075', 'screen_count': 8},
            {'name': 'PVR: Director\'s Cut', 'location': 'Gurgaon', 'address': 'Ambience Mall, Gurugram, Haryana 122002', 'screen_count': 3},
            {'name': 'Inox: Insignia', 'location': 'Gurgaon', 'address': 'Ardee Mall, Sector 52, Gurugram, Haryana 122003', 'screen_count': 4},
            {'name': 'Inox: Nariman Point', 'location': 'Mumbai', 'address': 'CR2 Mall, Nariman Point, Mumbai 400021', 'screen_count': 5},
            {'name': 'PVR: Phoenix Marketcity', 'location': 'Mumbai', 'address': 'Kurla West, Mumbai, Maharashtra 400070', 'screen_count': 6}
        ]
        
        
        theaters = []
        for t_data in theaters_data:
            theater, _ = Theater.objects.get_or_create(name=t_data['name'], defaults=t_data)
            theaters.append(theater)
            
        self.stdout.write(f"- Seeded {len(theaters)} theaters.")

        # 4. Create Shows (For the next 5 days)
        shows = []
        today = timezone.now().date()
        
        for movie in movies:
            if movie.is_upcoming:
                continue
            for theater in theaters:
                for day_offset in range(4):
                    show_date = today + datetime.timedelta(days=day_offset)
                    times = [
                        datetime.time(11, 0),
                        datetime.time(15, 30),
                        datetime.time(20, 0)
                    ]
                    for t in times:
                        dt = timezone.make_aware(datetime.datetime.combine(show_date, t))
                        show, _ = Show.objects.get_or_create(
                            movie=movie,
                            theater=theater,
                            screen_number=random.randint(1, theater.screen_count),
                            show_time=dt,
                            defaults={'base_price': random.choice([150.00, 200.00, 250.00, 350.00])}
                        )
                        shows.append(show)
        
        self.stdout.write(f"- Seeded {len(shows)} future shows.")

        # 5. Create Past Bookings for Analytics (last 6 months)
        self.stdout.write("Generating past analytics bookings...")
        past_shows = []
        for i in range(1, 6): # Last 5 months
            month_date = today - datetime.timedelta(days=i*30)
            movie = random.choice([m for m in movies if not m.is_upcoming])
            theater = random.choice(theaters)
            dt = timezone.make_aware(datetime.datetime.combine(month_date, datetime.time(18, 0)))
            show = Show.objects.create(
                movie=movie,
                theater=theater,
                screen_number=1,
                show_time=dt,
                base_price=random.choice([150.00, 200.00, 250.00])
            )
            past_shows.append(show)

        for show in past_shows:
            rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            categories = {
                'A': ('VIP', 300.00), 'B': ('VIP', 300.00),
                'C': ('PREMIUM', 200.00), 'D': ('PREMIUM', 200.00), 'E': ('PREMIUM', 200.00), 'F': ('PREMIUM', 200.00), 'G': ('PREMIUM', 200.00),
                'H': ('NORMAL', 120.00), 'I': ('NORMAL', 120.00), 'J': ('NORMAL', 120.00)
            }
            seats_to_create = []
            for r in rows:
                cat, price = categories[r]
                for num in range(1, 11):
                    seats_to_create.append(Seat(
                        show=show,
                        seat_number=f"{r}{num}",
                        category=cat,
                        price=price,
                        status='AVAILABLE'
                    ))
            Seat.objects.bulk_create(seats_to_create)
            
            all_seats = list(Seat.objects.filter(show=show))
            booked_seats = random.sample(all_seats, k=random.randint(5, 15))
            
            from decimal import Decimal
            base_amount = sum(s.price for s in booked_seats)
            fee = Decimal('30.00')
            tax = base_amount * Decimal('0.18')
            total = base_amount + fee + tax
            
            created_at_time = show.show_time - datetime.timedelta(days=random.randint(1, 5))
            booking = Booking.objects.create(
                user=customer_user,
                show=show,
                total_amount=total,
                convenience_fee=fee,
                tax=tax,
                status='CONFIRMED',
            )
            Booking.objects.filter(id=booking.id).update(created_at=created_at_time)
            
            for seat in booked_seats:
                seat.status = 'BOOKED'
                seat.booking = booking
                seat.save()
                
            Payment.objects.create(
                booking=booking,
                payment_id=f"TXN-{random.randint(100000000000, 999999999999)}",
                amount=total,
                status='SUCCESS',
                payment_method=random.choice(['Card', 'UPI', 'Net Banking', 'Wallet']),
            )
            Payment.objects.filter(booking=booking).update(created_at=created_at_time)

        self.stdout.write(self.style.SUCCESS('Successfully seeded all sample data!'))
