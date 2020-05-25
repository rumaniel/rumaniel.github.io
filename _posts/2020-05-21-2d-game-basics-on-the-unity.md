---
layout: post
title: 2d game basics on the Unity3d
image: /assets/coding.jpg
date: 2020-05-21 22:24:34 +0900
tags: [unity, art]
categories: [unity, art]
---

# 작성의도

새로 프로젝트 셋팅할때 마다 고민되는 이슈들 정리.
todo

# 리소스

1. 아트는 스케일 다운만 가능하다. 업 하면 퀄리티 잃는다.
- 목표 해상도의 2배 큰 사이즈로 아트 작업 권장.

2. 아트가 엔진에 임포트 될때 텍스쳐는 2^n 승으로 올라간다.
- 아틀라스화 하라.


## 카메라
Orthographic 카메라에는 size 라는 파라미터가 있다. 이 수치의 2배가 된 값은 세로 축에 몇개의 유닛을 만들지를 나타낸다. 
예를들어 size 가 5라면 세로로 10개의 유닛을 보여준다. 가로축은 유저의 비율에 따라 결정된다. 예를들어 16:9 비율이면 
16:9 = x:10
x = (16 / 9) * 10
x = 17.7 
이고 이는 가로로 17.7 유닛을 보여준다.

## 스프라이트
각 스프라이트는 픽셀당 유닛 설정 가능. 말그대로 한 유닛에 몇 픽셀을 보여줄것인가에 대한 값.

사이즈가 5일때 1080p 에 대응하고 싶으면 1080/10 = 108 ppu(pixel per unit) 면 된다. 이런식으로 조절할것.



# 유니티
## 유닛
유니티는 유닛 이란 단위계를 사용하고, 물리 최적화를 위해 1 유닛에 1 미터로 사용함. 2d 에선 중요치 않으나 Tilemap 을 쓸때 1 unit = 1 tile 로 설정하면 편하다.

## 카메라
Orthographic 카메라에는 size 라는 파라미터가 있다. 이 수치의 2배가 된 값은 세로 축에 몇개의 유닛을 보여줄지를 나타낸다. 
예를들어 size 가 5라면 세로로 10개의 유닛을 보여준다. 가로축은 유저의 비율에 따라 결정된다. 예를들어 16:9 비율이면 
16:9 = x:10
x = (16 / 9) * 10
x = 17.7 
이고 이는 가로로 17.7 유닛을 보여준다.

## 스프라이트
각 스프라이트는 픽셀당 유닛 설정 가능. 말그대로 한 유닛에 몇 픽셀을 보여줄것인가에 대한 값.
사이즈가 5일때 1080p 에 대응하고 싶으면 1080/10 = 108 ppu 면 된다. 이런식으로 조절할것.

## sorting
sort rendering 은 Render Queue 에 의해 결정됨. 주로 불투명 큐/ 투명 큐가 있는데 Sprite renderer, tilemap, sprite shape render 는 투명 큐에 포함됨

### 투명 큐 소팅 오더
1. Sorting Layer and Order in Layer

같은 소팅 레이어에서는 Order in Layer 로 우선순위를 결정 할 수 있다.

2. Specify Render Queue

머테리얼이나 쉐이더 세팅에서 렌더 큐 타입을 설정 할 수 있다. 다른 머테리얼을 사용하는 경우에 그룹화나 정렬시 요긴하다. 

3. Distance to Camera

Perspective나 Orthographic 으로 설정 가능.
- Perspective
렌더러가 카메라로부터 직접 거리에 따라 결정
- Orthographic
렌더러의 위치와 카메라의 뷰 뱡향의 거리에 따라 결정. 2D의 기본 설정은 (0, 0, 1) 축을 따른다. 

카메라 컴퍼넌트의의 세팅에 따라 실제 카메라의 투명 정렬 모드가 설정되는데, script나 project setting 에서 수동으로 바꿀 수 있다. 주로 2.5d 게임에서 쓰는 테크닉.

5. Custom Axis sort mode

커스텀한 축을 기준으로 렌더러들을 정렬. 주로 isometric 게임에서 쓰는 테크닉.

6. Sprite Sort Point

기본적으로 정렬 포인트는 중간이고 카메라 위치와 이 정렬포인트 간의 거리로 정렬 순서를 결정한다. 다른 옵션으로는 월드 스페이스에서 정렬 포인트를 피벗 위치로 설정 할 수 있다.

7. Sorting Group

정렬 목적으로 같은 루트를 공유는 렌더러들을 그룹화 해주는 컴포넌트. 같은 소팅 그룹 안에 있는 모든 렌더러는 Sorting Layer, Order in Layer, Distance to Camera 를 공유한다.

8. Material/Shader

동적 배칭과 같이 효율을 위해 동일한 머터리얼 설정으로 정렬

9. A Tiebreaker occurs when multiple Renderers have the same sorting priorities.

여러 렌더러가 동일한 소팅 오더를 가질 경우 엔진이 렌더 큐에 렌더러를 배치하는 순서에 의해 결정됨. 이건 내부 프로세스라 컨트롤 못하니 이전에 잘 조절하라.

---

refference
* https://blogs.unity3d.com/kr/2018/11/19/choosing-the-resolution-of-your-2d-art-assets/
* https://meetup.toast.com/posts/155
* https://en.wikipedia.org/wiki/Comparison_of_high-definition_smartphone_displays
* https://unity.com/how-to/optimize-performance-2d-games-unity-tilemap
* https://docs.unity3d.com/Manual/2DSorting.html