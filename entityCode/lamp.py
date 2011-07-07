from entityCode import jsonMessages
from game.models import WorldState, State

def toggle(instance):
    w = WorldState.objects.filter(state= State.objects.filter(name='on?')
            .get(entityType=instance.type)).get(map=instance.map)
    v = w.value 
    if(v is False):
        w.value = True
        w.save()
        print w.value
        return jsonMessages.createJSONResponse(
                changeSprite= {'instance': str(instance.id),
                                'newSprite': '/static/pj/lampon.png' })
    elif (v is True):
        w.value = False
        w.save()
        return jsonMessages.createJSONResponse(
                changeSprite= {'instance': str(instance.id),
                                'newSprite': '/static/pj/lamp.png' })
