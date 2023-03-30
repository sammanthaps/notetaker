import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.deconstruct import deconstructible
import uuid


@deconstructible
class Save_File:
    def __init__(self, file_path):
        self.file_path = file_path

    def __call__(self, instance, filename):
        ext = filename.split(".")[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        return os.path.join(self.file_path, filename)


class User(AbstractUser):
    """
    User authentication model
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auth_token = models.UUIDField(default=uuid.uuid4(), unique=True)
    auth_otp = models.CharField(blank=True, null=True, max_length=8)
    last_token_update = models.DateTimeField(auto_now=True, null=True)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    username = models.CharField(max_length=40, unique=True)
    email = models.CharField(max_length=50, unique=True)
    avatar = models.ImageField(
        upload_to=Save_File("users/"),
        default="default-user.png"
    )

    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    def display_name(self):
        return f"{self.first_name} {self.last_name[0]}."

    def serialize(self):
        return {
            "first_name": self.first_name,
            "last_name": self.last_name,
            "username": self.username,
            "email": self.email,
            "avatar": self.avatar.url
        }


class AbstractModel(models.Model):
    """
    An abstract class for UUIID and Timestamp
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_on = models.DateTimeField(default=timezone.now)
    updated_on = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True


class Section(AbstractModel):
    """
    Define two sections: Board and Notebook
    """

    SECTION_OPTIONS = [("BD", "Board"), ("BK", "Book")]
    title = models.CharField(max_length=18)
    pinned = models.BooleanField(default=False)
    section_type = models.CharField(max_length=2, default="BD", choices=SECTION_OPTIONS)

    def __str__(self):
        return f"{self.id}: {self.title}"

    def serialize(self):
        values = {
            "pinned": self.pinned,
            "updated_on": self.updated_on.strftime("%b %m, %I:%M %p"),
            "title": self.title,
        }
        if self.section_type == "BD":
            values["board_id"] = self.id
        else:
            values["book_id"] = self.id

        return values


class Category(AbstractModel):
    """
    In this model the user can create subjects for each content.
    """

    title = models.CharField(max_length=20)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.id}: {self.title}"

    def serialize(self):
        return {
            "subject_id": self.id,
            "title": self.title,
            "book_id": self.section.id,
        }


class Content(AbstractModel):
    """
    In this model the user can create content for Boards and Books
    """

    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, blank=True, null=True)
    body = models.TextField()
    status = models.BooleanField(default=False)

    class Meta:
        ordering = ["updated_on"]

    def __str__(self):
        return self.body[:7]

    def getTitle(self):
        title = self.body.split("\n")
        idx = 0 if title[0].find("#") < 0 else ++1
        return f"{title[0][idx: 13]}..."

    def serialize(self):
        if self.section.section_type == "BD":
            values = {
                "board_id": self.section.id,
                "task_id": self.id,
                "status": self.status,
                "body": self.body,
            }
        else:
            values = {
                "book_id": self.section.id,
                "page_id": self.id,
                "body": self.getTitle(),
            }
        return values
