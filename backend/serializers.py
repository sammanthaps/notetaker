from rest_framework.serializers import Serializer, ModelSerializer, EmailField, CharField
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken
from django.utils.translation import gettext_lazy as _
from .models import User


class LoginSerializer(Serializer):
    email = EmailField()
    password = CharField(
        style={"input_type": "password"}, write_only=True
    )


class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "username", "email", "password", "auth_token"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = self.Meta.model(**validated_data)
        password = validated_data.pop("password", None)

        if password is not None:
            user.set_password(password)
            user.save()
        return validated_data


class RefreshSerializer(TokenRefreshSerializer):
    refresh = None

    def validate(self, attrs):
        attrs["refresh"] = self.context["request"].COOKIES.get("refresh")
        if attrs["refresh"]:
            return super().validate(attrs)
        else:
            raise InvalidToken(_("No valid token found."))
