# config/urls.py
from django.contrib import admin
from django.urls import path, include
from account.views import EmailTokenObtainPairView  # optional if you have JWT
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/account/', include('account.urls')),       # <--- This is critical
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/inventory/', include('inventory.urls')),   # <--- This is critical
    path('api/hotel/', include('hotel.urls')),
]
