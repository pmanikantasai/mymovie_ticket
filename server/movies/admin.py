from django.contrib import admin
from .models import Movie, Theater, Show

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_date', 'language', 'category', 'is_trending', 'is_upcoming')
    list_filter = ('language', 'category', 'is_trending', 'is_upcoming')
    search_fields = ('title', 'description')

@admin.register(Theater)
class TheaterAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'screen_count')
    list_filter = ('location',)
    search_fields = ('name', 'location', 'address')

@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    list_display = ('movie', 'theater', 'screen_number', 'show_time', 'base_price')
    list_filter = ('theater', 'show_time')
    search_fields = ('movie__title', 'theater__name')
