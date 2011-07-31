from game import models
from entityCode import jsonMessages

models.State.objects.all().delete()
models.EntityStateType.objects.all().delete()
models.EntityStateInstance.objects.all().delete()
models.PCGenericState.objects.all().delete()
models.PCConcreteState.objects.all().delete()

switch = models.EntityType.objects.get(name='switch', sprite='switch.gif')
lamp = models.EntityType.objects.get(name='lamp', sprite='lamp.png')

on = models.State(name='on')
off = models.State(name='off')
on.save()
off.save()

state = models.EntityStateType(name='on?', entity=lamp)
state.save()
state.posibilities.add(on)
state.posibilities.add(off)
state.save()

genericState = models.PCGenericState()
genericState.save()
saved = models.PCConcreteState(pk=1, genericState=genericState, pcposx=1, pcposy=1)
saved.save()


for e in models.EntityInstance.objects.filter(type=lamp):
    lampState = models.EntityStateInstance(type=state, entity=e, saved=saved, state=off)
    lampState.save()