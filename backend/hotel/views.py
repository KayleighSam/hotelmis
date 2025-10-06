from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework.decorators import action
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer
from datetime import timedelta


# ✅ Custom permission for admin-only access
class IsAdminRole(BasePermission):
    """Allows access only to users whose role is 'admin'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "role", "") == "admin"
        )


# ----------------------------------------
# 🏨 Public ViewSet: Anyone can view rooms
# ----------------------------------------
class PublicRoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Room.objects.all().order_by('id')
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def calendar(self, request, pk=None):
        """📅 Returns booked date ranges for a specific room."""
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        bookings = Booking.objects.filter(room=room)
        booked_days = []

        for booking in bookings:
            current_day = booking.check_in
            while current_day <= booking.check_out:
                booked_days.append(str(current_day))
                current_day += timedelta(days=1)

        return Response({
            "room_id": room.id,
            "room_name": room.name,
            "booked_days": booked_days
        })


# ----------------------------------------
# 🛠️ Admin Room Management
# ----------------------------------------
class AdminRoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('id')
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        serializer.save(available=True)


# ----------------------------------------
# 📅 Booking Management
# ----------------------------------------
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminRole()]

    def create(self, request, *args, **kwargs):
        """Create a booking only if the selected date range is free."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = serializer.validated_data['room']
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']
        amount_paid = serializer.validated_data.get('amount_paid')
        client_name = serializer.validated_data['client_name']
        client_email = serializer.validated_data['client_email']

        # ✅ Check for overlapping bookings for this room
        overlapping = Booking.objects.filter(
            room=room,
            check_in__lte=check_out,
            check_out__gte=check_in
        ).exists()

        if overlapping:
            return Response(
                {"error": "❌ These dates are already booked. Please choose different dates."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Compute total cost based on number of nights
        days = (check_out - check_in).days
        if days < 1:
            days = 1
        total_amount = days * room.price_per_day

        # ✅ Verify full payment
        if amount_paid != total_amount:
            return Response(
                {"error": f"❌ Payment mismatch. Expected {total_amount}, got {amount_paid}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Create the booking
        booking = Booking.objects.create(
            room=room,
            client_name=client_name,
            client_email=client_email,
            check_in=check_in,
            check_out=check_out,
            total_amount=total_amount,
            amount_paid=amount_paid
        )

        # ✅ Update room availability if fully occupied during the date range
        room.available = not Booking.objects.filter(
            room=room,
            check_out__gte=check_in
        ).exists()
        room.save()

        return Response(
            {
                "message": "✅ Booking successful.",
                "booking": BookingSerializer(booking).data
            },
            status=status.HTTP_201_CREATED
        )
