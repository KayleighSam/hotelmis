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
from decimal import Decimal, ROUND_HALF_UP
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer
import requests
import base64
import datetime

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
# 🏨 Public Room ViewSet
# =========================================================
class PublicRoomViewSet(viewsets.ReadOnlyModelViewSet):
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
# 🛠️ Admin Room Management
# =========================================================
class AdminRoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("id")
    serializer_class = RoomSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        serializer.save(available=True)

    def destroy(self, request, *args, **kwargs):
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
# 🔹 Safaricom OAuth & STK Push
# =========================================================
def get_safaricom_oauth_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    headers = {"Authorization": f"Basic {settings.SAFARICOM_AUTHORIZATION}"}
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("access_token") or {"error": f"OAuth token not found: {data}"}
    except Exception as e:
        return {"error": f"OAuth token generation failed: {str(e)}"}

def initiate_safaricom_stk(phone_number, amount, account_reference="MileleHotel", transaction_desc="Room Booking"):
    token = get_safaricom_oauth_token()
    if isinstance(token, dict) and token.get("error"):
        return token

    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    password_str = settings.SAFARICOM_SHORTCODE + settings.SAFARICOM_PASSKEY + timestamp
    password = base64.b64encode(password_str.encode()).decode()

    stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "BusinessShortCode": settings.SAFARICOM_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": settings.SAFARICOM_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": "https://example.com/dummy-callback",  # placeholder, no real callback
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }

    try:
        resp = requests.post(stk_url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"STK push failed: {str(e)}"}

# =========================================================
# 📅 Booking Management
# =========================================================
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by("-created_at")
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve", "search_by_email"]:
            return [AllowAny()]
        return [IsAdminRole()]

    def list(self, request, *args, **kwargs):
        room_id = request.query_params.get("room_id")
        if room_id:
            bookings = Booking.objects.filter(room_id=room_id).order_by("check_in")
        else:
            bookings = Booking.objects.all().order_by("check_in")
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def search_by_email(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"error": "Please provide an email to search."}, status=status.HTTP_400_BAD_REQUEST)
        bookings = Booking.objects.filter(client_email__iexact=email).order_by("-check_in")
        if not bookings.exists():
            return Response({"message": f"No bookings found for {email}."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # =========================================================
    # 🏨 Booking Creation
    # =========================================================
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room = serializer.validated_data["room"]
        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]
        amount_paid = serializer.validated_data.get("amount_paid")
        client_name = serializer.validated_data["client_name"]
        client_email = serializer.validated_data["client_email"]
        client_phone = serializer.validated_data.get("client_phone", "N/A")
        adults = serializer.validated_data.get("adults", 1)
        children = serializer.validated_data.get("children", 0)
        meal_plan = serializer.validated_data.get("meal_plan", "HB")

        if check_in >= check_out:
            return Response({"error": "❌ Check-out date must be after check-in date."}, status=status.HTTP_400_BAD_REQUEST)

        overlapping = Booking.objects.filter(
            room=room,
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exists()
        if overlapping:
            return Response({"error": "❌ These dates are already booked. Please choose different dates."}, status=status.HTTP_400_BAD_REQUEST)

        days = max((check_out - check_in).days, 1)
        days_dec = Decimal(days)
        base_price = room.price_per_day * days_dec

        meal_multiplier, meal_label = {
            "HB": (Decimal("1.2"), "Half Board"),
            "FB": (Decimal("1.4"), "Full Board")
        }.get(meal_plan, (Decimal("1.0"), "No Meals"))

        total_guests_factor = Decimal(adults) + (Decimal(children) * Decimal("0.5"))
        total_amount = (base_price * total_guests_factor * meal_multiplier).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if amount_paid is None:
            return Response({"error": f"❌ Amount paid is required. Expected {total_amount}."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_paid_dec = Decimal(amount_paid)
        except Exception:
            return Response({"error": "❌ Provided amount_paid is invalid."}, status=status.HTTP_400_BAD_REQUEST)

        if amount_paid_dec != total_amount:
            return Response({"error": f"❌ Payment mismatch. Expected {total_amount}, got {amount_paid_dec}."}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects.create(
            room=room,
            client_name=client_name,
            client_email=client_email,
            client_phone=client_phone,
            check_in=check_in,
            check_out=check_out,
            adults=adults,
            children=children,
            meal_plan=meal_plan,
            total_amount=total_amount,
            amount_paid=amount_paid_dec,
        )

        room.available = not Booking.objects.filter(room=room, check_out__gte=date.today()).exists()
        room.save(update_fields=["available"])

        # =========================================================
        # ✉️ Send HTML Email
        # =========================================================
        subject = f"Booking Confirmation – {room.name} | Milele Hotel"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient = [client_email]

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f6f7fb; padding: 40px;">
        <div style="max-width: 640px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 14px rgba(0,0,0,0.08);">
        <div style="background: #ff6b00; color: white; text-align: center; padding: 22px;">
        <h2 style="margin: 0;">Milele Hotel</h2>
        <p style="margin: 0; font-size: 14px;">Luxury & Comfort, Redefined</p>
        </div>
        <div style="padding: 28px;">
        <h3 style="color: #333; margin-bottom: 6px;">Dear {client_name},</h3>
        <p style="margin-top:0;">Thank you for booking with <b>Milele Hotel</b>! We're thrilled to confirm your stay.</p>
        <div style="margin: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 12px 0;">
        <table width="100%" style="border-collapse: collapse; font-size: 14px;">
        <tr><td><b>Room:</b></td><td>{room.name}</td></tr>
        <tr><td><b>Check-in:</b></td><td>{check_in}</td></tr>
        <tr><td><b>Check-out:</b></td><td>{check_out}</td></tr>
        <tr><td><b>Adults:</b></td><td>{adults}</td></tr>
        <tr><td><b>Children:</b></td><td>{children}</td></tr>
        <tr><td><b>Meal Plan:</b></td><td>{meal_label}</td></tr>
        <tr><td><b>Total Nights:</b></td><td>{days}</td></tr>
        <tr><td><b>Total Amount:</b></td><td>KES {total_amount:,.2f}</td></tr>
        <tr><td><b>Amount Paid:</b></td><td style="color:#28a745;"><b>KES {amount_paid_dec:,.2f}</b></td></tr>
        <tr><td><b>Phone Number:</b></td><td>{client_phone}</td></tr>
        </table>
        </div>
        <p>We’re excited to welcome you soon. Please present this email at check-in as proof of booking.</p>
        <div style="margin-top: 26px; text-align: center;">
        <a href="http://localhost:5173/about" style="background-color: #ff6b00; color: white; padding: 10px 26px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Booking</a>
        </div>
        </div>
        <div style="background: #333; color: white; text-align: center; padding: 14px; font-size: 12px;">
        © {date.today().year} Milele Hotel | All Rights Reserved
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

        # =========================================================
        # 🔹 Trigger Safaricom STK Push
        # =========================================================
        mpesa_resp = initiate_safaricom_stk(client_phone, float(total_amount))
        booking.mpesa_response = mpesa_resp
        booking.save(update_fields=["mpesa_response"])

        return Response(
            {
                "message": "✅ Booking successful. Confirmation email sent. Safaricom STK push initiated.",
                "booking": BookingSerializer(booking).data,
                "mpesa_response": mpesa_resp
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.check_in <= date.today():
            return Response({"error": f"❌ Cannot delete booking for '{instance.client_name}' — it has already started or ended."}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_destroy(instance)
        return Response({"message": f"✅ Booking for '{instance.client_name}' deleted successfully."}, status=status.HTTP_200_OK)
