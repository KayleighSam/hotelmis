# =========================================================
# 📧 HTML Email + Booking Management System for Hotel Rooms
# =========================================================
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, AllowAny
from rest_framework.decorators import action
from django.core.mail import EmailMessage
from django.conf import settings
from datetime import timedelta, date
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer


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

        return Response(
            {"room_id": room.id, "room_name": room.name, "booked_days": booked_days},
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
        serializer.save(available=True)

    def destroy(self, request, *args, **kwargs):
        """🗑️ Prevent deleting rooms with active or future bookings."""
        instance = self.get_object()
        active_bookings = Booking.objects.filter(room=instance, check_out__gte=date.today())

        if active_bookings.exists():
            return Response(
                {"error": f"❌ Cannot delete room '{instance.name}' — it has active or upcoming bookings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_destroy(instance)
        return Response(
            {"message": f"✅ Room '{instance.name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )


# =========================================================
# 📅 Booking Management — Public creation, admin control
# =========================================================
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by("-created_at")
    serializer_class = BookingSerializer

    def get_permissions(self):
        """Public: anyone can create. Admin: can view/delete."""
        if self.action in ["create", "list", "retrieve", "search_by_email"]:
            return [AllowAny()]
        return [IsAdminRole()]

    def list(self, request, *args, **kwargs):
        """✅ List bookings (optional ?room_id= filter)."""
        room_id = request.query_params.get("room_id")
        if room_id:
            bookings = Booking.objects.filter(room_id=room_id).order_by("check_in")
        else:
            bookings = Booking.objects.all().order_by("check_in")

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # =========================================================
    # 🔍 New: Search Bookings by Client Email
    # =========================================================
    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def search_by_email(self, request):
        """
        🔍 Search bookings by client email.
        Example: /api/bookings/search_by_email/?email=example@gmail.com
        """
        email = request.query_params.get("email")
        if not email:
            return Response(
                {"error": "Please provide an email to search."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bookings = Booking.objects.filter(client_email__iexact=email).order_by("-check_in")
        if not bookings.exists():
            return Response(
                {"message": f"No bookings found for {email}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # =========================================================
    # 🏨 Booking Creation with HTML Email
    # =========================================================
    def create(self, request, *args, **kwargs):
        """✅ Create booking and send styled HTML email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = serializer.validated_data["room"]
        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]
        amount_paid = serializer.validated_data.get("amount_paid")
        client_name = serializer.validated_data["client_name"]
        client_email = serializer.validated_data["client_email"]

        # ✅ Prevent overlapping bookings
        overlapping = Booking.objects.filter(
            room=room, check_in__lte=check_out, check_out__gte=check_in
        ).exists()
        if overlapping:
            return Response(
                {"error": "❌ These dates are already booked. Please choose different dates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Compute total amount
        days = (check_out - check_in).days or 1
        total_amount = days * room.price_per_day

        if amount_paid != total_amount:
            return Response(
                {"error": f"❌ Payment mismatch. Expected {total_amount}, got {amount_paid}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Create booking record
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
        room.available = not Booking.objects.filter(room=room, check_out__gte=date.today()).exists()
        room.save()

        # =========================================================
        # ✉️ Send Beautiful HTML Email
        # =========================================================
        subject = f"Booking Confirmation – {room.name} | Sam Hotel"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient = [client_email]

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f6f7fb; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #ff6b00; color: white; text-align: center; padding: 20px;">
                    <h2 style="margin: 0;">Sam Hotel</h2>
                    <p style="margin: 0; font-size: 14px;">Luxury & Comfort, Redefined</p>
                </div>
                <div style="padding: 30px;">
                    <h3 style="color: #333;">Dear {client_name},</h3>
                    <p>Thank you for booking with <b>Sam Hotel</b>! We're thrilled to confirm your stay.</p>

                    <div style="margin: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0;">
                        <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                            <tr><td><b>Room:</b></td><td>{room.name}</td></tr>
                            <tr><td><b>Check-in:</b></td><td>{check_in}</td></tr>
                            <tr><td><b>Check-out:</b></td><td>{check_out}</td></tr>
                            <tr><td><b>Total Amount:</b></td><td>KES {total_amount:,.2f}</td></tr>
                            <tr><td><b>Amount Paid:</b></td><td style="color:#28a745;"><b>KES {amount_paid:,.2f}</b></td></tr>
                        </table>
                    </div>

                    <p>We’re excited to welcome you soon. Please present this email at check-in as proof of booking.</p>
                    <p>If you have any questions, feel free to reply to this email.</p>

                    <div style="margin-top: 30px; text-align: center;">
                        <a href="#" style="background-color: #ff6b00; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Booking</a>
                    </div>
                </div>
                <div style="background: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
                    © {date.today().year} Sam Hotel | All Rights Reserved
                </div>
            </div>
        </body>
        </html>
        """

        try:
            email = EmailMessage(subject, html_message, from_email, recipient)
            email.content_subtype = "html"
            email.send(fail_silently=False)
        except Exception as e:
            print(f"⚠️ Failed to send email: {e}")

        # ✅ Response
        return Response(
            {"message": "✅ Booking successful. Confirmation email sent.", "booking": BookingSerializer(booking).data},
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        """🗑️ Prevent deleting bookings that have already started."""
        instance = self.get_object()
        if instance.check_in <= date.today():
            return Response(
                {"error": f"❌ Cannot delete booking for '{instance.client_name}' — it has already started or ended."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_destroy(instance)
        return Response(
            {"message": f"✅ Booking for '{instance.client_name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )
