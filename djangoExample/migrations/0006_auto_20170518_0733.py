# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-18 07:33
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('djangoExample', '0005_remove_post_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='post',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='photos', to='djangoExample.Post'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='post',
            name='title',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
    ]