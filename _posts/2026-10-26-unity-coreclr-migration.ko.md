---
layout: post
title: "Unity CoreCLR 전환 대비 마이그레이션 체크리스트"
description: Unity 6.8에서 Mono가 제거되고 CoreCLR로 바뀝니다. 일정과 함께, 기존 프로젝트에서 미리 점검해야 할 코드 변경 사항을 예제로 정리합니다.
image: /assets/coding.jpg
date: 2026-10-26 13:00:00 +0900
tags: [C#]
categories: [unity]
lang: ko
permalink: /unity-coreclr-migration/
---

유니티가 2026년에 스크립팅 런타임을 Mono 에서 CoreCLR 로 바꿉니다. [Unity 버전별 C# 지원과 C# 8, 9 핵심 문법 정리]({{ site.baseurl }}/unity-csharp-8-and-9/) 에서 다뤘듯이 **언어 버전은 C# 9 / .NET Standard 2.1 그대로** 이지만, 런타임이 바뀌면서 코드 리로드 방식과 일부 API 동작이 달라집니다.

유니티는 이번 변경이 대부분 소스 호환된다고 설명하지만, 몇 가지는 의도된 breaking change 입니다. 이 글은 유니티의 [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279) 를 바탕으로, 기존 프로젝트에서 미리 점검해야 할 항목을 예제와 함께 정리합니다. 원문은 계속 업데이트되는 문서라서, 실제 적용 전에는 최신 내용을 확인하세요.

| 구분 | 목차 |
|---|---|
| **[<span class="toc-num">1</span>&nbsp;일정](#timeline)** | [<span class="toc-num">1.1</span>&nbsp;무엇이 바뀌고 무엇이 그대로인가](#what-changes) |
| **[<span class="toc-num">2</span>&nbsp;코드 리로드와 static 상태](#code-reload-and-statics)** | [<span class="toc-num">2.1</span>&nbsp;Fast Enter Play Mode](#fast-enter-play-mode)<br>[<span class="toc-num">2.2</span>&nbsp;static 상태 초기화](#reset-static-state)<br>[<span class="toc-num">2.3</span>&nbsp;코드 리로드 이벤트](#code-reload-events)<br>[<span class="toc-num">2.4</span>&nbsp;컨테이너에 남는 숨은 참조](#hidden-references-in-containers)<br>[<span class="toc-num">2.5</span>&nbsp;static 생성자 실행 순서](#static-constructor-order) |
| **[<span class="toc-num">3</span>&nbsp;API 변경](#api-changes)** | [<span class="toc-num">3.1</span>&nbsp;BinaryFormatter](#binaryformatter)<br>[<span class="toc-num">3.2</span>&nbsp;어셈블리 API](#assembly-apis)<br>[<span class="toc-num">3.3</span>&nbsp;인터페이스 재구현](#interface-reimplementation)<br>[<span class="toc-num">3.4</span>&nbsp;접근성 검사와 오버플로 검사](#access-and-overflow-checks)<br>[<span class="toc-num">3.5</span>&nbsp;텍스트 인코딩](#text-encodings)<br>[<span class="toc-num">3.6</span>&nbsp;문자열 해시와 로케일](#string-hash-and-locale)<br>[<span class="toc-num">3.7</span>&nbsp;부동소수점 결과](#floating-point)<br>[<span class="toc-num">3.8</span>&nbsp;Mono 전용 기능](#mono-specific-features)<br>[<span class="toc-num">3.9</span>&nbsp;Burst 함수 포인터](#burst-function-pointers)<br>[<span class="toc-num">3.10</span>&nbsp;사전 컴파일된 어셈블리](#precompiled-assemblies) |
| **[<span class="toc-num">4</span>&nbsp;마이그레이션 순서](#migration-steps)** |  |
{: .toc-table #toc}

---
# 일정 {#timeline}

| 버전 | 변경 내용 |
|---|---|
| Unity 6.6 | 새 프로젝트는 Fast Enter Play Mode 가 기본값. 기존 프로젝트는 그대로 |
| Unity 6.7 LTS alpha | 실험용 CoreCLR 데스크톱 플레이어(6000.7.0a2~), 실험용 IL2CPP iOS 플레이어(6000.7.0a5~). LTS 와 같이 설치해서 검증용으로만 사용 |
| Unity 6.8 | Mono 제거, CoreCLR 로 교체. Fast Enter Play Mode 만 사용 가능 |
| Unity 7.0 alpha | CoreCLR 기반 에디터. .NET 10 기반 툴체인과 BCL |

원문은 CoreCLR 전환 시점을 6.8 이라고도, 7.0 이라고도 써서 서로 맞지 않습니다. 실제 버전은 릴리스 노트로 확인하세요.

실험용 플레이어는 공식 지원 대상이 아니며 실제 서비스용으로 쓰면 안 됩니다. Mono 플레이어와 같은 .NET Standard 2.1 / C# 9 기능을 제공하고, 성능 차이도 크지 않다고 합니다.

## 무엇이 바뀌고 무엇이 그대로인가 {#what-changes}

* **그대로**
  * 언어 버전 C# 9, API 호환 수준 .NET Standard 2.1
  * IL2CPP 는 계속 Boehm GC 를 쓰고 동작이 바뀌지 않습니다.
  * 성능은 전체적으로 비슷한 수준(holistic performance parity)을 목표로 합니다. 일부는 빨라지고 일부는 느려질 수 있습니다.
* **바뀜**
  * 코드를 고치거나 플레이 모드에 들어갈 때 도메인 전체를 내리지 않습니다. **static 변수가 자동으로 초기화되지 않습니다.**
  * 7.0 부터 .NET 10 BCL 을 사용합니다. .NET Framework 4.7 에만 있던 일부 API 는 사라지거나 NuGet 패키지로 옮겨졌습니다(예 : `Microsoft.Win32.Registry`).
  * CoreCLR 은 자체 GC 를 쓰고, 85KB 이상 객체는 Large Object Heap 에 할당됩니다.
  * `System.Numerics.Vector3` 같은 타입을 쓸 수 있지만, 유니티 컴포넌트가 이 타입을 쓸 계획은 아직 없습니다.

---
# 코드 리로드와 static 상태 {#code-reload-and-statics}
가장 영향이 큰 변화입니다. 지금까지는 스크립트를 고치거나 플레이 모드에 들어갈 때 도메인 리로드가 static 상태를 모두 날려 줬기 때문에, static 을 대충 써도 문제가 드러나지 않았습니다.

## Fast Enter Play Mode
Fast Enter Play Mode 는 플레이 모드에 들어갈 때 도메인 리로드를 생략하는 기능입니다. 6.6 에서 새 프로젝트의 기본값이 되고, 6.8 에서는 유일한 선택지가 됩니다. Scene Reload 는 계속 옵션으로 남을 가능성이 높다고 합니다.

**지금 바로 켜서 문제를 찾는 것이 가장 좋은 준비입니다.** Project Settings > Editor > Enter Play Mode Settings 에서 도메인 리로드를 끄고 플레이를 여러 번 반복해 보세요.

[Project Auditor](https://docs.unity3d.com/Packages/com.unity.project-auditor@latest) 2.0.0 (Unity 6.0 부터 설치 가능)을 쓰면 문제 코드를 자동으로 찾을 수 있습니다. Preferences 에서 **Use Roslyn Analyzers** 를 켜고 분석한 뒤, **Domain Reload** 탭을 확인하세요.

## static 상태 초기화 {#reset-static-state}
도메인 리로드가 없으면 이전 플레이의 static 값과 이벤트 구독이 그대로 남습니다.

```csharp
public static class ScoreManager
{
    public static int Score;
    public static event Action<int> OnScoreChanged;

    public static void Add(int value)
    {
        Score += value;
        OnScoreChanged?.Invoke(Score);
    }
}
// 두 번째 플레이 : 이전 Score 유지, 파괴된 UI 핸들러 호출
```

지금 버전에서는 `RuntimeInitializeOnLoadMethod` 로 플레이 시작 시 직접 초기화합니다.

```csharp
public static class ScoreManager
{
    public static int Score;
    public static event Action<int> OnScoreChanged;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    static void ResetStatics()
    {
        Score = 0;
        OnScoreChanged = null;
    }
}
```

CoreCLR 버전에서는 타입이나 static 멤버에 `[AutoStaticsCleanup]` 을 붙이면 유니티가 정리해 줍니다. 네임스페이스는 원문에 나와 있지 않아 6.8 문서를 확인해야 합니다.

```csharp
[AutoStaticsCleanup] // Unity 6.8+
public static class ScoreManager
{
    public static int Score;
    public static event Action<int> OnScoreChanged;
}
```

## 코드 리로드 이벤트 {#code-reload-events}
`AppDomain.CurrentDomain.DomainUnload` 는 코드 리로드 때 더 이상 호출되지 않습니다. 네이티브 핸들, 스레드, 파일 핸들 같은 리소스 정리는 유니티의 라이프사이클 어트리뷰트로 옮기세요.

```csharp
// 기존
AppDomain.CurrentDomain.DomainUnload += (_, _) => NativePlugin.Shutdown();

// CoreCLR
[Unity.Scripting.LifecycleManagement.AfterCodeReloadSerialization]
static void CleanupResources()
{
    NativePlugin.Shutdown();
}
```

어셈블리를 내리기 직전에 실행할 코드는 `[BeforeCodeUnloading]` 을 붙인 static 메서드에 둡니다. 수정된 타입을 static 으로 계속 참조하고 있으면 어셈블리가 언로드되지 못하고, 일정 시간이 지나면 유니티가 leak 된 `AssemblyLoadContext` 로 알려 줍니다.

## 컨테이너에 남는 숨은 참조 {#hidden-references-in-containers}
직접 만든 컨테이너가 꺼낸 자리를 비우지 않으면, 쓰지 않는 객체를 계속 붙잡아 GC 와 어셈블리 언로드를 막습니다.

```csharp
public class CustomStack<T>
{
    private T[] storage;
    private int count;

    public CustomStack(int capacity) => storage = new T[capacity];

    public void Push(T item) => storage[count++] = item;

    // 문제 : 배열에 참조 남음
    public T PopLeaky() => storage[--count];

    // 수정 : 꺼낸 자리 비우기
    public T Pop()
    {
        T result = storage[--count];
        storage[count] = default;
        return result;
    }
}
```

`List<T>`, `Stack<T>` 같은 표준 컬렉션은 이미 이렇게 동작합니다. `System.Buffers.MemoryPool<T>` 같은 저수준 타입은 비워 주지 않으므로 반납 전에 버퍼를 지우세요. `ArrayPool<T>` 라면 `Return(array, clearArray: true)` 를 쓰면 됩니다.

## static 생성자 실행 순서 {#static-constructor-order}
CoreCLR 에서는 static 생성자가 메서드가 처음 JIT 될 때가 아니라 static 데이터에 처음 접근할 때 실행됩니다. 실행 순서가 달라질 수 있고, **메인 스레드가 아닌 백그라운드 스레드에서 실행될 수도 있습니다.** static 생성자 안에서 유니티 API 를 호출하거나 다른 static 생성자의 실행 순서에 기대는 코드는 위험합니다.

```csharp
public static class GameConfig
{
    public static readonly float Gravity;

    static GameConfig()
    {
        // 위험 : 백그라운드 스레드면 유니티 API 실패
        Gravity = Resources.Load<ConfigAsset>("Config").gravity;
    }
}
```

초기화 시점을 정해야 한다면 원하는 곳에서 직접 실행시킵니다.

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
static void Init()
{
    System.Runtime.CompilerServices.RuntimeHelpers.RunClassConstructor(typeof(GameConfig).TypeHandle);
}
```

가장 안전한 방법은 유니티 API 가 필요한 초기화를 static 생성자에서 빼서 명시적인 `Init` 메서드로 옮기는 것입니다.

---
# API 변경 {#api-changes}

## BinaryFormatter
`BinaryFormatter` 는 보안 문제로 .NET 10 에서 사용 중단(obsolete)되었습니다. 세이브 파일을 `BinaryFormatter` 로 저장하고 있다면 교체해야 하고, **기존 세이브 데이터를 새 포맷으로 옮기는 변환 경로**도 미리 준비해야 합니다.

```csharp
// 기존
var formatter = new BinaryFormatter();
using (var stream = File.Create(path))
    formatter.Serialize(stream, saveData);

// 대안 1 : JsonUtility
File.WriteAllText(path, JsonUtility.ToJson(saveData));

// 대안 2 : BinaryWriter 로 직접 쓰기
using var writer = new BinaryWriter(File.Create(path));
writer.Write(saveData.Level);
writer.Write(saveData.Gold);
```

원문은 `JsonUtility`, `DataContractSerializer`, `System.Text.Json`, `BinaryReader`/`BinaryWriter` 를 대안으로 제시합니다.

## 어셈블리 API {#assembly-apis}

| 기존 | CoreCLR |
|---|---|
| `Assembly.Location` | 빈 문자열을 리턴합니다. `Assembly.GetLoadedAssemblyPath()` (6.8+) 사용 |
| `AppDomain.CurrentDomain.GetAssemblies()` | 경고 발생. `UnityEngine.Assemblies.CurrentAssemblies.GetLoadedAssemblies()` 사용 |
| 일부 `Assembly.Load` 오버로드 | 컴파일 에러. `CurrentAssemblies.LoadFromPath`, `CurrentAssemblies.LoadFromBytes`, `Assembly.Load(AssemblyName)` 사용 |

```csharp
// 기존 : 인터페이스 구현 타입 찾기
var types = AppDomain.CurrentDomain.GetAssemblies()
    .SelectMany(a => a.GetTypes())
    .Where(t => typeof(ICommand).IsAssignableFrom(t));

// CoreCLR
var types = UnityEngine.Assemblies.CurrentAssemblies.GetLoadedAssemblies()
    .SelectMany(a => a.GetTypes())
    .Where(t => typeof(ICommand).IsAssignableFrom(t));
```

에디터 코드라면 `UnityEditor.TypeCache.GetTypesDerivedFrom<ICommand>()` 를 쓰는 것이 더 빠르고 런타임 변경의 영향도 받지 않습니다.

## 인터페이스 재구현 {#interface-reimplementation}
부모 클래스가 인터페이스를 명시적으로 구현하고 자식 클래스가 같은 이름의 virtual 메서드를 override 한 경우, Mono 와 CoreCLR 이 서로 다른 메서드를 호출합니다.

```csharp
interface IInteractable { void Interact(); }

class Door : IInteractable
{
    void IInteractable.Interact() => Debug.Log("Door");   // Mono 는 이것을 호출
    public virtual void Interact() { }
}

class LockedDoor : Door
{
    public override void Interact() => Debug.Log("Locked"); // CoreCLR 은 이것을 호출
}

((IInteractable)new LockedDoor()).Interact();
```

자식 클래스에 인터페이스를 다시 적어 주면(`class LockedDoor : Door, IInteractable`) 어느 쪽에서든 의도가 분명해집니다. 애초에 이런 구조를 만들지 않는 것이 가장 좋습니다.

## 접근성 검사와 오버플로 검사 {#access-and-overflow-checks}
CoreCLR 은 접근성을 더 엄격하게 검사해서, Mono 에서는 넘어가던 경우에 `MethodAccessException` 이 날 수 있습니다. 리플렉션으로 private 멤버에 접근하는 것은 영향이 없습니다.

또 여러 System 타입이 `checked` 변환을 써서 `OverflowException` 을 던질 수 있습니다.

```csharp
IntPtr handle = GetNativeHandle();
int value = handle.ToInt32(); // 64비트 : OverflowException 가능

long safe = handle.ToInt64(); // long / nint 로 받기
```

## 텍스트 인코딩 {#text-encodings}
기본으로 등록된 인코딩이 줄었습니다. ASCII 와 Unicode 계열은 그대로지만 Windows-1252, EUC-KR(949) 같은 코드 페이지 인코딩은 등록이 필요합니다. 오래된 CSV 나 레거시 서버 데이터를 읽는 코드를 확인하세요.

```csharp
// 등록 없이 호출하면 예외
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
var euckr = Encoding.GetEncoding(949);
string text = euckr.GetString(bytes);
```

## 문자열 해시와 로케일 {#string-hash-and-locale}
`string.GetHashCode()` 값은 프로세스마다 달라질 수 있습니다. 해시값을 저장하거나, 서버와 비교하거나, 실행할 때마다 같은 값을 기대하는 코드는 고쳐야 합니다.

```csharp
// 위험 : 실행마다 값이 다름
PlayerPrefs.SetInt("SaveKey", playerName.GetHashCode());

// 고정 해시 : 직접 계산
static uint Fnv1a(string s)
{
    uint hash = 2166136261;
    foreach (char c in s)
        hash = (hash ^ c) * 16777619;
    return hash;
}
```

로케일 문자열은 RFC 4646 형식을 따라야 합니다. `"fr"` 대신 `"fr-FR"`, `"ko"` 대신 `"ko-KR"` 처럼 지역까지 지정하세요.

```csharp
var culture = new CultureInfo("ko-KR");
```

## 부동소수점 결과 {#floating-point}
CoreCLR 은 IEEE 754 를 따르기 때문에 Mono JIT 와 계산 결과가 미세하게 다를 수 있습니다. 락스텝 멀티플레이나 리플레이처럼 결정론(deterministic)적인 결과에 기대는 코드는 다시 테스트해야 합니다. IL2CPP 와 Burst(기본 `FloatMode.Strict`)는 영향이 없습니다.

## Mono 전용 기능 {#mono-specific-features}
* `MonoPosixHelper.dll` 같은 Mono 라이브러리가 포함되지 않습니다. 이런 라이브러리를 P/Invoke 하는 코드는 컴파일은 되지만 실행할 때 `DllNotFoundException` 이 납니다. 프로젝트에서 `DllImport("MonoPosixHelper")` 같은 코드를 검색해 보세요.
* `UnityEditor.Scripting.ManagedDebugger` 는 지원하지 않습니다. `System.Diagnostics.Debugger` 를 쓰세요.

```csharp
// 기존
if (UnityEditor.Scripting.ManagedDebugger.isAttached) { }

// CoreCLR
if (System.Diagnostics.Debugger.IsAttached) { }
```

## Burst 함수 포인터 {#burst-function-pointers}
* `FunctionPointer<T>.Invoke` 에 쓰는 델리게이트 타입과 시그니처의 모든 타입은 `public` 이나 `internal` 이어야 합니다. 아니면 `UAC2016` 컴파일 에러가 납니다.
* `UncheckedInvoke` 에서 예외가 나면 CoreCLR 에서는 로그만 남기고 정의되지 않은 값을 리턴합니다.
* 네이티브 프레임(Burst 코드나 C++)을 넘어가는 관리 예외는 전파되지 않고, 플랫폼에 따라 프로세스가 종료될 수 있습니다.

```csharp
[BurstCompile]
public class DamageCalculator
{
    // private 이면 UAC2016 에러
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    internal delegate int CalculateDelegate(int value);

    [BurstCompile]
    private static int Calculate(int value) => value < 0 ? 0 : value * 2;

    public static int Run(int value)
    {
        var fp = BurstCompiler.CompileFunctionPointer<CalculateDelegate>(Calculate);
        return fp.Invoke(value);
    }
}
```

## 사전 컴파일된 어셈블리 {#precompiled-assemblies}
.NET Standard 2.1 이 아닌 다른 TFM(예 : `net472`, `net6.0`)을 대상으로 빌드된 DLL 은 6.8 에서 동작하지 않을 수 있습니다. `Assets/Plugins` 의 서드파티 DLL 과 사내 라이브러리의 대상 프레임워크를 확인하고, `netstandard2.1` 로 다시 빌드하거나 최신 버전으로 교체하세요.

---
# 마이그레이션 순서 {#migration-steps}
1. **Fast Enter Play Mode 를 켜고** Project Auditor 로 도메인 리로드 문제를 찾습니다.
2. static 상태 초기화 코드를 추가하고, `DomainUnload` 를 쓰는 코드를 찾아 둡니다.
3. `BinaryFormatter` 를 교체하고 기존 세이브 데이터 변환 경로를 만듭니다.
4. 사전 컴파일된 DLL 의 TFM 을 확인합니다.
5. `Assembly.Location`, `GetAssemblies`, `Assembly.Load`, `ManagedDebugger` 사용처를 정리합니다.
6. static 생성자, 커스텀 컨테이너, 인터페이스 재구현, 인코딩, 로케일, 해시 의존 코드를 점검합니다.
7. Burst 함수 포인터 델리게이트의 접근 한정자를 확인합니다.
8. 6.7 alpha 의 실험용 CoreCLR 플레이어로 빌드해 보고, 부동소수점에 민감한 결과를 비교합니다. 실제 출시 빌드에는 쓰지 마세요.

1, 2번은 지금 Unity 6.0 에서도 할 수 있고, 런타임과 상관없이 플레이 모드 진입 속도도 빨라지니 먼저 시작하는 것을 추천합니다.

---
참고사이트
* [Path to CoreCLR, 2026: Upgrade Guide](https://discussions.unity.com/t/path-to-coreclr-2026-upgrade-guide/1714279)
* [Unity Manual - Configurable Enter Play Mode](https://docs.unity3d.com/Manual/ConfigurableEnterPlayMode.html)
* [Project Auditor](https://docs.unity3d.com/Packages/com.unity.project-auditor@latest)
* [BinaryFormatter security guide](https://learn.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide)
