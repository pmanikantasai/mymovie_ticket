from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration_minutes = models.PositiveIntegerField()
    rating = models.CharField(max_length=10, default='U')  # U, UA, A, etc.
    user_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0) # e.g. 8.5
    poster_url = models.URLField(max_length=1000, blank=True, null=True)
    trailer_url = models.URLField(max_length=1000, blank=True, null=True)
    cast = models.JSONField(default=list)  # list of objects e.g., [{"name": "Robert Downey Jr.", "role": "Iron Man", "image": "..."}]
    release_date = models.DateField()
    category = models.CharField(max_length=255, default='Action')  # Action, Comedy, Drama, Sci-Fi etc.
    language = models.CharField(max_length=100, default='English')
    is_trending = models.BooleanField(default=False)
    is_upcoming = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Theater(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=100) # City or neighborhood
    address = models.TextField()
    screen_count = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.name} - {self.location}"

class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='shows')
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name='shows')
    screen_number = models.PositiveIntegerField(default=1)
    show_time = models.DateTimeField()
    base_price = models.DecimalField(max_digits=6, decimal_places=2, default=150.00)

    def __str__(self):
        return f"{self.movie.title} @ {self.theater.name} on {self.show_time.strftime('%Y-%m-%d %H:%M')}"
