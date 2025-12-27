# Script to activate BlenderMCP addon
# Run with: blender --background --python activate-blender-addon.py

import bpy
import addon_utils

print("=== Activation BlenderMCP Addon ===")

# Enable the addon
try:
    bpy.ops.preferences.addon_enable(module="blender_mcp")
    print("BlenderMCP addon: ACTIVE")
except Exception as e:
    print(f"Erreur activation: {e}")
    # Try alternative method
    try:
        addon_utils.enable("blender_mcp", default_set=True)
        print("BlenderMCP addon: ACTIVE (methode alternative)")
    except Exception as e2:
        print(f"Erreur alternative: {e2}")

# Save preferences
try:
    bpy.ops.wm.save_userpref()
    print("Preferences sauvegardees")
except:
    print("Sauvegarde preferences echouee (normal en mode background)")

print("=== Fin activation ===")
