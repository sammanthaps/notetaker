from datetime import datetime, timedelta, timezone
from random import randint
from typing import Optional
from uuid import uuid4
from django.conf import settings
from django.contrib.auth import authenticate, logout
from django.core.mail import EmailMultiAlternatives
from django.middleware import csrf
from django.template.loader import render_to_string
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import *
from .serializers import *


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customize token claim"""

    @classmethod
    def get_token(cls, user: object) -> object:
        token = super().get_token(user)

        # Custom claims
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name[0]

        return token


class IsNotAuthenticated(BasePermission):
    """
    Allow access only to non-authenticated users.
    """

    def has_permission(self, request: object, view: object) -> bool:
        return not request.user.is_authenticated


class SendEmail:
    """
    Send Emails to users:
        * Activation
        * Password Reset
    """

    def __init__(self, recipients: object, username: str, auth_token: str, otp_list: list, **kwargs: object) -> None:
        self.sender = settings.EMAIL_HOST_USER
        self.recipients = recipients
        self.username = username
        self.auth_token = auth_token
        self.email = EmailMultiAlternatives()
        self.otp_list = otp_list

    def activate_account(self) -> None:
        html_message = render_to_string("Email/Welcome.html", {
            "username": self.username,
            "otp_list": self.otp_list,
            "btn_link": f"http://localhost:5173/activate/account/{self.auth_token}"
        })
        plain_message = f"Hello, {self.username}! Welcome to Notetaker. \nCopy/Paste the link below in your browser to activate your account: \n http://localhost:5173/activate/account/{self.auth_token}"
        self.email.subject = "Welcome to Notetaker!"
        self.email.body = plain_message
        self.email.from_email = self.sender
        self.email.to = self.recipients
        self.email.attach_alternative(html_message, "text/html")

        self.email.send()

    def reset_password(self) -> None:
        html_message = render_to_string("Email/Password.html", {
            "username": self.username,
            "btn_link": f"http://localhost:5173/reset/account/{self.auth_token}"
        })
        self.email.subject = "Reset your Password"
        self.email.body = f"Hello, {self.username}! \nCopy/Paste the link below in your browser to reset your password: \n http://localhost:5173/reset/account/{self.auth_token}"
        self.email.from_email = self.sender
        self.email.to = self.recipients
        self.email.attach_alternative(html_message, "text/html")

        self.email.send()


class SetCookies:
    """
    Set access and refresh tokens as HttpOnly Cookies and
    get the CSRF Token during authentication.
    """

    def __init__(self) -> None:
        self.response = Response()

    def __call__(self, request: object, tokens: dict, *args: object, **kwargs: object) -> object:
        self.response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=tokens["access"],
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"]
        )

        self.response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            value=tokens["refresh"],
            expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"]
        )
        self.response[settings.SIMPLE_JWT["AUTH_COOKIE_XCSRF"]] = csrf.get_token(request)
        self.response.data = tokens
        self.response.status_code = int(201)
        return self.response


class DeleteCookies:
    """
    Delete all Cookies:
        * When logging user out.
        * When RefreshToken expires.
    """

    def __init__(self) -> None:
        self.response = Response()

    def __call__(self, *args: object, **kwargs: object) -> object:
        cookie_path = settings.SIMPLE_JWT["AUTH_COOKIE_PATH"]
        cookie_domain = settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"]
        cookie_same_site = settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"]
        self.response.delete_cookie(
            "access",
            path=cookie_path,
            domain=cookie_domain,
            samesite=cookie_same_site
        )
        self.response.delete_cookie(
            "refresh",
            path=cookie_path,
            domain=cookie_domain,
            samesite=cookie_same_site
        )
        self.response.delete_cookie(
            "csrftoken",
            path=cookie_path,
            domain=cookie_domain,
            samesite=cookie_same_site
        )
        self.response.delete_cookie(
            "X-CSRFToken",
            path=cookie_path,
            domain=cookie_domain,
            samesite=cookie_same_site
        )
        self.response["X-CSRFToken"] = None
        return self.response


class OneTimePassToken:
    """
    One Time Pass && Token:
        * Generate a 4 int list code as OTP.
        * Refresh user Token as per request.
        * Check user Token expiration date.
    """

    def __init__(self, user: Optional[object] = None) -> None:
        if user is not None:
            self.user = user
            self.expiration_date = user.last_token_update + timedelta(minutes=5)
        self.verification_code = None

    def generate_otp(self, *args: object, **kwargs: object) -> list:
        self.verification_code = [randint(1, 99) for _ in range(4)]
        return self.verification_code

    def refresh_otp_token(self, *args: object, **kwargs: object) -> object:
        self.user.auth_token = uuid4().hex
        self.user.last_token_update = timezone.now()
        return self.user

    def check_expiration(self, *args: object, **kwargs: object) -> bool:
        get_date_now = datetime.now(timezone.utc)
        return get_date_now < self.expiration_date


class EmailView(APIView):
    """
    Send Emails to users:
        * Forgot Password? Send a link to reset it.
        * Didn't receive an activation link? Resend it.
    """

    permission_classes = [IsNotAuthenticated]

    def __init__(self, **kwargs: object) -> None:
        super().__init__(**kwargs)
        self.email = None
        self.error404 = {"error": "The page you're trying to get does not exist. Verify your request."}

    def put(self, request: object) -> object:
        """Activation: Send an activation link again."""
        self.email = request.data.get("email")

        try:
            user = User.objects.get(email=self.email)
        except User.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            get_token = OneTimePassToken(user=user)
            # Refresh user Token
            user = get_token.refresh_otp_token()

            # Get OTP list
            otp_list = get_token.generate_otp()

            # Add OTP list to database
            user.auth_otp = "".join(str(o) for o in otp_list)
            user.save()

            email = SendEmail(
                recipients=[user.email],
                username=user.username,
                auth_token=user.auth_token,
                otp_list=otp_list
            )
            try:
                email.activate_account()
            except:
                return Response({"error": "Something went wrong. Verify your request and try again."}, status=400)
            else:
                return Response({"success": "Done! Check your email inbox for the activation link."}, status=201)

    def post(self, request: object) -> object:
        """Forgot Password: Send a link to user's email to reset password."""
        self.email = request.data.get("email")

        try:
            user = User.objects.get(email=self.email)
        except User.DoesNotExist:
            return Response({"error": "This email is not registered."}, status=404)
        else:
            get_token = OneTimePassToken(user=user)
            user = get_token.refresh_otp_token()
            user.save()

            email = SendEmail(
                recipients=[user.email],
                username=user.username,
                auth_token=user.auth_token,
                otp_list=[]
            )

            try:
                email.reset_password()
            except:
                return Response({"error": "Something went wrong. Verify your request and try again."}, status=400)
            else:
                return Response({"success": "Email sent successfully."}, status=201)


class LoginView(APIView):
    """Authenticate users, and generate a pair of Json Web Tokens"""
    permission_classes = [IsNotAuthenticated]

    @staticmethod
    def post(request: object) -> object:
        serializer = LoginSerializer(data=request.data)

        try:
            serializer.is_valid()
        except Exception as err:
            return Response({"error": str(err)}, status=500)
        else:
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "This email is not registered."}, status=404)
            else:
                if not user.is_verified:
                    return Response({
                        "error": "You must activate your account to sign in. Verify your email and follow the steps.",
                        "activation": "Haven't recieved the link?"
                    }, status=401)
                else:
                    auth = authenticate(request, email=email, password=password)

                    if auth is not None:
                        # Update last login
                        user.last_login = timezone.now()

                        # Refresh auth token every sign in
                        user.auth_token = uuid4().hex
                        user.last_token_update = timezone.now()

                        user.save()

                        # Get JWT Tokens for the authenticated user
                        refresh = RefreshToken.for_user(user)
                        tokens = {
                            "access": str(refresh.access_token),
                            "refresh": str(refresh)
                        }

                        # Set HTTP Only Cookies
                        set_cookies = SetCookies()
                        response = set_cookies(request, tokens)
                        return response
                    else:
                        return Response({"error": "Incorrect Password"}, status=401)


class RegisterView(APIView):
    """
    Register users and send an email for activation.
    """

    permission_classes = [IsNotAuthenticated]

    @staticmethod
    def post(request: object) -> object:
        data = request.data
        serializer = RegisterSerializer(data=data)
        password = data.get("password")
        confirmation = data.get("confirmation")

        if password != confirmation:
            return Response({"error": "Passwords must match"}, status=400)

        if serializer.is_valid():
            serializer.save()
            try:
                user = User.objects.get(email=serializer.validated_data.get("email"))
            except User.DoesNotExist:
                return Response({"error": "The page you're trying to get does not exist. Verify your request."},
                                status=404)
            else:
                auth_token = user.auth_token
                get_otp = OneTimePassToken()
                otp_list = get_otp.generate_otp()

                user.auth_otp = "".join(str(o) for o in otp_list)
                user.save()

                email = SendEmail(
                    recipients=[user.email],
                    username=user.username,
                    auth_token=auth_token,
                    otp_list=otp_list
                )
                try:
                    email.activate_account()
                except:
                    return Response({"error": "Invalid Email"}, status=401)
                else:
                    return Response({"success": "Verify your email to activate your account."}, status=201)
        else:
            not_unique_username = User.objects.filter(username=data.get("username")).exists()
            not_unique_email = User.objects.filter(email=data.get("email")).exists()

            if not_unique_username and not_unique_email:
                return Response({"error": "Username and Email address already taken."}, status=409)
            elif not_unique_email:
                return Response({
                    "error": "Email address already taken."
                }, status=409)
            else:
                return Response({
                    "error": "Username already taken."
                }, status=409)


class LogoutView(APIView):
    """Log users out and delete cookies."""
    def __init__(self, **kwargs: object) -> None:
        super().__init__(**kwargs)
        self.response = Response()

    def post(self, request: object) -> object:
        try:
            refresh = request.COOKIES.get("refresh")

            # Send token to blacklist
            token = RefreshToken(refresh)
            token.blacklist()

            # Delete the all the cookies
            delete_cookies = DeleteCookies()
            self.response = delete_cookies(request)
            logout(request)
        except:
            return Response({"error": "Invalid Token"}, status=500)
        else:
            return self.response


class AccountConfiguration(APIView):
    """Activate a user account or Reset user's password."""

    permission_classes = [IsNotAuthenticated]

    def __init__(self, **kwargs: object) -> None:
        super().__init__(**kwargs)
        self.error404 = {"error": "User does not exist. Verify your request, and try again."}
        self.invalid_link_error = {"error": "This link has expired."}

    def put(self, request: object, auth_token: str) -> object:
        """Activate a new user."""
        otp_list = request.data.get("otp_list")

        try:
            user = User.objects.get(auth_token=auth_token)
        except User.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            auth_token = OneTimePassToken(user=user)
            token_is_valid = auth_token.check_expiration()

            # Check if token is valid
            if not token_is_valid:
                return Response(self.invalid_link_error, status=401)
            # Check otp numbers
            elif user.auth_otp != otp_list:
                return Response({"error": "Verify your code and try again."}, status=401)

            # Mark user as verified
            user.is_verified = True

            # Update OTP
            user.auth_otp = ""

            # Refresh User Token
            user = auth_token.refresh_otp_token()

            user.save()
            return Response({"success": "Your account is now verified. You will be redirected to the home page."},
                            status=200)

    def post(self, request: object, auth_token: str) -> object:
        """Reset user password"""
        try:
            user = User.objects.get(auth_token=auth_token)
        except User.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            password = request.data.get("password")
            confirm = request.data.get("confirm")
            auth_token = OneTimePassToken(user=user)

            if confirm != password:
                return Response({"error": "Passwords must match."}, status=401)

            # Check if token is valid
            token_is_valid = auth_token.check_expiration()
            if not token_is_valid:
                return Response(self.invalid_link_error, status=401)

            # Update password
            user.set_password(password)

            # Refresh Token
            user = auth_token.refresh_otp_token()

            user.save()

            return Response({"success": "Password reset successfully. You will be redirected to the home page."},
                            status=201)


class RefreshView(TokenRefreshView):
    """Validate RefreshToken"""

    serializer_class = RefreshSerializer

    def finalize_response(self, request: object, response: object, *args: object, **kwargs: object) -> object:
        if response.data.get("refresh"):
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=response.data['refresh'],
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            del response.data["refresh"]
        response["X-CSRFToken"] = request.COOKIES.get("csrftoken")
        return super().finalize_response(request, response, *args, **kwargs)


class AbstractView(APIView):
    """
    This is an initializer class.
    All the subsequent classes will have inheritance from this one. It contains:
        - The '__init__' constructor to initialize the object's state.
        - The 'initial' handler implemented here:
            - Runs anything prior to calling the method handler.
            - Perform content negotiation and store the accepted info on the request.
            - Determine the API version, if versioning is in use.
            - Ensure that the incoming request is permitted.
            - Request current user.
            - Request data from server.
    """

    def __init__(self, **kwargs: object) -> None:
        super().__init__(**kwargs)
        self.format_kwarg = None
        self.user = None
        self.data = None
        self.error404 = {"error": "The page you're trying to get does not exist. Verify your request."}
        self.error400 = {
            "error": "Something went wrong when trying to validate your form. Verify it and try again."
        }

    def initial(self, request: object, *args: object, **kwargs: object) -> None:
        """
        Runs anything that needs to occur prior to calling the method handler.
        """
        self.format_kwarg = self.get_format_suffix(**kwargs)

        # Perform content negotiation and store the accepted info on the request
        neg = self.perform_content_negotiation(request)
        request.accepted_renderer, request.accepted_media_type = neg

        # Determine the API version, if versioning is in use.
        version, scheme = self.determine_version(request, *args, **kwargs)
        request.version, request.versioning_scheme = version, scheme

        # Ensure that the incoming request is permitted
        # self.perform_authentication(request)
        self.perform_authentication(request)
        self.check_permissions(request)
        self.check_throttles(request)

        # token = request.COOKIES.get("access")

        # Request User
        self.user = request.user

        # Request Data
        self.data = request.data

    def update_timestamp(self, content_id: str) -> object | None:
        """Update subjects' timestamp."""

        try:
            section = Section.objects.get(id=content_id)
        except Section.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            section.updated_on = timezone.now()
            section.save()


class ProfileView(AbstractView):
    """
    User:
        * Get user information.
        * Change user's credentials:
            * First Name
            * Last Name
            * Username
            * Email
        * Change user profile picture.
        * Delete user account.
    """

    def get(self, request: object) -> object:
        user = self.user.serialize()
        return Response(user, status=200)

    def post(self, request: object) -> object:
        """Change your password"""
        current_password = self.data.get("current").strip()
        new_password = self.data.get("password").strip()
        confirm_password = self.data.get("confirm").strip()

        if self.user.check_password(current_password):
            if new_password != confirm_password:
                return Response({"error": "Passwords must match."}, status=400)
            else:
                try:
                    self.user.set_password(new_password)
                except:
                    return Response(
                        {"error": "Something went wrong when trying to change your password. Try again later."},
                        status=500)
                else:
                    self.user.save()
                    return Response(status=204)
        else:
            return Response({"error": "The password you entered does not correspond to your current password."},
                            status=400)

    def put(self, request: object) -> object:
        """Change your credentials: First Name, Last Name, Username and Email"""
        first_name = self.data.get("first_name").strip()
        last_name = self.data.get("last_name").strip()
        username = self.data.get("username").strip()
        email = self.data.get("email").strip()

        not_unique_username = User.objects.filter(username=username).exists()
        not_unique_email = User.objects.filter(email=email).exists()

        if self.user.username != username and not_unique_username:
            return Response({"error": "Username already taken."}, status=409)

        if self.user.email != email and not_unique_email:
            return Response({"error": "Email already taken."}, status=409)

        try:
            self.user.first_name = first_name
            self.user.last_name = last_name
            self.user.username = username
            self.user.email = email
        except:
            return Response({"error": "Something went wrong when trying to update your credentials."}, status=500)
        else:
            self.user.save()
            user = self.user.serialize()
            return Response(user, status=200)

    def patch(self, request: object) -> object:
        """Change user profile picture"""

        avatar = self.data.get("avatar")
        old_avatar = self.user.avatar
        try:
            if old_avatar != "default-user.png" and os.path.isfile(old_avatar.path):
                os.remove(old_avatar.path)
            self.user.avatar = avatar
        except:
            return Response({"error": "You profile picture could not be updated."}, status=500)
        else:
            self.user.save()
            user = self.user.serialize()
            return Response(user, status=200)

    def delete(self, request: object) -> object:
        """Delete user account"""

        avatar = self.user.avatar

        if not self.user.check_password(self.data.get("password")):
            return Response({"error": "Wrong password!"}, status=400)

        try:
            if avatar != "default-user.png" and os.path.isfile(avatar.path):
                os.remove(avatar.path)
            user = User.objects.get(id=self.user.id)
        except User.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            user.delete()
            delete_cookies = DeleteCookies()
            response = delete_cookies(request)
            return response


class BoardView(AbstractView):
    """
    This view is responsible to handle all requests related to board's section.
        * Create
        * Retrieve
        * Update
        * Delete
    """

    def get(self, request: object) -> object:
        sections = Section.objects.filter(user=self.user, section_type="BD").order_by("-pinned")
        return Response([s.serialize() for s in sections], status=200)

    def post(self, request: object) -> object:
        try:
            new_board = Section(
                user=self.user,
                title=self.data.get("title"),
                section_type="BD"
            )
        except ValidationError:
            return Response(self.error400, status=400)
        else:
            new_board.save()
        return Response(new_board.id, status=201)

    def patch(self, request: object) -> object:
        try:
            board = Section.objects.get(id=self.data.get("board_id"))
        except Section.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            if self.data.get("action") == "pin":
                board.pinned = not board.pinned
            else:
                board.title = self.data.get("title")
            board.save()
            sections = Section.objects.filter(user=self.user, section_type="BD").order_by("-pinned")
        return Response([s.serialize() for s in sections], status=200)

    def delete(self, request: object) -> object:
        try:
            board = Section.objects.get(id=self.data.get("board_id"))
        except Section.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            board.delete()
        return Response(status=204)


class TaskView(AbstractView):
    """
    This view is responsible for handling all the requests related to board's tasks.
    The user can create, update and delete any task.
    """

    def get(self, request: object, board_id: str) -> object:
        contents = Content.objects.filter(
            user=self.user,
            section_id=board_id
        ).order_by("created_on")
        return Response([c.serialize() for c in contents], status=200)

    def post(self, request: object, board_id: str) -> object:
        try:
            new_task = Content(
                user=self.user,
                section_id=board_id,
                body=self.data.get("body"),
                updated_on=timezone.now()
            )
        except:
            return Response(self.error400, status=500)
        else:
            new_task.save()
            contents = Content.objects.filter(
                user=self.user,
                section_id=board_id
            ).order_by("created_on")
            self.update_timestamp(new_task.section.id)
            return Response([c.serialize() for c in contents], status=201)

    def patch(self, request: object, board_id: str) -> object:
        try:
            task = Content.objects.get(id=self.data.get("task_id"), section_id=board_id)
        except Content.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            if self.data.get("action") == "status":
                task.status = not task.status
            else:
                task.body = self.data.get("body")
            task.save()
            self.update_timestamp(task.section.id)
            return Response(status=204)

    def delete(self, request: object, board_id: str) -> object:
        try:
            task = Content.objects.get(id=self.data.get("task_id"), section_id=board_id)
        except Content.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            self.update_timestamp(task.section.id)
            task.delete(),
            return Response(status=204)


class BookView(AbstractView):
    """
    In this view the user can Create, Retrieve, Update and Delete books.
    """

    def get(self, request: object) -> object:
        sections = Section.objects.filter(user=self.user, section_type="BK").order_by("-pinned")
        return Response([s.serialize() for s in sections], status=200)

    def post(self, request: object) -> object:
        try:
            new_book = Section(
                user=self.user,
                title=self.data.get("title"),
                section_type="BK"
            )
        except ValidationError:
            return Response(self.error400, status=400)
        else:
            new_book.save()
        return Response(new_book.id, status=201)

    def patch(self, request: object) -> object:
        try:
            book = Section.objects.get(id=self.data.get("book_id"))
        except Section.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            if self.data.get("action") == "pin":
                book.pinned = not book.pinned
            else:
                book.title = self.data.get("title")
            book.save()
            sections = Section.objects.filter(user=self.user, section_type="BK").order_by("-pinned")
        return Response([s.serialize() for s in sections], status=200)

    def delete(self, request: object) -> object:
        try:
            book = Section.objects.get(id=self.data.get("book_id"))
        except Section.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            book.delete(),
        return Response(status=204)


class CategoryView(AbstractView):
    """
    This view is responsible to Create, Retrieve, Update and Delete subjects.
    """

    def get(self, request: object, book_id: str) -> object:
        categories = Category.objects.filter(user=self.user, section_id=book_id)
        return Response([s.serialize() for s in categories], status=200)

    def post(self, request: object, book_id: str) -> object:
        try:
            new_category = Category(
                user=self.user,
                title=self.data.get("title"),
                section_id=book_id
            )
        except ValidationError:
            return Response(self.error400, status=400)
        else:
            new_category.save()
            self.update_timestamp(new_category.section.id)
            categories = Category.objects.filter(user=self.user, section_id=book_id)
            return Response({
                "subjects": [s.serialize() for s in categories],
                "new_subject": new_category.id
            }, status=201)

    def patch(self, request: object, book_id: str) -> object:
        try:
            category = Category.objects.get(id=self.data.get("category_id"), section_id=book_id)
        except Category.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            category.title = self.data.get("title")
            category.save()
            self.update_timestamp(category.section.id)
            return Response(status=204)

    def delete(self, request: object, book_id: str) -> object:
        try:
            category = Category.objects.get(id=self.data.get("category_id"), section_id=book_id)
        except Category.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            self.update_timestamp(category.section.id)
            category.delete(),
            return Response(status=204)


class PagesView(AbstractView):
    """
    This view is responsible to Retrieve all the pages for a specific subject.
    """

    def get(self, request: object, book_id: str, category_id: str) -> object:
        contents = Content.objects.filter(
            user=self.user,
            section_id=book_id,
            category_id=category_id
        )
        return Response([c.serialize() for c in contents], status=200)

    def post(self, request: object, book_id: str, category_id: str) -> object:

        welcome_page = """# Welcome to your new page!\n\nYou can write your pages taking advantage of Markdown.\n\n![Logo](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fblogthinkbig.com%2Fwp-content%2Fuploads%2Fsites%2F4%2F2020%2F09%2FMarkdown-Logo-Example-Markdown-Preview-Enhanced.jpg)\n\nIf you want to learn how to use it, see **<a href="https://www.markdownguide.org/basic-syntax/" target="_blank">documentation</a>**.\n\n## Tips\n\nThis is your rendered page. You can edit it by clicking on the **edit button** at the **top** of the page."""

        try:
            new_page = Content(
                user=self.user,
                section_id=book_id,
                category_id=category_id,
                body=welcome_page
            )
        except ValidationError:
            return Response(self.error400, status=400)
        else:
            new_page.save()
            self.update_timestamp(new_page.section.id)
            pages = Content.objects.filter(
                user=self.user,
                section_id=book_id,
                category_id=category_id
            )
            return Response({
                "pages": [p.serialize() for p in pages],
                "pageId": new_page.id
            }, status=201)

    def delete(self, request: object, book_id: str, category_id: str) -> object:
        page_id = self.data.get("page_id")
        try:
            page = Content.objects.get(section_id=book_id, category_id=category_id, id=page_id)
        except Content.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            page.delete()
            self.update_timestamp(book_id)
            return Response(status=204)


class PageView(AbstractView):
    """
    This view is responsible to Create,
    Retrieve, Update and Delete a specific page.
    """

    def get(self, request: object, book_id: str, category_id: str, page_id: str) -> object:
        try:
            page = Content.objects.get(section_id=book_id, category_id=category_id, id=page_id)
        except Content.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            return Response(page.body, status=200)

    def patch(self, request: object, book_id: str, category_id: str, page_id: str) -> object:
        try:
            page = Content.objects.get(category_id=category_id, section_id=book_id, id=page_id)
        except Content.DoesNotExist:
            return Response(self.error404, status=404)
        else:
            page.body = self.data.get("body")
            page.save()
            self.update_timestamp(book_id)
            return Response(status=204)
