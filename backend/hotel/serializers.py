from rest_framework import serializers
from .models import Room, Booking


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.ReadOnlyField(source='room.name')
    payment_status = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = '__all__'

    def validate(self, data):
        check_in = data.get('check_in')
        check_out = data.get('check_out')

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError("❌ Check-out date must be after check-in date.")
        return data
