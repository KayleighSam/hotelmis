from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, AllowAny, IsAuthenticated
from rest_framework.decorators import action
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer
from datetime import timedelta, date


# =========================================================
# ✅ Custom permission for admin-only access
# =========================================================
class IsAdminRole(BasePermission):
    """Allows access only to users whose role is 'admin'."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", "") == "admin"
        )


# =========================================================
# 🏨 Public ViewSet — Anyone can view rooms & availability
# =========================================================
class PublicRoomViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only access for anyone to see room details and availability.
    Includes a `calendar` endpoint showing booked dates.
    """
    queryset = Room.objects.all().order_by("id")
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def calendar(self, request, pk=None):
        """
        📅 Returns booked date ranges for a specific room (no login required).
        Example response:
        {
            "room_id": 1,
            "room_name": "Deluxe Suite",
            "booked_days": ["2025-10-10", "2025-10-11", "2025-10-12"]
        }
        """
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        bookings = Booking.objects.filter(room=room)
        booked_days = []

        # ✅ Collect all days within each booking range
        for booking in bookings:
            current_day = booking.check_in
            while current_day <= booking.check_out:
                booked_days.append(str(current_day))
                current_day += timedelta(days=1)

        return Response(
            {
                "room_id": room.id,
                "room_name": room.name,
                "booked_days": booked_days,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# 🛠️ Admin Room Management — Protected for admins only
# =========================================================
class AdminRoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("id")
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        """Auto-mark new rooms as available."""
        serializer.save(available=True)

    def destroy(self, request, *args, **kwargs):
        """
        🗑️ Prevent deleting rooms that have active or future bookings.
        """
        instance = self.get_object()

        # Check for any bookings that haven't ended yet
        active_bookings = Booking.objects.filter(
            room=instance, check_out__gte=date.today()
        )

        if active_bookings.exists():
            return Response(
                {
                    "error": f"❌ Cannot delete room '{instance.name}' because it has active or upcoming bookings."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If no active bookings, allow delete
        self.perform_destroy(instance)
        return Response(
            {"message": f"✅ Room '{instance.name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )


# =========================================================
# 📅 Booking Management — Public booking creation, admin control otherwise
# =========================================================
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by("-created_at")
    serializer_class = BookingSerializer

    def get_permissions(self):
        """
        Public: anyone can create a booking.
        Admin: can view or delete bookings.
        """
        if self.action in ["create", "list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminRole()]

    def list(self, request, *args, **kwargs):
        """
        ✅ Public endpoint to view all bookings for a room (filtered by ?room_id=).
        Example: /api/hotel/bookings/?room_id=1
        """
        room_id = request.query_params.get("room_id")
        if room_id:
            bookings = Booking.objects.filter(room_id=room_id).order_by("check_in")
        else:
            bookings = Booking.objects.all().order_by("check_in")

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """✅ Create a booking only if the selected date range is free."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = serializer.validated_data["room"]
        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]
        amount_paid = serializer.validated_data.get("amount_paid")
        client_name = serializer.validated_data["client_name"]
        client_email = serializer.validated_data["client_email"]

        # ✅ Check for overlapping bookings
        overlapping = Booking.objects.filter(
            room=room, check_in__lte=check_out, check_out__gte=check_in
        ).exists()

        if overlapping:
            return Response(
                {"error": "❌ These dates are already booked. Please choose different dates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Compute total cost
        days = (check_out - check_in).days
        if days < 1:
            days = 1
        total_amount = days * room.price_per_day

        # ✅ Verify payment
        if amount_paid != total_amount:
            return Response(
                {"error": f"❌ Payment mismatch. Expected {total_amount}, got {amount_paid}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Create the booking
        booking = Booking.objects.create(
            room=room,
            client_name=client_name,
            client_email=client_email,
            check_in=check_in,
            check_out=check_out,
            total_amount=total_amount,
            amount_paid=amount_paid,
        )

        # ✅ Update room availability
        room.available = not Booking.objects.filter(
            room=room, check_out__gte=date.today()
        ).exists()
        room.save()

        return Response(
            {
                "message": "✅ Booking successful.",
                "booking": BookingSerializer(booking).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        """🗑️ Prevent deleting bookings that have already started."""
        instance = self.get_object()

        if instance.check_in <= date.today():
            return Response(
                {
                    "error": f"❌ Cannot delete booking for '{instance.client_name}' because it has already started or ended."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Safe to delete
        self.perform_destroy(instance)
        return Response(
            {"message": f"✅ Booking for '{instance.client_name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )
