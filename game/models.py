from django.db import models
import settings

class Tile (models.Model):
    """A piece in the floor of the map  """
    name = models.CharField(max_length=75)
    walkable = models.BooleanField()   
    def __unicode__(self):
        return self.name
    
class Map (models.Model):
    """A place where the player, which contains other elements, like Entities
    
    The floor consists of tiles
    """
    sizex = models.IntegerField()
    sizey = models.IntegerField()
    name = models.CharField(max_length=80)
    tiles = models.CommaSeparatedIntegerField(max_length=10000)
    tilemap = models.CommaSeparatedIntegerField(max_length=1000000)
    def __unicode__(self):
        return self.name

class Wall(models.Model):
    """A continuous vertical brick or stone structure that encloses or divides an area of land 
    
    The width must be multiple of 32, so it doesnt block half tile. The height has no restriction """
    sprite = models.FilePathField(settings.CRYSIL_PATH + 'media/walls')
    crossable = models.BooleanField()
    originx = models.IntegerField()
    originy = models.IntegerField()
    finalx = models.IntegerField()
    finaly = models.IntegerField()
    map = models.ForeignKey(Map)

class EntityType(models.Model):
    """Generalization of an entity, which contains its logic
    
    It contains its sprite, the file where his behaviours are contained,
    and has states (how may the entity be), behaviours (what can happen 
    to the entity), and actuatorsType (what can the user do with the entity)
    """
    name = models.CharField(max_length=35)
    type = models.FilePathField(settings.CRYSIL_PATH + "entityCode") 
    sprite = models.FilePathField(settings.CRYSIL_PATH + "media/pj")
    def __unicode__(self):
        return reactions.__unicode()
    
class State(models.Model):
    """It indicates a posibility of how a entity can be
    
    For example: Turned on, opened, dead...
    """
    name = models.CharField(max_length=35)    
    entityType = models.ForeignKey(EntityType)
    
class Trigger(models.Model):
    """All the ways of interact with an entity
    
    For example: Main action, Mouse over, a puzzle power...
    """
    name = models.CharField(max_length=25)

class Behaviour(models.Model):
    """Something that can happen to the entity, like opening, begining a battle
    
    It points to python code that will be executed
    """
    name = models.CharField(max_length=25)
    entityType = models.ForeignKey(EntityType)
  
class ActuatorType(models.Model):
    """Generalization of an Actuator, whic contains the base of the concrete Actuator
        
    It specifies the behaviour that will happen when it is used. This sets
    the behaviour which will be executed, but not the entity who has that
    behaviour. That is settled in Actuator
    """
    entityType = models.ForeignKey(EntityType)
    behaviour = models.ForeignKey(Behaviour)
    trigger = models.ForeignKey(Trigger)
    def __unicode__(self):
        return self.name
  
class EntityInstance (models.Model):
    """A concrete element in the map which the player can interact with
    
    This class only contains the position, the other stuff is in
    EntityType """
    type = models.ForeignKey(EntityType)
    posx = models.IntegerField()
    posy = models.IntegerField()
    map = models.ForeignKey(Map)
    def __unicode__(self):
        return self.type.name + "at" + str(self.posx) + str(self.posy)

class Actuator(models.Model):
    """Something that will happen when the user interacts with an entity
    
    It specifies the behaviour that will happen when it is used.    
    """
    type = models.ForeignKey(ActuatorType)
    owner = models.ForeignKey(EntityInstance, related_name='actuator_owner')
    target = models.ForeignKey(EntityInstance, related_name='actuator_target')
    
class WorldState(models.Model):
    """It saves the value of the states in one map of a player game and in a concrete time
    
    """
    state = models.ForeignKey(State)
    map = models.ForeignKey(Map)
    value = models.BooleanField()
    #TODO: PLAYER AND TIME