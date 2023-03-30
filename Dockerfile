FROM python

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY . .

COPY ./entrypoint.sh .
ENTRYPOINT ["sh","./entrypoint.sh"]
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]