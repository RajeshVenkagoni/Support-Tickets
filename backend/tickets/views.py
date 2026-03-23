from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Q, F, FloatField
from django.db.models.functions import Cast
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ticket, TicketComment, TicketActivity, CannedResponse, SatisfactionRating, SLAPolicy
from .permissions import IsAdminOrReadOnly, IsAgent
from .serializers import (
    TicketSerializer, TicketListSerializer, TicketCommentSerializer, TicketActivitySerializer,
    CannedResponseSerializer, SatisfactionRatingSerializer, SLAPolicySerializer,
    RegisterSerializer, UserSerializer
)


def broadcast_ticket_update(ticket_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'ticket_{ticket_id}', {'type': 'ticket_update', 'data': data}
    )


def broadcast_dashboard_update(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'dashboard', {'type': 'dashboard_update', 'data': data}
    )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class SLAPolicyViewSet(viewsets.ModelViewSet):
    queryset = SLAPolicy.objects.all()
    serializer_class = SLAPolicySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('assigned_to').prefetch_related('comments', 'activities', 'rating')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to', 'sla_breached']
    search_fields = ['subject', 'ticket_number', 'requester_name', 'requester_email']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status', 'sla_deadline']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        return TicketSerializer

    def perform_create(self, serializer):
        ticket = serializer.save()
        TicketActivity.objects.create(ticket=ticket, action='Created', performed_by=self.request.user)
        broadcast_dashboard_update({
            'type': 'ticket_created',
            'ticket_id': ticket.id,
            'ticket_number': ticket.ticket_number
        })

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_status = old_instance.status
        old_priority = old_instance.priority
        old_assigned = old_instance.assigned_to

        ticket = serializer.save()

        # Track status changes
        if old_status != ticket.status:
            TicketActivity.objects.create(
                ticket=ticket,
                action='Status Changed',
                performed_by=self.request.user,
                old_value=old_status,
                new_value=ticket.status
            )
            if ticket.status == 'Resolved':
                ticket.resolved_at = timezone.now()
                ticket.save(update_fields=['resolved_at'])
                broadcast_ticket_update(ticket.id, {'type': 'resolved', 'ticket_number': ticket.ticket_number})

        # Track priority changes
        if old_priority != ticket.priority:
            TicketActivity.objects.create(
                ticket=ticket,
                action='Priority Changed',
                performed_by=self.request.user,
                old_value=old_priority,
                new_value=ticket.priority
            )

        broadcast_ticket_update(ticket.id, {'type': 'updated', 'ticket_number': ticket.ticket_number})
        broadcast_dashboard_update({'type': 'ticket_updated', 'ticket_id': ticket.id})

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        user_id = request.data.get('user_id')

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                old_assigned = ticket.assigned_to.username if ticket.assigned_to else 'Unassigned'
                ticket.assigned_to = user
                ticket.status = 'In Progress' if ticket.status == 'Open' else ticket.status
                ticket.save()
                TicketActivity.objects.create(
                    ticket=ticket,
                    action='Assigned',
                    performed_by=request.user,
                    old_value=old_assigned,
                    new_value=user.username
                )
                broadcast_ticket_update(ticket.id, {
                    'type': 'assigned',
                    'ticket_number': ticket.ticket_number,
                    'assigned_to': user.username
                })
                broadcast_dashboard_update({'type': 'ticket_assigned', 'ticket_id': ticket.id})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        old_status = ticket.status

        ticket.status = 'Resolved'
        ticket.resolved_at = timezone.now()
        ticket.save()

        TicketActivity.objects.create(
            ticket=ticket,
            action='Resolved',
            performed_by=request.user,
            old_value=old_status,
            new_value=request.data.get('resolution_notes', 'Resolved')
        )

        broadcast_ticket_update(ticket.id, {
            'type': 'resolved',
            'ticket_number': ticket.ticket_number
        })
        broadcast_dashboard_update({'type': 'ticket_resolved', 'ticket_id': ticket.id})

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketCommentSerializer(data=request.data)

        if serializer.is_valid():
            comment = serializer.save(ticket=ticket, author=request.user)
            TicketActivity.objects.create(
                ticket=ticket,
                action='Commented',
                performed_by=request.user
            )
            broadcast_ticket_update(ticket.id, {
                'type': 'new_comment',
                'comment': TicketCommentSerializer(comment).data
            })
            return Response(TicketCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_rating(self, request, pk=None):
        ticket = self.get_object()

        if hasattr(ticket, 'rating'):
            return Response(
                {'error': 'Rating already exists for this ticket'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SatisfactionRatingSerializer(data=request.data)
        if serializer.is_valid():
            rating = serializer.save(ticket=ticket)
            return Response(SatisfactionRatingSerializer(rating).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        ticket = self.get_object()
        return Response(TicketCommentSerializer(ticket.comments.all(), many=True).data)

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        ticket = self.get_object()
        return Response(TicketActivitySerializer(ticket.activities.order_by('timestamp'), many=True).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get ticket statistics for the current user."""
        user = request.user

        if user.groups.filter(name='Agent').exists() or user.is_staff:
            assigned_count = Ticket.objects.filter(assigned_to=user, status__in=['Open', 'In Progress']).count()
        else:
            assigned_count = 0

        created_count = Ticket.objects.filter(requester_email=user.email).count()

        return Response({
            'assigned_count': assigned_count,
            'created_count': created_count,
        })


class CannedResponseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CannedResponse.objects.all()
    serializer_class = CannedResponseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'category']


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()

        # Basic counts
        open_count = Ticket.objects.filter(status__in=['Open', 'In Progress']).count()
        unassigned_count = Ticket.objects.filter(assigned_to__isnull=True, status='Open').count()
        total_tickets = Ticket.objects.count()
        resolved_tickets = Ticket.objects.filter(status='Resolved').count()

        # SLA compliance percentage
        if resolved_tickets > 0:
            compliant_resolved = Ticket.objects.filter(
                status='Resolved',
                resolved_at__lte=F('sla_deadline')
            ).count()
            sla_compliance_pct = round((compliant_resolved / resolved_tickets) * 100, 1)
        else:
            sla_compliance_pct = 100.0

        # Average resolution time in hours
        resolved_with_time = Ticket.objects.filter(resolved_at__isnull=False)
        if resolved_with_time.exists():
            avg_resolution_seconds = resolved_with_time.annotate(
                resolution_seconds=Cast(F('resolved_at') - F('created_at'), FloatField())
            ).aggregate(avg=Avg('resolution_seconds'))['avg']
            avg_resolution_time = round(avg_resolution_seconds / 3600, 1) if avg_resolution_seconds else 0
        else:
            avg_resolution_time = 0

        # Tickets by priority
        tickets_by_priority = dict(
            Ticket.objects.values_list('priority').annotate(count=Count('id'))
        )

        # Tickets by category
        tickets_by_category = dict(
            Ticket.objects.values_list('category').annotate(count=Count('id'))
        )

        # Tickets by status
        tickets_by_status = dict(
            Ticket.objects.values_list('status').annotate(count=Count('id'))
        )

        # Agent workload (top 10)
        agent_workload = list(
            Ticket.objects.filter(
                assigned_to__isnull=False,
                status__in=['Open', 'In Progress']
            )
            .values('assigned_to__username', 'assigned_to__first_name', 'assigned_to__last_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Format agent names
        for agent in agent_workload:
            first = agent.pop('assigned_to__first_name', '')
            last = agent.pop('assigned_to__last_name', '')
            agent['name'] = f"{first} {last}".strip() or agent['assigned_to__username']

        # SLA breached count
        sla_breached_count = Ticket.objects.filter(sla_breached=True).count()

        # Recent activity (last 24 hours)
        recent_tickets = Ticket.objects.filter(
            created_at__gte=now - timedelta(hours=24)
        ).count()

        return Response({
            'open_count': open_count,
            'unassigned_count': unassigned_count,
            'total_tickets': total_tickets,
            'resolved_tickets': resolved_tickets,
            'sla_compliance_pct': sla_compliance_pct,
            'sla_breached_count': sla_breached_count,
            'avg_resolution_time_hours': avg_resolution_time,
            'tickets_by_priority': tickets_by_priority,
            'tickets_by_category': tickets_by_category,
            'tickets_by_status': tickets_by_status,
            'agent_workload': agent_workload,
            'recent_tickets_24h': recent_tickets,
        })
