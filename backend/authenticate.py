from rest_framework.exceptions import PermissionDenied
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomAuthentication(JWTAuthentication):
    @staticmethod
    def enforce_csrf(request):
        """
        Enforce CSRF validation.
        """
        check = CSRFCheck(request)

        # populates request.META['CSRF_COOKIE'], which is used in process_view()
        # check.process_request(request)

        reason = check.process_view(request, None, (), {})
        if reason:
            # CSRF failed, bail with explicit error message
            raise PermissionDenied('CSRF Failed: %s' % reason)

    def authenticate(self, request):
        """
        Authenticate user using HTTPOnly cookies.
        """
        header = self.get_header(request)

        if header is None:
            raw_token = request.COOKIES.get("access", None)
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        self.enforce_csrf(request)
        return self.get_user(validated_token), validated_token
