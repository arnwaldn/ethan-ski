# Test BlenderMCP - Creates a simple object to verify connection
import bpy

print("=== Test BlenderMCP ===")

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create a cube
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
cube = bpy.context.active_object
cube.name = "ULTRA_CREATE_Test_Cube"

# Apply material
mat = bpy.data.materials.new(name="TestMaterial")
mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.8, 0.2, 0.2, 1.0)  # Red
mat.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.5
mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.3
cube.data.materials.append(mat)

# Create a sphere
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(3, 0, 1))
sphere = bpy.context.active_object
sphere.name = "ULTRA_CREATE_Test_Sphere"

# Apply gold material to sphere
mat_gold = bpy.data.materials.new(name="GoldMaterial")
mat_gold.use_nodes = True
mat_gold.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (1.0, 0.84, 0.0, 1.0)  # Gold
mat_gold.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1.0
mat_gold.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.2
sphere.data.materials.append(mat_gold)

# Add light
bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))
sun = bpy.context.active_object
sun.name = "ULTRA_CREATE_Sun"

# Add camera
bpy.ops.object.camera_add(location=(7, -7, 5))
camera = bpy.context.active_object
camera.name = "ULTRA_CREATE_Camera"
camera.rotation_euler = (1.1, 0, 0.8)
bpy.context.scene.camera = camera

print("Scene creee avec succes:")
print(f"  - Cube rouge: {cube.name}")
print(f"  - Sphere or: {sphere.name}")
print(f"  - Lumiere: {sun.name}")
print(f"  - Camera: {camera.name}")

# Save test file
output_path = "C:/Claude-Code-Creation/exports/blender_mcp_test.blend"
bpy.ops.wm.save_as_mainfile(filepath=output_path)
print(f"Fichier sauvegarde: {output_path}")

print("=== Test BlenderMCP: SUCCESS ===")
