{

"metadata" :
{
    "formatVersion" : 3,
    "sourceFile"    : "puerta.blend",
    "generatedBy"   : "Blender 2.62 Exporter",
    "objects"       : 1,
    "geometries"    : 1,
    "materials"     : 2,
    "textures"      : 2
},

"type" : "scene",
"urlBaseType" : "relativeToScene",


"objects" :
{
    "Puerta" : {
        "geometry"  : "geo_Cube.003",
        "groups"    : [  ],
        "materials" : [ "Material.002" ],
        "position"  : [ 0.000000, 0.000000, 0.000000 ],
        "rotation"  : [ 0.000000, -0.000000, 0.000000 ],
        "quaternion": [ 1.000000, 0.000000, 0.000000, 0.000000 ],
        "scale"     : [ 1.000000, 1.000000, 1.000000 ],
        "visible"       : true,
        "castShadow"    : false,
        "receiveShadow" : false,
        "doubleSided"   : false
    }
},


"geometries" :
{
    "geo_Cube.003" : {
        "type" : "embedded_mesh",
        "id"  : "emb_Cube.003"
    }
},


"textures" :
{
    "puerta descendente M.png" : {
        "url": "texts/puerta descendente M.png",
        "wrap": ["repeat", "repeat"]
    },

    "puerta descendente plancha.png" : {
        "url": "texts/puerta descendente plancha.png",
        "wrap": ["repeat", "repeat"]
    }
},


"materials" :
{
    "Material" : {
        "type": "MeshLambertMaterial",
        "parameters": { "color": 10724259, "opacity": 1, "map": "puerta descendente M.png", "blending": "NormalBlending" }
    },

    "Material.002" : {
        "type": "MeshLambertMaterial",
        "parameters": { "color": 10724259, "opacity": 1, "map": "puerta descendente plancha.png", "blending": "NormalBlending" }
    }
},


"embeds" :
{
"emb_Cube.003": {    "scale" : 1.000000,

    "materials": [	{
	"DbgColor" : 15658734,
	"DbgIndex" : 0,
	"DbgName" : "Material.002",
	"blending" : "NormalBlending",
	"colorAmbient" : [0.0, 0.0, 0.0],
	"colorDiffuse" : [0.6400000190734865, 0.6400000190734865, 0.6400000190734865],
	"colorSpecular" : [0.5, 0.5, 0.5],
	"depthTest" : true,
	"depthWrite" : true,
	"mapDiffuse" : "puerta descendente plancha.png",
	"mapDiffuseWrap" : ["repeat", "repeat"],
	"shading" : "Lambert",
	"specularCoef" : 50,
	"transparency" : 1.0,
	"transparent" : false,
	"vertexColors" : false
	}],

    "vertices": [4.100000,0.450000,0.000000,4.100000,-0.450000,0.000000,-4.100001,-0.449999,0.000000,-4.099998,0.450002,0.000000,4.100002,0.449998,9.600000,4.099997,-0.450003,9.600000,-4.100002,-0.449998,9.600000,-4.099999,0.450000,9.600000],

    "morphTargets": [],

    "normals": [0.577349,0.577349,-0.577349,0.577349,-0.577349,-0.577349,-0.577349,-0.577349,-0.577349,-0.577349,0.577349,-0.577349,0.577349,0.577349,0.577349,-0.577349,0.577349,0.577349,-0.577349,-0.577349,0.577349,0.577319,-0.577349,0.577349],

    "colors": [],

    "uvs": [[0.046875,0.707031,0.082031,0.707031,0.085938,0.457031,0.054688,0.457031,0.164062,0.496094,0.519531,0.496094,0.519531,0.449219,0.164062,0.449219,0.039062,0.957031,0.070312,0.957031,0.929688,0.921875,0.929688,0.507812,0.574219,0.507812,0.574219,0.921875,0.097656,0.207031,0.062500,0.207031,0.164062,0.507812,0.164062,0.921875,0.519531,0.921875,0.519531,0.507812]],

    "faces": [43,0,1,2,3,0,0,1,2,3,0,1,2,3,43,4,7,6,5,0,4,5,6,7,4,5,6,7,43,0,4,5,1,0,0,8,9,1,0,4,7,1,43,1,5,6,2,0,10,11,12,13,1,7,6,2,43,2,6,7,3,0,2,14,15,3,2,6,5,3,43,4,0,3,7,0,16,17,18,19,4,0,3,5]

}
},


"transform" :
{
    "position"  : [ 0.000000, 0.000000, 0.000000 ],
    "rotation"  : [ -1.570796, 0.000000, 0.000000 ],
    "scale"     : [ 1.000000, 1.000000, 1.000000 ]
},

"defaults" :
{
    "bgcolor" : [ 0.000000, 0.000000, 0.000000 ],
    "bgalpha" : 1.000000,
    "camera"  : ""
}

}
