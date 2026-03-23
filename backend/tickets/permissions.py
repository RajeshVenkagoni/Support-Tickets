from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Only admins can modify, others can read only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and (request.user.is_staff or request.user.is_superuser)


class IsAgent(permissions.BasePermission):
    """
    Check if user is in 'Agent' group or is staff/superuser.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Agent').exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Agent').exists()
