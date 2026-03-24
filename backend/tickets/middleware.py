from django.contrib.auth.models import User

class BypassAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = User.objects.first()
        if not user:
            # Create a fallback user if database is completely empty
            user, created = User.objects.get_or_create(
                username='admin',
                defaults={
                    'email': 'admin@example.com',
                    'is_staff': True,
                    'is_superuser': True,
                    'first_name': 'Admin',
                    'last_name': 'User'
                }
            )
            if created:
                user.set_password('admin')
                user.save()
                
        request.user = user
        return self.get_response(request)
