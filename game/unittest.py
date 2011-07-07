import unittest

class EntityTestModel(unittest.TestCase):
    def setup(self):
        switch = EntityType(name='switch', sprite='switch', type='switch.py')
        state = State(name='on?', entityType=switch)
        beh = Behaviour(name='toggle', entityType=switch)
        trig = Trigger(name='trigger')
        act = ActuatorType(entityType=switch, behaviour=beh, trigger=trig)
    def tearDown(self):
        Map.objects.all().delete()
        Tile.objects.all().delete()
        EntityType.objects.all().delete()
        State.objects.all().delete()
        Trigger.objects.all().delete()
        Behaviour.objects.all().delete()
        ActuatorType.objects.all().delete()
        EntityInstance.objects.all().delete()
        Actuator.objects.all().delete()

class EntitytoJSONTestModel(TestModel):
    def runTest(self):
       
        