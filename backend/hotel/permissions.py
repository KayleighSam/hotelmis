from rest_framework import permissions

class IsCustomAdmin(permissions.BasePermission):
    """
    Allows access only to users with role='admin' or is_staff=True
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(user and (getattr(user, "is_staff", False) or getattr(user, "role", "") == "admin"))
