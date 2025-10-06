from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal


class Category(models.Model):
    """
    Product categories (e.g. TVs, Laptops, Phones)
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Products in stock
    """
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )
    name = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"


class Restock(models.Model):
    """
    Each time you restock a product
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='restocks')
    quantity_added = models.PositiveIntegerField()
    date = models.DateTimeField(default=timezone.now)
    note = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if self.pk is None:
            self.product.stock_quantity += self.quantity_added
            self.product.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Restock {self.quantity_added} of {self.product.name} on {self.date.strftime('%Y-%m-%d')}"


class Sale(models.Model):
    """
    POS Sale header
    """
    customer_name = models.CharField(max_length=150, blank=True)
    date = models.DateTimeField(default=timezone.now)
    cashier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales'
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=50, default='cash')

    def update_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save()

    def __str__(self):
        return f"Sale #{self.id} - {self.date.strftime('%Y-%m-%d')}"


class SaleItem(models.Model):
    """
    Each product sold in a Sale
    """
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.pk is None:
            if self.product and self.product.stock_quantity < self.quantity:
                raise ValueError(f"Not enough stock for {self.product.name}")
            if self.product:
                self.product.stock_quantity -= self.quantity
                self.product.save()
            if not self.subtotal:
                self.subtotal = self.price * self.quantity
        super().save(*args, **kwargs)
        self.sale.update_total()

    def __str__(self):
        return f"{self.quantity} x {self.product} (Sale #{self.sale_id})"

