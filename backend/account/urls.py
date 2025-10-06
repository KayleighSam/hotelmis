from django.urls import path
from .views import RegisterView, EmailTokenObtainPairView
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet

router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='customuser')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),          # POST to register user
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),  # POST to login (access + refresh)
]

urlpatterns += router.urls
