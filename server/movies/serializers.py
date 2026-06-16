from rest_framework import serializers
from .models import Movie, Theater, Show

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = '__all__'

class TheaterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theater
        fields = '__all__'

class ShowSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    theater_name = serializers.CharField(source='theater.name', read_only=True)
    theater_location = serializers.CharField(source='theater.location', read_only=True)

    class Meta:
        model = Show
        fields = ('id', 'movie', 'movie_title', 'theater', 'theater_name', 'theater_location', 'screen_number', 'show_time', 'base_price')
