# Blender script to start MCP server automatically
# Run with: blender --python start-blender-server.py
# Or run headless: blender --background --python start-blender-server.py

import bpy
import sys
import time

print("=" * 50)
print("ULTRA-CREATE - Starting Blender MCP Server")
print("=" * 50)

# Enable the addon
try:
    bpy.ops.preferences.addon_enable(module="blender_mcp")
    print("[OK] BlenderMCP addon enabled")
except Exception as e:
    print(f"[ERROR] Failed to enable addon: {e}")
    sys.exit(1)

# Save preferences
try:
    bpy.ops.wm.save_userpref()
    print("[OK] Preferences saved")
except:
    pass

# Start the server
# The addon should auto-start, but we can trigger it manually
print("[INFO] BlenderMCP server should now be running")
print("[INFO] Listening on default port (usually 9876)")
print("")
print("Keep this Blender instance open for Claude to connect.")
print("Press Ctrl+C in terminal to stop.")
print("=" * 50)

# Keep Blender running (for GUI mode)
# In background mode, we need to keep the process alive
if bpy.app.background:
    print("[INFO] Running in background mode - server active")
    # Keep alive by processing events
    while True:
        time.sleep(1)
