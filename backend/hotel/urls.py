from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicRoomViewSet, AdminRoomViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'public/rooms', PublicRoomViewSet, basename='public-rooms')
router.register(r'admin/rooms', AdminRoomViewSet, basename='admin-rooms')
router.register(r'bookings', BookingViewSet, basename='bookings')

urlpatterns = [
    path('', include(router.urls)),
]
