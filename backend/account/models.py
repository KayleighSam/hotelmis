from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    # Make email unique & primary login
    email = models.EmailField(_('email address'), unique=True)

    # Make username optional (but still keep the field in DB)
    username = models.CharField(
        _('username'),
        max_length=150,
        blank=True,
        null=True,
        help_text=_('Optional. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    second_name = models.CharField(max_length=30, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)

    # This tells Django to use email for login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # no extra fields required on createsuperuser

    def __str__(self):
        return f"{self.email} ({self.role})"
