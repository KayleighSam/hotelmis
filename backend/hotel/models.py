from django.db import models
from datetime import date

class Room(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)
    image1 = models.ImageField(upload_to='rooms/', blank=True, null=True)
    image2 = models.ImageField(upload_to='rooms/', blank=True, null=True)
    image3 = models.ImageField(upload_to='rooms/', blank=True, null=True)

    def __str__(self):
        return self.name


class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="bookings")
    client_name = models.CharField(max_length=100)
    client_email = models.EmailField()
    check_in = models.DateField()
    check_out = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # ✅ Ensure room is available
        if not self.room.available:
            raise ValueError("❌ Room is already booked or unavailable.")

        # ✅ Convert date strings if needed
        if isinstance(self.check_in, str):
            self.check_in = date.fromisoformat(self.check_in)
        if isinstance(self.check_out, str):
            self.check_out = date.fromisoformat(self.check_out)

        # ✅ Compute total
        days = (self.check_out - self.check_in).days
        if days < 1:
            days = 1
        self.total_amount = days * self.room.price_per_day

        # ✅ Prevent underpayment
        if self.amount_paid != self.total_amount:
            raise ValueError(
                f"❌ Payment mismatch: Expected {self.total_amount}, got {self.amount_paid}"
            )

        # ✅ Mark room unavailable
        self.room.available = False
        self.room.save()

        super().save(*args, **kwargs)

    def payment_status(self):
        if self.amount_paid is None:
            return "Pending"
        return "Paid" if self.amount_paid == self.total_amount else "Underpaid"

    def __str__(self):
        return f"Booking for {self.client_name} - {self.room.name}"
