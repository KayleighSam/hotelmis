from django.contrib import admin
from django.urls import path, include
from account.views import EmailTokenObtainPairView  # optional if you have JWT
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔹 API endpoints
    path('api/account/', include('account.urls')),       
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/inventory/', include('inventory.urls')),   
    path('api/hotel/', include('hotel.urls')),
]

# ✅ Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
