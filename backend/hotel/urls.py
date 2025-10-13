from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicRoomViewSet, AdminRoomViewSet, BookingViewSet

# =========================================================
# 🧭 Router Registration
# =========================================================
router = DefaultRouter()
router.register(r'public/rooms', PublicRoomViewSet, basename='public-rooms')
router.register(r'admin/rooms', AdminRoomViewSet, basename='admin-rooms')
router.register(r'bookings', BookingViewSet, basename='bookings')

# =========================================================
# 🌐 URL Patterns
# =========================================================
urlpatterns = [
    # 🔗 Automatically generated CRUD endpoints
    path('', include(router.urls)),

    # 📅 Custom calendar endpoint for a room
    path(
        'public/rooms/<int:pk>/calendar/',
        PublicRoomViewSet.as_view({'get': 'calendar'}),
        name='room-calendar'
    ),

    # 🔍 Custom search by email endpoint
    path(
        'bookings/search_by_email/',
        BookingViewSet.as_view({'get': 'search_by_email'}),
        name='search-booking-by-email'
    ),
]
