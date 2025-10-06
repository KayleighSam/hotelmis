from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer


# ✅ Custom permission for admin-only access
class IsAdminRole(BasePermission):
    """
    Allows access only to users whose role is 'admin'.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, "role", "") == "admin"
        )


# -------------------------------
# 🏨 Public View: Anyone can see available rooms
# -------------------------------
class PublicRoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Room.objects.filter(available=True)
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]


# -------------------------------
# 🛠️ Admin View: Manage rooms (Add, Edit, Delete)
# -------------------------------
class AdminRoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]  # ✅ Only admins

    def perform_create(self, serializer):
        serializer.save(available=True)


# -------------------------------
# 📅 Booking View: Public can book, admin can view/manage
# -------------------------------
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer

    def get_permissions(self):
        """
        - Allow anyone to create bookings.
        - Only admins can list, update, or delete bookings.
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminRole()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = serializer.validated_data['room']
        client_name = serializer.validated_data['client_name']
        client_email = serializer.validated_data['client_email']
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']
        amount_paid = serializer.validated_data.get('amount_paid')

        # ✅ Check room availability
        if not room.available:
            return Response(
                {"error": "❌ Room is already booked or unavailable."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Create booking safely
        booking = Booking(
            room=room,
            client_name=client_name,
            client_email=client_email,
            check_in=check_in,
            check_out=check_out,
            amount_paid=amount_paid
        )

        try:
            booking.save()  # This handles total + payment validation + availability update
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "✅ Booking successful.",
                "booking": BookingSerializer(booking).data
            },
            status=status.HTTP_201_CREATED
        )
