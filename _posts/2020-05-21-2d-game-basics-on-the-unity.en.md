---
layout: post
title: "2D Game Basics in Unity3d"
description: 2D 게임 개발 입문 가이드 - Tilemap, Sprites, 렌더링, 순서와 최적화
image: /assets/coding.jpg
date: 2020-05-21 22:24:34 +0900
tags: [2d-graphics, sprites]
categories: [unity]
lang: en
permalink: /2d-game-basics-on-the-unity/
---

# 2D Game Basics in Unity3d

When working on a fresh project in Unity, it about planning and sorting approach matters. It can be confusing to decide on the and organize them. This article summarizes the basics of working with 2D graphics, sprites, and tilemaps in Unity.

 along with optimization tips.

## Pixel Art Import (PPU)

Import workflow:

1. **Set Target Resolution** - Set to 2x the: 16:9 (iPhone 4/4, 1080x for iPad)  
2. **Choose Camera Size** - Orthographic or Perspective (2D vs Orthographic)  
   - Orthographic: Good for pixel art, camera-aligned  
   - Perspective: Better for 3D or games with complex scaling  
3. **Adjust Pixels Per Unit** - Typically 16-100 pixels per unit  
4. **Set Filter Mode** - Point (default) for sharp pixels, Bilinear for smooth scaling  
5. **Compression** - Use appropriate settings (e.g., PNG for sprites, lossless for audio)

   

## Tilemap Setup

```csharp
using UnityEngine;
using UnityEngine.Tilemaps;

public class TilemapManager : MonoBehaviour
{
    [SerializeField] private Tilemap tilemap;
    [SerializeField] private TileBase[] tileBases;
    
    private void Start()
    {
        // Initialize tilemap
        tilemap.ClearAllTiles();
        
        // Example: Place tiles
        foreach (TileBase tileBase in tileBases)
        {
            tilemap.SetTile(tileBase.position, tileBase.tile);
        }
    }
}

[Serializable]
public class TileBase
{
    public Vector3Int position;
    public Tile tile;
}
```

## Sprite Sorting Considerations

- **Sorting Order**: Render Queue vs Script (Script is more flexible)  
- **Transparency**: Handle alpha channel for effects  
- **Layer Management**: Organize sprites by type (background, characters, UI)  

## Optimization Tips

1. **Camera Culling**: Don't render off-screen sprites  
2. **Object Pooling**: Reuse sprite objects to reduce allocation  
3. **Batch Operations**: Group similar operations together  
4. **Reduce Draw Calls**: Minimize sprite rendering calls  

## Common Pitfalls
- Incorrect sort order (background appearing in front)  
- Forgot to set sorting layer or point  
- Using 3D sprites in a 2D game (overhead)  
- Not compressing textures

## Recommended Workflow
1. **Plan**: Design asset structure and layers  
2. **Create**: Set up Tilemap, sprites, and layers  
3. **Configure**: Set sorting, camera, and optimization settings  
4. **Test**: Verify visual quality and performance  
5. **Optimize**: Profile and fix bottlenecks

## Conclusion
Starting with 2D games in Unity is straightforward, but attention to detail in setup and optimization can make or break the game's performance and visual quality. Focus on proper asset import settings, tilemap configuration, and rendering optimization to create smooth, performant 2D experiences.

