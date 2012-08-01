from game import models
from django.core import serializers

with open("data.xml", "w") as out:
    serializers.get_serializer("json")().serialize(models.EntityType.objects.all(), stream=out)
