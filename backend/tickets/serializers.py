from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ticket, TicketComment, TicketActivity, CannedResponse, SatisfactionRating, SLAPolicy


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class SLAPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = SLAPolicy
        fields = '__all__'


class TicketCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketComment
        fields = '__all__'
        read_only_fields = ['author', 'created_at']

    def get_author_name(self, obj):
        return f'{obj.author.first_name} {obj.author.last_name}'.strip() or obj.author.username


class TicketActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketActivity
        fields = '__all__'

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return f'{obj.performed_by.first_name} {obj.performed_by.last_name}'.strip() or obj.performed_by.username
        return 'System'


class SatisfactionRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SatisfactionRating
        fields = '__all__'
        read_only_fields = ['created_at']


class TicketSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    comments = TicketCommentSerializer(many=True, read_only=True)
    activities = TicketActivitySerializer(many=True, read_only=True)
    rating = SatisfactionRatingSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['ticket_number', 'created_at', 'updated_at', 'sla_deadline', 'sla_breached']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username
        return None


class TicketListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ['id', 'ticket_number', 'subject', 'requester_name', 'requester_email',
                  'category', 'priority', 'status', 'assigned_to', 'assigned_to_name',
                  'created_at', 'updated_at', 'sla_deadline', 'sla_breached', 'resolved_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username
        return None


class CannedResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CannedResponse
        fields = '__all__'
