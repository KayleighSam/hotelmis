from rest_framework import serializers
from .models import Category, Product, Restock, Sale, SaleItem
from decimal import Decimal


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = '__all__'


class RestockSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = Restock
        fields = '__all__'


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    sale = serializers.PrimaryKeyRelatedField(read_only=True)  # prevent 'sale required' error

    class Meta:
        model = SaleItem
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)  # writable nested

    class Meta:
        model = Sale
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        sale = Sale.objects.create(**validated_data)

        for item_data in items_data:
            if 'subtotal' not in item_data or item_data['subtotal'] is None:
                item_data['subtotal'] = Decimal(item_data['price']) * item_data['quantity']
            SaleItem.objects.create(sale=sale, **item_data)

        sale.update_total()
        return sale
