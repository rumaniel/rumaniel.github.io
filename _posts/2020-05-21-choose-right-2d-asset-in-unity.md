---
layout: post
title: Choosing the right 2d assets in Unity3d
image: /assets/sugar.jpg
date: 2020-05-21 22:24:34 +0900
tags: [unity, art]
categories: [unity, art]
---

# 작성의도

새로 프로젝트 셋팅할때 마다 고민되는 이슈.

# 리소스
1. 아트는 스케일 다운만 가능하다. 업 하면 퀄리티 잃는다.
-> 목표 해상도의 2배 큰 사이즈로 아트 작업 권장

2. 아트가 엔진에 임포트 될때 텍스쳐는 2^n 승으로 올라간다
-> 아틀라스화 하라

3. 적정 해상도 유지하라
With Retina (an Apple trademark) and other modern high-DPI screens, while the actual hardware resolution is very high (e.g. 4K), what they can do is to run at a simulated lower resolution (usually half, say for instance full-HD instead of 4K) but then they render images and text using twice the pixels, so that they appear very crisp.

Today high-DPI screens are usually 144 DPI, but you can find phones that boast up to 400 DPI or more since they are packing a lot of pixels on relatively small screens. 

# 유니티
## 유닛
유니티는 유닛 이란 단위계를 사용하고, 물리 최적화를 위해 1 유닛에 1 미터로 사용함. 2d 에선 중요치 않으나 Tilemap 을 쓸때 1 unit = 1 tile 로 설정하면 편하다.

## 카메라
Orthographic 카메라에는 size 라는 파라미터가 있다. 이 수치의 2배가 된 값은 세로 축에 몇개의 유닛을 만들지를 나타낸다. 
예를들어 size 가 5라면 세로로 10개의 유닛을 보여준다. 가로축은 유저의 비율에 따라 결정된다. 예를들어 16:9 비율이면 
16:9 = x:10
x = (16 / 9) * 10
x = 17.7 
이고 이는 가로로 17.7 유닛을 보여줍니다.

## 스프라이트
각 스프라이트는 픽셀당 유닛 설정 가능. 말그대로 한 유닛에 몇 픽셀을 보여줄것인가에 대한 값.
사이즈가 5일때 1080p 에 대응하고 싶으면 1080/10 = 108 ppu 면 된다. 이런식으로 조절할것.


refference
https://blogs.unity3d.com/kr/2018/11/19/choosing-the-resolution-of-your-2d-art-assets/
https://meetup.toast.com/posts/155
https://en.wikipedia.org/wiki/Comparison_of_high-definition_smartphone_displays
https://unity.com/how-to/optimize-performance-2d-games-unity-tilemap