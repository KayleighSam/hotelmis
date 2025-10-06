from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, Restock, Sale, SaleItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    RestockSerializer,
    SaleSerializer,
    SaleItemSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


class RestockViewSet(viewsets.ModelViewSet):
    queryset = Restock.objects.all().select_related('product')
    serializer_class = RestockSerializer
    permission_classes = [IsAuthenticated]


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().prefetch_related('items')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]


class SaleItemViewSet(viewsets.ModelViewSet):
    queryset = SaleItem.objects.all().select_related('product', 'sale')
    serializer_class = SaleItemSerializer
    permission_classes = [IsAuthenticated]
