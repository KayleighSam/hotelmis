# account/views.py
from rest_framework import generics, permissions, viewsets
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializers import EmailTokenObtainPairSerializer

# -----------------------------
# Register new user endpoint
# -----------------------------
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.AllowAny]

# -----------------------------
# JWT login with email endpoint
# -----------------------------
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# -----------------------------
# Fetch all users (GET)
# -----------------------------
class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admins can fetch all users
