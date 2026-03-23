from django.contrib import admin
from .models import Ticket, TicketComment, TicketActivity, CannedResponse, SatisfactionRating, SLAPolicy

@admin.register(SLAPolicy)
class SLAAdmin(admin.ModelAdmin):
    list_display = ['priority', 'response_time_hours', 'resolution_time_hours']

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_number', 'subject', 'priority', 'status', 'assigned_to', 'sla_breached']
    list_filter = ['status', 'priority', 'category', 'sla_breached']

@admin.register(TicketComment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'author', 'is_internal', 'created_at']

@admin.register(CannedResponse)
class CannedAdmin(admin.ModelAdmin):
    list_display = ['title', 'category']

@admin.register(SatisfactionRating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'rating', 'created_at']
