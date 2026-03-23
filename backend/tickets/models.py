from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class SLAPolicy(models.Model):
    PRIORITY_CHOICES = [('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Critical', 'Critical')]
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, unique=True)
    response_time_hours = models.PositiveIntegerField()
    resolution_time_hours = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.priority} SLA'


class Ticket(models.Model):
    CATEGORY_CHOICES = [('Technical', 'Technical'), ('Billing', 'Billing'), ('General', 'General'),
                        ('Feature Request', 'Feature Request'), ('Bug', 'Bug')]
    PRIORITY_CHOICES = [('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Critical', 'Critical')]
    STATUS_CHOICES = [('Open', 'Open'), ('In Progress', 'In Progress'), ('Waiting on Customer', 'Waiting on Customer'),
                      ('Resolved', 'Resolved'), ('Closed', 'Closed')]

    ticket_number = models.CharField(max_length=20, unique=True, blank=True)
    subject = models.CharField(max_length=500)
    description = models.TextField()
    requester_name = models.CharField(max_length=200)
    requester_email = models.EmailField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    sla_deadline = models.DateTimeField(null=True, blank=True)
    sla_breached = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            last = Ticket.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.ticket_number = f'TKT-{next_id:04d}'
        if not self.sla_deadline:
            resolution_hours = {'Critical': 4, 'High': 8, 'Medium': 24, 'Low': 72}
            hours = resolution_hours.get(self.priority, 24)
            self.sla_deadline = timezone.now() + timezone.timedelta(hours=hours)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.ticket_number}: {self.subject}'


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class TicketActivity(models.Model):
    ACTION_CHOICES = [
        ('Created', 'Created'), ('Assigned', 'Assigned'), ('Status Changed', 'Status Changed'),
        ('Priority Changed', 'Priority Changed'), ('Commented', 'Commented'),
        ('Resolved', 'Resolved'), ('Closed', 'Closed'),
    ]
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_value = models.CharField(max_length=200, blank=True)
    new_value = models.CharField(max_length=200, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class CannedResponse(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.title


class SatisfactionRating(models.Model):
    ticket = models.OneToOneField(Ticket, on_delete=models.CASCADE, related_name='rating')
    rating = models.PositiveIntegerField()  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
