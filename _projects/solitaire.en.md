---
layout: project
slug: solitaire
title: Solitaire
subtitle: A classic card game made with Unity
status: Live
order: 1
image: /assets/portfolio/solitaire/feature-graphic.png
image_alt: Solitaire feature graphic
tech: [Unity 6.3 LTS, C#, VContainer, R3, UniTask, MemoryPack, Addressables, GitHub Actions]
links:
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.mangru.solitaire
  - label: itch.io
    url: https://rumaniel.itch.io/solitaire-tower
  - label: GitHub
    url: https://github.com/rumaniel/solitaire
permalink: /portfolio/solitaire/
lang: en
page_id: project-solitaire
---

A mobile solitaire game supporting Klondike and Easthaven rule sets. The core design decision is to **enforce Clean Architecture at the assembly (asmdef) boundary** so that domain logic is fully decoupled from Unity. The game is live on Google Play and itch.io. Core mechanics — shuffle seeding, hint ordering, auto-win detection — are pure C# and unit-tested with NUnit.

## At a glance

| Property | Value |
| --- | --- |
| Runtime assemblies | 9 (App · Scene · Component · Service · Gateway · Core · Data · Model · Shared) |
| Business services | 9 (Game / Card / Hint / Audio / Route / User / Stats / Snapshot, etc.) |
| EditMode tests | 41 files across domain · service · gateway layers |
| Rule sets | Klondike, Easthaven |
| Platforms | Android (Google Play), Web (itch.io) |
| CI/CD | GitHub Actions (self-hosted macOS) → EditMode tests → AAB signing → Play Console upload |

## Architecture

The 9 asmdefs are stacked into layers with a single direction of dependency. **The `Model` assembly references no Unity assemblies at all**, which keeps domain logic verifiable with a one-liner NUnit test. All external I/O (persistence, Firebase, Play Games) terminates in `Gateway`; business rules terminate in `Service`; MonoBehaviours only live in `Component` / `Scene`.

{% include architecture-onion.html lang="en" %}

### Layer responsibilities

- **App** — A single VContainer `LifetimeScope` composes the whole dependency graph. No logic beyond bootstrap.
- **Scene** — Login / Lobby / Ingame as MVP. Presenters issue commands to services and subscribe to model changes via R3.
- **Component** — Visual concerns only: card drag, anchors, effects. No domain decisions live here.
- **Service** — Game rules, hints, auto-win, stats, audio, etc. When external I/O is needed, services depend on `Gateway` interfaces, not implementations.
- **Gateway** — The boundary for everything that touches the outside: Firebase, Play Games, local snapshots.
- **Model** — `PlayingCard`, `PileState`, `TableState`, and friends. **Zero `UnityEngine` references.**
- **Data** — Rule sets, score tables expressed as ScriptableObjects, so content can be tuned without a code build.

## Pure domain model

The innermost assembly, `Model`, has no idea Unity exists. Cards, piles, and table state are modeled as value objects with proper `IEquatable<T>` / `GetHashCode`, so they slot into collections and tests naturally.

```csharp
// Model/Card/PlayingCard.cs
namespace Model.Card
{
    /// <summary>
    /// Pure domain model representing a playing card without Unity dependencies.
    /// </summary>
    public class PlayingCard : IEquatable<PlayingCard>
    {
        public Rank Rank { get; private set; }
        public Suit Suit { get; private set; }

        public PlayingCard(Rank rank, Suit suit)
        {
            Rank = rank;
            Suit = suit;
        }

        public bool Equals(PlayingCard other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return Rank == other.Rank && Suit == other.Suit;
        }

        public override int GetHashCode() => HashCode.Combine(Rank, Suit);
    }
}
```

## Game state as immutable data

A pile's state is exposed as `IReadOnlyList`, so callers cannot mutate it. Board queries (e.g. "is this index face-up?") are surfaced as domain methods, which prevents clients from re-implementing the same rule.

```csharp
// Model/Game/PileState.cs (essence)
public class PileState : IEquatable<PileState>
{
    public PileId Id { get; }
    public IReadOnlyList<PlayingCard> Cards { get; }
    public int FaceUpFromIndex { get; }

    public PileState(PileId id, List<PlayingCard> cards, int faceUpFromIndex)
    {
        if (cards == null) throw new ArgumentNullException(nameof(cards));
        Id = id;
        Cards = cards.AsReadOnly();
        FaceUpFromIndex = faceUpFromIndex;
    }

    public bool IsFaceUp(int index) => index >= FaceUpFromIndex;
}
```

## Deterministic hints via stable sort

A hint engine that emits different moves for the same board ruins both player learning and automated testing. To guarantee the same input → same suggestion in the same order, the comparator builds a **strict total ordering** out of seven comparison keys.

```csharp
// Service/HintService/HintService.cs
public IReadOnlyList<HintMove> GetHints(TableState state)
{
    var moves = MoveEnumerator.FindAllMoves(state, cardService, dealRule);
    // Strict total ordering — deterministic across platforms/runs
    moves.Sort((a, b) =>
    {
        int cmp = b.Priority.CompareTo(a.Priority);                            if (cmp != 0) return cmp;
        cmp = ((int)a.MoveType).CompareTo((int)b.MoveType);                    if (cmp != 0) return cmp;
        cmp = ((int)a.Request.SourcePileId.Type).CompareTo((int)b.Request.SourcePileId.Type); if (cmp != 0) return cmp;
        cmp = a.Request.SourcePileId.Index.CompareTo(b.Request.SourcePileId.Index);            if (cmp != 0) return cmp;
        cmp = a.Request.SourceIndex.CompareTo(b.Request.SourceIndex);                          if (cmp != 0) return cmp;
        cmp = ((int)a.Request.TargetPileId.Type).CompareTo((int)b.Request.TargetPileId.Type);  if (cmp != 0) return cmp;
        return a.Request.TargetPileId.Index.CompareTo(b.Request.TargetPileId.Index);
    });
    return moves;
}
```

Because hint output is reproducible across runtimes, golden-file NUnit tests still pass on every platform.

## Shuffling: reproducible + cryptographically seeded

Two requirements pull in opposite directions: replays must be reproducible, but a fresh game's deal must not be predictable. The shuffle uses **seeded Fisher–Yates**, while the seed itself comes from **`RandomNumberGenerator`**, not `System.Random`.

```csharp
// Service/GameService/DeckFactory.cs
public static List<PlayingCard> CreateShuffled(int seed)
{
    var deck = CreateOrdered();
    var rng = new Random(seed);
    for (int i = deck.Count - 1; i > 0; i--)
    {
        int j = rng.Next(i + 1);
        (deck[i], deck[j]) = (deck[j], deck[i]);
    }
    return deck;
}

public static int CreateRandomSeed()
{
    var bytes = new byte[4];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(bytes);
    return BitConverter.ToInt32(bytes, 0);
}
```

A stored seed reproduces an exact deal; a fresh seed avoids the monotonic patterns a `System.Random` default seed would produce.

## Performance: prune useless moves

The hint engine enumerates every legal move, but moves that don't advance the board — like sliding a King into a different empty column — are removed before sorting. Each pruned candidate is a comparator pass saved on the mobile frame budget.

```csharp
// Service/HintService/MoveEnumerator.cs
private static bool IsUselessKingMove(PileState source, int sourceIndex, PileState target)
{
    if (target.Cards.Count > 0) return false;                          // only prune moves into empty piles
    if (source.Cards[sourceIndex].Rank != Rank.King) return false;     // must be a King
    if (sourceIndex != source.FaceUpFromIndex) return false;           // must be the bottom face-up card
    if (sourceIndex > 0) return false;                                 // a face-down card below means a reveal — useful
    return true;                                                       // King stack to empty column — pointless
}
```

The enumerator is also written cheap-checks-first, so the common "can the player do *anything*?" query short-circuits on the first viable move.

## Addressables: optional assets behind a Gateway

Card skins and per-language string tables are **optional and language-specific** — there's no reason to hold them in memory from launch. Addressables (2.4) splits them into per-domain groups, and game code only sees a thin Gateway over the top.

### Asset groups

Splitting by domain means a player who picks one skin never loads the other, and a Korean user doesn't ship the English string tables into RAM.

- **Skins** — card sprite sets (`skin/classic`, `skin/plain`), labelled `skin`
- **Localization-Locales** — English · Korean · Pseudo
- **Localization-String-Tables-English / -Korean** — UI · Achievements · Share. The startup-critical ones carry the `Preload` label so they come in with the locale.
- **Localization-Assets-Shared** — fonts and textures shared across locales
- **Default Local Group** — fallback

### Game code only sees the Gateway

`AssetReferenceT<CardSpriteSet>` lives in the inspector, and **the gateway absorbs every Addressables call**. The Service layer only sees `LoadAsync(reference) / Release(reference)`.

```csharp
// Gateway/Skin/AddressableSkinAssetGateway.cs
public class AddressableSkinAssetGateway : ISkinAssetGateway
{
    private readonly Dictionary<CardSpriteSetReference,
        AsyncOperationHandle<CardSpriteSet>> handles = new();

    public async UniTask<CardSpriteSet> LoadAsync(CardSpriteSetReference reference)
    {
        // A second call for the same reference awaits the in-flight handle.
        // This both avoids LoadAssetAsync's "already loaded" error
        // and prevents reference.Asset from being read as null mid-load.
        if (handles.TryGetValue(reference, out var existing))
            return await existing.ToUniTask();

        var handle = reference.LoadAssetAsync<CardSpriteSet>();
        handles[reference] = handle;
        try
        {
            return await handle.ToUniTask();
        }
        catch
        {
            // On failure, drop the cache entry and release the internal handle
            // so a retry can issue a fresh LoadAssetAsync from a clean state.
            handles.Remove(reference);
            reference.ReleaseAsset();
            throw;
        }
    }

    public void Release(CardSpriteSetReference reference)
    {
        if (!handles.Remove(reference)) return;
        reference.ReleaseAsset();
    }
}
```

Three details worth pointing out:

- **In-flight handle sharing** — concurrent requests for the same asset all await one handle. No second `LoadAssetAsync`, no leak, no "already loaded" error.
- **Self-cleanup on failure** — the `catch` clears the cache entry *and* the underlying handle, so retries don't get stuck in a half-loaded state.
- **Explicit Release** — when the Service swaps to a new skin, it has to release the previous one. Addressables is reference-counted; forgetting this is a leak you ship to production.

### Localization rides the same path

`com.unity.localization` is configured to load string tables through Addressables, so they inherit the same lifecycle. Only tables tagged `Preload` come in at startup; secondary screens like Achievements load their tables on first entry, which keeps both initial memory and cold-start time down.

### Local bundles today, remote ready by interface

Today everything ships as **local bundles inside the app**. Splitting to a remote CDN is parked until the content cadence justifies the operational tax. The point is that game code talks to the Gateway, not to Addressables, so the switch lands behind one implementation.

## Screenshots

![Lobby](/assets/portfolio/solitaire/screenshots/01-lobby.png)

![Mid-game](/assets/portfolio/solitaire/screenshots/02-midgame.png)

![Hint overlay](/assets/portfolio/solitaire/screenshots/04-hint.png)

![Win panel](/assets/portfolio/solitaire/screenshots/06-win-panel.png)

![Stats screen](/assets/portfolio/solitaire/screenshots/07-stats.png)

## Testing & CI/CD

- **41 EditMode test files** — NUnit suites cover shuffle distribution, legal-move validation, hint ordering, auto-win detection, scoring, and lifetime stats accumulation across the domain and service layers.
- **GitHub Actions (self-hosted macOS)** — Every PR is gated on EditMode tests + Android build validation; merges to main trigger AAB signing and a Play Console draft upload.
- **Release notes generated from PR titles** — Changelog is assembled from merged PRs and uploaded with each Play Console draft, so build numbers track the source of every change.

## Decisions worth calling out

- **Core game logic stays synchronous and pure C#.** A turn-based card game has no good reason to be async. R3 and UniTask are used at the edges — UI, network, persistence — while the board state machine stays sync so it remains reproducible and debuggable.
- **Content is data, rules are code.** Rule sets and score tables are ScriptableObjects (`Data`); the engine that interprets them is a Strategy implementation in `Service`. Designers can tune content without a code build.
- **One DI scope, on purpose.** VContainer scopes aren't split below the App layer. For this game's size, more scopes would just add complexity without bounded-context benefits.

## Try it

Install on **Google Play** or play in your browser on **itch.io** using the buttons above. The full source is on **GitHub**.
