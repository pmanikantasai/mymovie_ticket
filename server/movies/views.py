from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Movie, Theater, Show
from .serializers import MovieSerializer, TheaterSerializer, ShowSerializer
from django.utils.dateparse import parse_date

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().order_by('-release_date')
    serializer_class = MovieSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__icontains=category)
            
        language = self.request.query_params.get('language', None)
        if language:
            queryset = queryset.filter(language__iexact=language)
            
        is_trending = self.request.query_params.get('is_trending', None)
        if is_trending:
            queryset = queryset.filter(is_trending=is_trending.lower() == 'true')
            
        is_upcoming = self.request.query_params.get('is_upcoming', None)
        if is_upcoming:
            queryset = queryset.filter(is_upcoming=is_upcoming.lower() == 'true')
            
        return queryset

class TheaterViewSet(viewsets.ModelViewSet):
    queryset = Theater.objects.all().order_by('name')
    serializer_class = TheaterSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

class ShowViewSet(viewsets.ModelViewSet):
    queryset = Show.objects.all().order_by('show_time')
    serializer_class = ShowSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        movie_id = self.request.query_params.get('movie', None)
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
            
        theater_id = self.request.query_params.get('theater', None)
        if theater_id:
            queryset = queryset.filter(theater_id=theater_id)
            
        date_str = self.request.query_params.get('date', None)
        if date_str:
            parsed_date = parse_date(date_str)
            if parsed_date:
                queryset = queryset.filter(show_time__date=parsed_date)
                
        return queryset
