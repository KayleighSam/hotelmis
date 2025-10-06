# account/token_serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework import serializers
from .models import CustomUser
from .serializers import CustomUserSerializer

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accepts email + password and returns refresh & access tokens.
    """

    # Optional: add extra claims
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed('No active account found with the given credentials')

        # check password and active status
        if not user.check_password(password) or not user.is_active:
            raise AuthenticationFailed('No active account found with the given credentials')

        # build token pair
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': CustomUserSerializer(user).data
        }
        return data
