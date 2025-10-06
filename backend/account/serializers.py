# account/serializers.py
from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # exclude built-in M2M that cause issues
        exclude = ['groups', 'user_permissions']
        extra_kwargs = {
            'password': {'write_only': True},
            'profile_image': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        # ensure activated (optional) — remove if you want to require admin activation
        user.is_active = True
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
