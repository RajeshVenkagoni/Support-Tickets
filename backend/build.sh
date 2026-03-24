#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create default SLA policies if they don't exist
python manage.py shell << EOF
from tickets.models import SLAPolicy
policies = [
    ('Critical', 1, 4),
    ('High', 2, 8),
    ('Medium', 4, 24),
    ('Low', 8, 72),
]
for priority, response, resolution in policies:
    SLAPolicy.objects.get_or_create(
        priority=priority,
        defaults={'response_time_hours': response, 'resolution_time_hours': resolution}
    )
print('SLA policies created')
EOF
