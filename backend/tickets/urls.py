from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet, CannedResponseViewSet, SLAPolicyViewSet,
    DashboardStatsView, UserListView
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'canned-responses', CannedResponseViewSet, basename='cannedresponse')
router.register(r'sla-policies', SLAPolicyViewSet, basename='slapolicy')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('users/', UserListView.as_view(), name='user-list'),
]
