import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from tickets.models import Ticket, TicketComment, TicketActivity, CannedResponse, SatisfactionRating, SLAPolicy


class Command(BaseCommand):
    help = 'Seed the database with sample data for the support ticket system'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))

        self.create_sla_policies()
        self.create_canned_responses()
        self.create_agents()
        self.create_tickets()

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))

    def create_sla_policies(self):
        self.stdout.write('Creating SLA policies...')

        policies = [
            {'priority': 'Critical', 'response_time_hours': 1, 'resolution_time_hours': 4},
            {'priority': 'High', 'response_time_hours': 2, 'resolution_time_hours': 8},
            {'priority': 'Medium', 'response_time_hours': 4, 'resolution_time_hours': 24},
            {'priority': 'Low', 'response_time_hours': 8, 'resolution_time_hours': 72},
        ]

        for policy_data in policies:
            SLAPolicy.objects.get_or_create(
                priority=policy_data['priority'],
                defaults={
                    'response_time_hours': policy_data['response_time_hours'],
                    'resolution_time_hours': policy_data['resolution_time_hours']
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Created {len(policies)} SLA policies'))

    def create_canned_responses(self):
        self.stdout.write('Creating canned responses...')

        canned_responses = [
            {'title': 'Initial Response - Technical', 'content': 
                'Thank you for contacting our technical support team. We have received your request '
                'and are currently reviewing it. We will get back to you within the specified SLA time.',
                'category': 'Technical'},
            {'title': 'Initial Response - Billing', 'content': 
                'Thank you for contacting our billing department. We have received your inquiry '
                'and will investigate it promptly. A representative will respond shortly.',
                'category': 'Billing'},
            {'title': 'Issue Resolved', 'content': 
                'We are pleased to inform you that your issue has been resolved. If you have any '
                'further questions or concerns, please don\'t hesitate to reach out.',
                'category': 'General'},
            {'title': 'Escalation Notice', 'content': 
                'Your ticket has been escalated to our senior technical team due to the complexity '
                'of the issue. They will contact you shortly with further assistance.',
                'category': 'Technical'},
            {'title': 'Request for Information', 'content': 
                'To better assist you with your request, could you please provide the following '
                'additional information: [Please specify required details]',
                'category': 'General'},
            {'title': 'Password Reset Instructions', 'content': 
                'To reset your password, please follow these steps:\n1. Go to the login page\n'
                '2. Click "Forgot Password"\n3. Enter your email address\n4. Follow the instructions sent to your email',
                'category': 'Technical'},
            {'title': 'Billing Inquiry Acknowledgment', 'content': 
                'We have received your billing inquiry. Our finance team is reviewing your account '
                'and will provide a detailed response within 24 hours.',
                'category': 'Billing'},
            {'title': 'Feature Request Acknowledgment', 'content': 
                'Thank you for your feature suggestion! We value customer feedback and have added '
                'your request to our product roadmap for consideration.',
                'category': 'Feature Request'},
            {'title': 'Bug Confirmation', 'content': 
                'Thank you for reporting this issue. Our development team has confirmed this as a '
                'bug and is working on a fix. We will notify you once the fix is deployed.',
                'category': 'Bug'},
            {'title': 'Ticket Closure', 'content': 
                'This ticket is being closed as resolved. If you experience any related issues, '
                'please feel free to reopen this ticket or create a new one.',
                'category': 'General'},
        ]

        for response_data in canned_responses:
            CannedResponse.objects.get_or_create(
                title=response_data['title'],
                defaults={
                    'content': response_data['content'],
                    'category': response_data['category']
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Created {len(canned_responses)} canned responses'))

    def create_agents(self):
        self.stdout.write('Creating agent users...')

        # Create Agent group if it doesn't exist
        agent_group, _ = Group.objects.get_or_create(name='Agent')

        agents = [
            {'username': 'agent1', 'email': 'agent1@company.com', 'first_name': 'John', 'last_name': 'Smith'},
            {'username': 'agent2', 'email': 'agent2@company.com', 'first_name': 'Sarah', 'last_name': 'Johnson'},
            {'username': 'agent3', 'email': 'agent3@company.com', 'first_name': 'Mike', 'last_name': 'Williams'},
            {'username': 'agent4', 'email': 'agent4@company.com', 'first_name': 'Emily', 'last_name': 'Brown'},
            {'username': 'agent5', 'email': 'agent5@company.com', 'first_name': 'David', 'last_name': 'Jones'},
        ]

        created_agents = []
        for agent_data in agents:
            user, created = User.objects.get_or_create(
                username=agent_data['username'],
                defaults={
                    'email': agent_data['email'],
                    'first_name': agent_data['first_name'],
                    'last_name': agent_data['last_name'],
                    'is_staff': True
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                user.groups.add(agent_group)
                created_agents.append(user)

        # Create a superuser if not exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@company.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin/admin123'))

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_agents)} agents'))
        return User.objects.filter(groups=agent_group)

    def create_tickets(self):
        self.stdout.write('Creating tickets...')

        agents = list(User.objects.filter(groups__name='Agent'))
        if not agents:
            agents = list(User.objects.filter(is_staff=True))[:5]

        categories = ['Technical', 'Billing', 'General', 'Feature Request', 'Bug']
        priorities = ['Low', 'Medium', 'High', 'Critical']
        statuses = ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed']

        # Sample data for tickets
        subjects = [
            'Cannot access my account',
            'Billing discrepancy on last invoice',
            'Feature request: Dark mode',
            'Application crashes on startup',
            'Password reset not working',
            'Need help with API integration',
            'Request for refund',
            'Slow performance on dashboard',
            'Mobile app login issues',
            'Export data functionality broken',
            'Two-factor authentication setup',
            'Account upgrade request',
            'Bug: Data not syncing',
            'Question about pricing plans',
            'Integration with third-party service',
            'Email notifications not received',
            'File upload size limit increase',
            'User permissions clarification',
            'Report generation timeout',
            'Custom field configuration help',
        ]

        descriptions = [
            'I am experiencing issues with my account access. When I try to log in, I get an error message.',
            'The amount charged on my last invoice does not match my subscription plan. Please review.',
            'It would be great to have a dark mode option in the application for better usability at night.',
            'The application crashes immediately after launching. I have tried reinstalling but the issue persists.',
            'I requested a password reset but never received the email. Please help me regain access.',
            'I need assistance integrating your API into our existing system. Documentation is unclear.',
            'I would like to request a refund for the service I purchased last month due to [reason].',
            'The dashboard takes too long to load. It is affecting our productivity significantly.',
            'I cannot log in to the mobile app. The same credentials work fine on the web version.',
            'When I try to export my data, the system throws an error and nothing downloads.',
            'I would like to enable two-factor authentication for better security. How do I set this up?',
            'I need to upgrade my account to access more features. What are the available options?',
            'Data synchronization between devices is not working properly. Changes are not reflected.',
            'I have questions about the different pricing plans and which one would be best for my needs.',
            'Can you help me integrate your service with a third-party application we use?',
            'I am not receiving email notifications for important updates. Please check my settings.',
            'The current file upload size limit is too restrictive for our use case. Can it be increased?',
            'I need clarification on how user permissions work and how to set them up correctly.',
            'Report generation keeps timing out for large datasets. Is there a workaround?',
            'I need help configuring custom fields for my project. The current setup is not working as expected.',
        ]

        requesters = [
            {'name': 'Alice Cooper', 'email': 'alice@example.com'},
            {'name': 'Bob Dylan', 'email': 'bob@example.com'},
            {'name': 'Charlie Parker', 'email': 'charlie@example.com'},
            {'name': 'Diana Ross', 'email': 'diana@example.com'},
            {'name': 'Elvis Presley', 'email': 'elvis@example.com'},
            {'name': 'Frank Sinatra', 'email': 'frank@example.com'},
            {'name': 'Grace Jones', 'email': 'grace@example.com'},
            {'name': 'Henry Ford', 'email': 'henry@example.com'},
            {'name': 'Iris Murdoch', 'email': 'iris@example.com'},
            {'name': 'Jack Nicholson', 'email': 'jack@example.com'},
            {'name': 'Kate Bush', 'email': 'kate@example.com'},
            {'name': 'Leonard Cohen', 'email': 'leonard@example.com'},
            {'name': 'Mick Jagger', 'email': 'mick@example.com'},
            {'name': 'Nina Simone', 'email': 'nina@example.com'},
            {'name': 'Oprah Winfrey', 'email': 'oprah@example.com'},
        ]

        ticket_count = 100
        created_tickets = []

        for i in range(ticket_count):
            # Randomize ticket properties
            subject = random.choice(subjects)
            description = random.choice(descriptions)
            category = random.choice(categories)
            priority = random.choices(priorities, weights=[30, 40, 20, 10])[0]
            requester = random.choice(requesters)

            # Determine status with weighted probabilities
            status = random.choices(
                statuses,
                weights=[25, 30, 15, 20, 10]
            )[0]

            # Create ticket with historical dates
            days_ago = random.randint(0, 30)
            created_at = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))

            ticket = Ticket.objects.create(
                subject=subject,
                description=description,
                requester_name=requester['name'],
                requester_email=requester['email'],
                category=category,
                priority=priority,
                status=status,
                assigned_to=random.choice(agents) if random.random() > 0.3 and status != 'Open' else None,
                created_at=created_at,
                sla_deadline=created_at + timedelta(hours={'Critical': 4, 'High': 8, 'Medium': 24, 'Low': 72}.get(priority, 24))
            )

            # Set resolved_at for resolved/closed tickets
            if status in ['Resolved', 'Closed']:
                resolution_hours = random.uniform(1, 48)
                ticket.resolved_at = created_at + timedelta(hours=resolution_hours)

                # Randomly set SLA breached
                if random.random() < 0.15:  # 15% breach rate
                    ticket.sla_breached = True

                ticket.save(update_fields=['resolved_at', 'sla_breached'])

                # Add satisfaction rating for some resolved tickets
                if random.random() < 0.6:  # 60% of resolved tickets have ratings
                    SatisfactionRating.objects.create(
                        ticket=ticket,
                        rating=random.choices([1, 2, 3, 4, 5], weights=[5, 10, 15, 35, 35])[0],
                        comment=random.choice([
                            'Great service!',
                            'Issue was resolved quickly.',
                            'Could have been faster.',
                            'Agent was very helpful.',
                            'Satisfactory resolution.',
                            ''
                        ])
                    )

            created_tickets.append(ticket)

            # Create activity log
            TicketActivity.objects.create(
                ticket=ticket,
                action='Created',
                performed_by=random.choice(agents) if random.random() > 0.5 else None,
                timestamp=created_at
            )

            # Add comments
            num_comments = random.choices([0, 1, 2, 3], weights=[20, 40, 25, 15])[0]
            for j in range(num_comments):
                comment_time = created_at + timedelta(hours=random.randint(1, 24 * days_ago + 1))
                if comment_time > timezone.now():
                    comment_time = timezone.now() - timedelta(minutes=random.randint(1, 60))

                is_internal = random.random() < 0.2  # 20% internal notes

                comment_texts = [
                    'Looking into this issue now.',
                    'I need more information to proceed.',
                    'This has been escalated to the development team.',
                    'Issue has been identified and we are working on a fix.',
                    'Please try the following steps...',
                    'Internal note: Customer seems frustrated, handle with care.',
                    'This is a known issue with a workaround available.',
                    'Waiting for customer response.',
                    'Fix has been deployed, please verify.',
                    'Thank you for your patience.',
                ]

                TicketComment.objects.create(
                    ticket=ticket,
                    author=random.choice(agents) if not is_internal and random.random() > 0.3 else random.choice(agents),
                    content=random.choice(comment_texts),
                    is_internal=is_internal,
                    created_at=comment_time
                )

            # Add additional activities based on status
            if ticket.assigned_to:
                TicketActivity.objects.create(
                    ticket=ticket,
                    action='Assigned',
                    performed_by=random.choice(agents),
                    old_value='Unassigned',
                    new_value=ticket.assigned_to.username,
                    timestamp=created_at + timedelta(hours=random.randint(1, 4))
                )

            if status in ['Resolved', 'Closed']:
                TicketActivity.objects.create(
                    ticket=ticket,
                    action='Resolved',
                    performed_by=ticket.assigned_to or random.choice(agents),
                    timestamp=ticket.resolved_at
                )

        self.stdout.write(self.style.SUCCESS(f'Created {ticket_count} tickets with comments and activities'))
