from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import TextField, ForeignKey, FileField


class User(models.Model):
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=10)

    def __str__(self):
        return self.username


class Post(models.Model):
    author = models.ForeignKey(User, related_name='posts')
    body = models.TextField(blank=True, null=True)
    # required
    title = models.CharField(max_length=255)
    number_positive = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    number_float = models.FloatField(default=0)

    def __str__(self):
        return self.body


class Photo(models.Model):
    post = models.ForeignKey(Post, related_name='photos')
    image = models.ImageField(upload_to="%Y/%m/%d", max_length=None, null=True)

    def __str__(self):
        return self.image


class Experiment(models.Model):
    notes = TextField(null=True)
    samplesheet = FileField(null=True, blank=True, )
    post = models.ForeignKey(Post, related_name='experiments')

    def __str__(self):
        return self.samplesheet
