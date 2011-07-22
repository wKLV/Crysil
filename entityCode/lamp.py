from crysil.entityCode import jsonMessages
from crysil.game.models import EntityStateInstance, PCConcreteState, State

def on(instance, state):
    w = EntityStateInstance.objects.get(entity=instance, saved=state)
    on = State.objects.get(name='on')
    off = State.objects.get(name='off')
    v = w.state 
    if(v == on):
        w.state = off
        w.save()
        return jsonMessages.createJSONResponse(
                changeSprite= {'instance': str(instance.id),
                                'newSprite': 1 })
    elif (v == off):
        w.state = on
        w.save()
        return jsonMessages.createJSONResponse(
                changeSprite= {'instance': str(instance.id),
                                'newSprite': 2 })
