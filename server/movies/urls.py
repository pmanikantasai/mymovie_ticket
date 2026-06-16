from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, TheaterViewSet, ShowViewSet

router = DefaultRouter()
router.register(r'list', MovieViewSet, basename='movie')
router.register(r'theaters', TheaterViewSet, basename='theater')
router.register(r'shows', ShowViewSet, basename='show')

urlpatterns = [
    path('', include(router.urls)),
]
